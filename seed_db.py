import os
import json
import glob
import argparse
from google.cloud import firestore
from google.cloud.firestore_v1.vector import Vector

def load_json_file(file_path):
    print(f"Loading {file_path}...")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def seed_database(project_id, credentials_path=None):
    # Initialize Firestore client
    if credentials_path:
        print(f"Initializing Firestore client with credentials from {credentials_path}")
        db = firestore.Client.from_service_account_json(credentials_path, project=project_id)
    else:
        print(f"Initializing Firestore client with default credentials for project: {project_id}")
        db = firestore.Client(project=project_id)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_dir = os.path.join(base_dir, "db")

    if not os.path.exists(db_dir):
        raise FileNotFoundError(f"Database folder not found at: {db_dir}")

    # 1. Load raw profiles
    profiles_file = os.path.join(db_dir, "profiles.json")
    if not os.path.exists(profiles_file):
        raise FileNotFoundError(f"profiles.json not found at {profiles_file}")
    raw_profiles = load_json_file(profiles_file)
    print(f"Loaded {len(raw_profiles)} raw profiles.")

    # 2. Load profile vectors
    profile_vectors = {}
    vectors_pattern = os.path.join(db_dir, "profiles_vectors", "profiles-vectors-*.json")
    vector_files = glob.glob(vectors_pattern)
    print(f"Found {len(vector_files)} profile vector files.")
    for vf in vector_files:
        data = load_json_file(vf)
        for item in data:
            uid = str(item["uid"])
            profile_vectors[uid] = item["vector"]
    print(f"Loaded {len(profile_vectors)} profile vectors.")

    # 3. Load experience vectors
    experience_vectors = {}
    exp_pattern = os.path.join(db_dir, "experience_vectors", "vectors-*.json")
    exp_files = glob.glob(exp_pattern)
    print(f"Found {len(exp_files)} experience vector files.")
    for ef in exp_files:
        data = load_json_file(ef)
        for item in data:
            uid = str(item["uid"])
            exp_id = str(item["id"])
            if uid not in experience_vectors:
                experience_vectors[uid] = {}
            experience_vectors[uid][exp_id] = item["vector"]
    print(f"Loaded experience vectors for {len(experience_vectors)} users.")

    # 4. Load values vectors (taxonomy representation)
    values_data = {}
    values_file = os.path.join(db_dir, "values-vector.json")
    if os.path.exists(values_file):
        data = load_json_file(values_file)
        for item in data:
            uid = str(item["meta"]["uid"])
            values_data[uid] = {
                "domains": item["core_values"]["domains"],
                "items": {f"d{idx+1}": val for idx, val in enumerate(item["core_values"]["items"])},
                "conflict_resolution": item["conflict_resolution"],
                "contextual_shifts": item["contextual_shifts"]
            }
        print(f"Loaded values taxonomy vectors for {len(values_data)} users.")
    else:
        print("Warning: values-vector.json not found. Users will be loaded without values vectors.")

    # 4.5 Load values text descriptions (Issue 4 description)
    values_text = {}
    values_text_file = os.path.join(db_dir, "values1-1025text.json")
    if os.path.exists(values_text_file):
        data = load_json_file(values_text_file)
        for item in data:
            uid = str(item["uid"])
            if item.get("values_description"):
                values_text[uid] = item["values_description"]
        print(f"Loaded {len(values_text)} text descriptions.")
    else:
        print("Warning: values1-1025text.json not found.")

    # 5. Load discussions
    discussions_file = os.path.join(db_dir, "discussions.json")
    discussions = {}
    if os.path.exists(discussions_file):
        discussions = load_json_file(discussions_file)
        print(f"Loaded {len(discussions)} discussion threads.")
    else:
        print("Warning: discussions.json not found.")

    # ========================================================
    # 6. Upload Combined User Profiles to Firestore
    # ========================================================
    print("\nStarting user profiles upload...")
    batch = db.batch()
    count = 0
    total_written = 0
    packed_users = []

    for uid, profile in raw_profiles.items():
        if uid not in values_data:
            continue
        # Clean up key fields
        email = profile.get("email", f"user{uid}@example.com")
        display_name = profile.get("displayName", f"User {uid}")

        user_doc = {
            "uid": int(uid),
            "email": email,
            "displayName": display_name,
            "firstName": profile.get("firstName", ""),
            "lastName": profile.get("lastName", ""),
            "gender": profile.get("gender", ""),
            "nationality": profile.get("nationality", ""),
            "birthDate": profile.get("birthDate", ""),
            "post": profile.get("post", []),
            "skills": profile.get("skills", []),
            "geography": profile.get("geography", []),
            "socialRelations": profile.get("social relations", []),
            "features": profile.get("features", [])
        }

        # Attach values taxonomy data if exists
        if uid in values_data:
            user_doc["values_taxonomy"] = values_data[uid]

        # Attach values description if exists
        if uid in values_text:
            user_doc["values_description"] = values_text[uid]

        # Collect metadata for packed_users
        meta = {
            "uid": int(uid),
            "displayName": display_name,
            "birthDate": profile.get("birthDate", ""),
            "gender": profile.get("gender", ""),
            "post": profile.get("post", []),
            "skills": profile.get("skills", []),
            "geography": profile.get("geography", []),
            "socialRelations": profile.get("social relations", []),
            "features": profile.get("features", [])
        }
        packed_users.append(meta)

        # Write metadata to users collection
        doc_ref = db.collection("users").document(uid)
        batch.set(doc_ref, user_doc)
        count += 1
        total_written += 1

        # Write vectors separately to user_vectors
        vector_doc = {"uid": int(uid)}
        has_vectors = False

        if uid in profile_vectors:
            vector_doc["profile_vector"] = Vector(profile_vectors[uid])
            has_vectors = True

        if uid in experience_vectors:
            exp_vecs = {}
            for exp_id, vec in experience_vectors[uid].items():
                exp_vecs[exp_id] = Vector(vec)
            vector_doc["experience_vectors"] = exp_vecs
            has_vectors = True

        if has_vectors:
            vector_ref = db.collection("user_vectors").document(uid)
            batch.set(vector_ref, vector_doc)
            count += 1

        if count >= 400:  # Stay below 500 Firestore batch limit
            print(f"Writing batch... Total uploaded: {total_written}")
            batch.commit()
            batch = db.batch()
            count = 0

    if count > 0:
        print(f"Writing final batch... Total uploaded: {total_written}")
        batch.commit()

    # Upload user packs
    print("\nStarting user packs upload...")
    pack_size = 250
    chunks = [packed_users[i:i + pack_size] for i in range(0, len(packed_users), pack_size)]
    batch = db.batch()
    for idx, chunk in enumerate(chunks, 1):
        pack_id = f"pack_{idx}"
        pack_ref = db.collection("user_packs").document(pack_id)
        batch.set(pack_ref, {
            "pack_id": idx,
            "users": chunk
        })
        print(f"Prepared user_packs doc: {pack_id} with {len(chunk)} users.")
    batch.commit()
    print("User packs uploaded successfully.")

    # ========================================================
    # 7. Upload Discussions and Chat Threads
    # ========================================================
    if discussions:
        print("\nStarting discussions upload...")
        total_threads = 0
        
        for disc_id, messages in discussions.items():
            if not messages:
                continue
            
            # Find the root message to get topic title and metadata
            root_msg = messages[0]
            topic = root_msg.get("topic", f"Discussion Thread {disc_id}")
            creator_uid = root_msg.get("uid", "admin")
            created_at = root_msg.get("timestamp", "2026-01-01T00:00:00")

            # Collect unique participants (both string and int representation)
            participants = set()
            for msg in messages:
                uid = msg.get("uid")
                if uid:
                    participants.add(str(uid))
                    try:
                        participants.add(int(uid))
                    except ValueError:
                        pass

            # Create main discussion document
            last_msg = messages[-1] if messages else {}
            last_uid = last_msg.get("uid", "system")
            last_uid_str = str(last_uid)
            
            # Resolve sender display name
            last_sender_name = "System"
            if last_uid_str != "system" and last_uid_str in raw_profiles:
                last_sender_name = raw_profiles[last_uid_str].get("displayName", f"User {last_uid_str}")
            elif last_uid_str != "system":
                last_sender_name = f"User {last_uid_str}"
                
            disc_doc = {
                "discussion_id": int(disc_id),
                "topic": topic,
                "creator_uid": creator_uid,
                "created_at": created_at,
                "message_count": len(messages),
                "participants": list(participants),
                "last_message_text": last_msg.get("text", ""),
                "last_message_sender_uid": str(last_uid),
                "last_message_sender_name": last_sender_name,
                "last_message_timestamp": last_msg.get("timestamp", created_at)
            }
            
            disc_ref = db.collection("discussions").document(str(disc_id))
            disc_ref.set(disc_doc)
            total_threads += 1

            # Upload subcollection messages in batches
            msg_batch = db.batch()
            msg_count = 0
            
            for idx, msg in enumerate(messages):
                msg_id = idx + 1
                msg_doc = {
                    "id": msg_id,
                    "uid": msg.get("uid"),
                    "text": msg.get("text", ""),
                    "timestamp": msg.get("timestamp", ""),
                    "marks": msg.get("marks", []),
                    "child": msg.get("child", [])
                }
                if "parentID" in msg:
                    msg_doc["parentID"] = msg["parentID"]

                msg_ref = disc_ref.collection("messages").document(str(msg_id))
                msg_batch.set(msg_ref, msg_doc)
                msg_count += 1

                if msg_count >= 400:
                    msg_batch.commit()
                    msg_batch = db.batch()
                    msg_count = 0
            
            if msg_count > 0:
                msg_batch.commit()

        print(f"Successfully uploaded {total_threads} discussion threads and their messages.")

    print("\nDatabase Seeding Completed Successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Firestore Database with ISR-vote profiles and vectors.")
    parser.add_argument("--project-id", required=True, help="Google Cloud Project ID")
    parser.add_argument("--credentials", help="Path to Google Service Account JSON file (optional if using ADC)")
    args = parser.parse_args()

    seed_database(args.project_id, args.credentials)
