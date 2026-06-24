import os
import argparse
from google.cloud import firestore
from google.cloud.firestore_v1.vector import Vector

def migrate(project_id, credentials_path=None):
    if credentials_path:
        print(f"Initializing Firestore client with credentials from {credentials_path}")
        db = firestore.Client.from_service_account_json(credentials_path, project=project_id)
    else:
        print(f"Initializing Firestore client for project: {project_id}")
        db = firestore.Client(project=project_id)

    print(f"Connected to Firestore project: {project_id}")

    # We will paginate the user collection query to avoid timeouts.
    print("Fetching and processing users in batches...")
    users_ref = db.collection("users")
    
    packed_users = []
    total_vectors = 0
    total_users_updated = 0
    
    last_doc = None
    batch_num = 1
    
    while True:
        query = users_ref.order_by("__name__").limit(50)
        if last_doc:
            query = query.start_after(last_doc)
            
        batch_docs = list(query.stream())
        if not batch_docs:
            break
            
        print(f"Processing batch {batch_num} ({len(batch_docs)} docs)...")
        batch = db.batch()
        count = 0
        
        for doc in batch_docs:
            uid_str = doc.id
            data = doc.to_dict()
            uid = data.get("uid")

            # 1. Extract vectors
            profile_vector = data.get("profile_vector")
            experience_vectors = data.get("experience_vectors")

            has_vectors = False
            vector_doc = {}
            if uid is not None:
                vector_doc["uid"] = int(uid)
            else:
                try:
                    vector_doc["uid"] = int(uid_str)
                except ValueError:
                    vector_doc["uid"] = uid_str

            if profile_vector is not None:
                vector_doc["profile_vector"] = profile_vector
                has_vectors = True
            if experience_vectors is not None:
                vector_doc["experience_vectors"] = experience_vectors
                has_vectors = True

            # 2. Upload vectors to user_vectors if they exist
            if has_vectors:
                vector_ref = db.collection("user_vectors").document(uid_str)
                batch.set(vector_ref, vector_doc)
                total_vectors += 1
                count += 1

            # 3. Update original user doc to delete vectors
            update_data = {}
            if "profile_vector" in data:
                update_data["profile_vector"] = firestore.DELETE_FIELD
            if "experience_vectors" in data:
                update_data["experience_vectors"] = firestore.DELETE_FIELD

            if update_data:
                user_ref = db.collection("users").document(uid_str)
                batch.update(user_ref, update_data)
                total_users_updated += 1
                count += 1

            # 4. Extract lightweight metadata for packs
            meta = {
                "uid": int(uid) if uid is not None else int(uid_str),
                "displayName": data.get("displayName", f"User {uid_str}"),
                "birthDate": data.get("birthDate", ""),
                "gender": data.get("gender", ""),
                "post": data.get("post", []),
                "skills": data.get("skills", []),
                "geography": data.get("geography", []),
                "socialRelations": data.get("socialRelations", []),
                "features": data.get("features", [])
            }
            packed_users.append(meta)

        # Commit batch for this page
        if count > 0:
            batch.commit()
            
        last_doc = batch_docs[-1]
        print(f"Batch {batch_num} committed. Total vectors: {total_vectors}, Total users updated: {total_users_updated}")
        batch_num += 1

    print(f"Finished processing all {total_users_updated} users.")

    # 5. Pack metadata into chunks of 250
    pack_size = 250
    chunks = [packed_users[i:i + pack_size] for i in range(0, len(packed_users), pack_size)]
    print(f"Chunked users into {len(chunks)} packs.")

    batch = db.batch()
    for idx, chunk in enumerate(chunks, 1):
        pack_id = f"pack_{idx}"
        pack_ref = db.collection("user_packs").document(pack_id)
        batch.set(pack_ref, {
            "pack_id": idx,
            "users": chunk
        })
        print(f"Prepared user_packs doc: {pack_id} with {len(chunk)} users.")
    
    print("Writing user packs to Firestore...")
    batch.commit()
    print("Migration completed successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate Firestore users collection to Option A layout.")
    parser.add_argument("--project-id", default="project-a3d59130-5adf-4677-9e2", help="Google Cloud Project ID")
    parser.add_argument("--credentials", help="Path to Google Service Account JSON file (optional if using ADC)")
    args = parser.parse_args()

    migrate(args.project_id, args.credentials)
