import os
import json
import argparse
import time
import datetime
from google.cloud import firestore
from pipeline import run_vectorization_pipeline, QuotaExhaustedError

class ProgressTracker:
    def __init__(self, file_path, total_count):
        self.file_path = file_path
        self.total_count = total_count
        self.processed = 0
        self.success = 0
        self.failure = 0
        self.status = "running"
        self.start_time = datetime.datetime.utcnow().isoformat() + "Z"
        self.details = []
        self.current_uid = None
        self._load_existing()

    def _load_existing(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.processed = data.get("processed_profiles", 0)
                    self.success = data.get("success_count", 0)
                    self.failure = data.get("failure_count", 0)
                    self.details = data.get("details", [])
                    self.start_time = data.get("start_time", self.start_time)
            except Exception:
                pass

    def update(self, uid, name, status, error_msg=None):
        self.processed += 1
        if status == "success":
            self.success += 1
        else:
            self.failure += 1
            
        detail = {
            "uid": uid,
            "name": name,
            "status": status,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        if error_msg:
            detail["error"] = str(error_msg)
            
        self.details.append(detail)
        self.save()

    def set_current(self, uid):
        self.current_uid = uid
        self.save()

    def set_status(self, status):
        self.status = status
        self.save()

    def save(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        data = {
            "total_profiles": self.total_count,
            "processed_profiles": self.processed,
            "success_count": self.success,
            "failure_count": self.failure,
            "status": self.status,
            "current_uid": self.current_uid,
            "start_time": self.start_time,
            "last_update": datetime.datetime.utcnow().isoformat() + "Z",
            "details": self.details
        }
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

def format_for_firestore(pipeline_vector):
    core_values = pipeline_vector.get("core_values", {})
    domains = core_values.get("domains", [])
    items_list = core_values.get("items", [])
    
    domain_item_counts = {
        0: 18,  # Domain 1
        1: 17,  # Domain 2
        2: 8,   # Domain 3
        3: 18,  # Domain 4
        4: 6,   # Domain 5
        5: 6,   # Domain 6
        6: 21,  # Domain 7
        7: 18,  # Domain 8
        8: 6,   # Domain 9
        9: 27   # Domain 10
    }
    
    items_dict = {}
    for idx in range(10):
        key = f"d{idx+1}"
        expected_len = domain_item_counts[idx]
        val = None
        if idx < len(items_list):
            val = items_list[idx]
        
        if val is None:
            val = [None] * expected_len
        elif isinstance(val, list):
            if len(val) < expected_len:
                val = val + [None] * (expected_len - len(val))
            elif len(val) > expected_len:
                val = val[:expected_len]
        else:
            val = [None] * expected_len
            
        items_dict[key] = val
        
    return {
        "conflict_resolution": pipeline_vector.get("conflict_resolution", []),
        "contextual_shifts": pipeline_vector.get("contextual_shifts", {}),
        "domains": domains,
        "items": items_dict
    }

def main():
    parser = argparse.ArgumentParser(description="Vectorize user values narratives according to ISR protocol v1.0")
    parser.add_argument("--key", "-k", help="Gemini API Key (overrides GEMINI_API_KEY environment variable)")
    parser.add_argument("--limit", "-l", type=int, default=100, help="Maximum profiles to process (default 100)")
    parser.add_argument("--model", "-m", default="gemini-flash-latest", help="Gemini model name (default gemini-flash-latest)")
    parser.add_argument("--dry-run", action="store_true", help="If set, only print candidate list and exit")
    parser.add_argument("--delay", type=float, default=6.0, help="Delay in seconds between API calls to avoid rate limits (default 6.0)")
    args = parser.parse_args()

    # Get API key
    api_key = args.key or os.environ.get("GEMINI_API_KEY")
    if not api_key and not args.dry_run:
        print("Error: GEMINI_API_KEY must be provided via --key or set as an environment variable.")
        return

    # Initialize Firestore
    project_id = "project-a3d59130-5adf-4677-9e2"
    print(f"Connecting to Firestore project: {project_id}...")
    db = firestore.Client(project=project_id)

    # Query all users with values descriptions
    print("Querying users with values descriptions...")
    users_stream = db.collection("users").where("values_description", "!=", "").stream()
    
    candidates = []
    for doc in users_stream:
        data = doc.to_dict()
        uid = str(data.get("uid"))
        desc = data.get("values_description")
        taxonomy = data.get("values_taxonomy")
        
        # If no taxonomy is set, it needs vectorization
        if desc and not taxonomy:
            candidates.append({
                "uid": uid,
                "displayName": data.get("displayName", f"User {uid}"),
                "description": desc
            })

    total_candidates = len(candidates)
    print(f"Found {total_candidates} users in Firestore needing vectorization.")
    
    if total_candidates == 0:
        print("No users need vectorization. Exiting.")
        return

    # Sort candidates by UID for predictability
    candidates.sort(key=lambda x: int(x["uid"]))

    # Apply limit
    limit = min(args.limit, total_candidates)
    candidates_to_process = candidates[:limit]
    print(f"Will process the first {limit} profiles.")

    if args.dry_run:
        print("\nDry-run Mode: Listing candidate profiles...")
        for c in candidates_to_process:
            print(f"- UID {c['uid']}: {c['displayName']} ({len(c['description'])} chars)")
        print("\nDry-run complete. No changes made.")
        return

    # Create backup backup file
    backup_file = "db/vectorized_backup.json"
    backup_data = {}
    if os.path.exists(backup_file):
        try:
            with open(backup_file, "r", encoding="utf-8") as f:
                backup_data = json.load(f)
        except Exception:
            pass

    # Initialize progress tracker
    progress_file = "db/vectorization_progress.json"
    tracker = ProgressTracker(progress_file, limit)
    tracker.set_status("running")

    print(f"\nStarting vectorization for {limit} profiles...")
    quota_exhausted = False
    
    for idx, c in enumerate(candidates_to_process):
        uid = c["uid"]
        name = c["displayName"]
        narrative = c["description"]
        
        tracker.set_current(uid)
        print(f"\n[{idx+1}/{limit}] Vectorizing UID {uid} ({name})...")
        
        try:
            # Run pipeline
            vector = run_vectorization_pipeline(uid, narrative, api_key, model=args.model)
            
            # Save to Firestore
            print(f"[{uid}] Writing taxonomy vector to Firestore...")
            firestore_vector = format_for_firestore(vector)
            db.collection("users").document(uid).update({"values_taxonomy": firestore_vector})
            
            # Save to backup
            backup_data[uid] = vector
            with open(backup_file, "w", encoding="utf-8") as f:
                json.dump(backup_data, f, indent=2)
                
            tracker.update(uid, name, "success")
            print(f"[{uid}] Successfully vectorized and written.")
            
        except QuotaExhaustedError as qe:
            print(f"\n[{uid}] Fatal: Quota Exhausted: {qe}")
            tracker.update(uid, name, "failed", error_msg="Quota Exhausted")
            tracker.set_status("quota_exhausted")
            quota_exhausted = True
            break  # Break out of the loop immediately!
            
        except Exception as e:
            print(f"[{uid}] Failed to vectorize: {e}")
            tracker.update(uid, name, "failed", error_msg=e)
            
        # Log progress status
        pct = round((idx + 1) / limit * 100, 1)
        print(f"Progress: {idx+1}/{limit} profiles ({pct}%). Success: {tracker.success}, Failed: {tracker.failure}")
            
        # Rate limit delay
        if idx < limit - 1:
            print(f"Sleeping for {args.delay}s to avoid API rate limits...")
            time.sleep(args.delay)

    if quota_exhausted:
        remaining_count = limit - tracker.success
        est_cost_batch = remaining_count * 0.000765
        est_cost_all = total_candidates * 0.000765
        print(f"\n==================================================")
        print(f"Vectorization ABORTED due to Daily/Billing API Quota exhaustion.")
        print(f"Total processed in this run: {tracker.processed} profiles.")
        print(f"--------------------------------------------------")
        print(f"COST ESTIMATE TO PROCEED WITH PAY-AS-YOU-GO:")
        print(f"  - Cost for remaining {remaining_count} profiles in this batch: ~${est_cost_batch:.4f} USD")
        print(f"  - Cost for all {total_candidates} remaining profiles in DB: ~${est_cost_all:.4f} USD")
        print(f"--------------------------------------------------")
        print(f"You can use your $299.93 general GCP 'Free Trial' credit to pay for this cost 100% free by linking your GCP project to your billing account.")
        print(f"Please notify the AI assistant in the chat once you are ready to proceed.")
        print(f"==================================================")
    else:
        tracker.set_status("completed")
        print(f"\nVectorization complete!")
        
    print(f"Successful: {tracker.success}")
    print(f"Failed: {tracker.failure}")
    print(f"Backup saved to: {backup_file}")
    print(f"Progress details saved to: {progress_file}")

if __name__ == "__main__":
    main()
