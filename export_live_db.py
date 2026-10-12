import os
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'project-a3d59130-5adf-4677-9e2',
})
db = firestore.client()

BACKUP_DIR = r"A:\ISR\mvp\dbbackup"

# We are only exporting the remaining collections that failed due to timeout
collections_to_export = [
    "user_vectors", 
    "user_packs"
]

class FirestoreEncoder(json.JSONEncoder):
    def default(self, obj):
        try:
            return str(obj)
        except Exception:
            return super().default(obj)

print(f"Resuming backup to {BACKUP_DIR}...\n")

for coll_name in collections_to_export:
    print(f"Exporting collection: {coll_name} (Using Pagination to prevent timeouts)...")
    coll_ref = db.collection(coll_name)
    
    coll_data = {}
    doc_count = 0
    
    # Fetch in small chunks to prevent Firestore 503 Timeout errors on huge vectors
    query = coll_ref.limit(100)
    
    while True:
        docs = list(query.stream())
        if not docs:
            break
            
        for doc in docs:
            doc_count += 1
            coll_data[doc.id] = doc.to_dict()
            
        last_doc = docs[-1]
        query = coll_ref.start_after(last_doc).limit(100)
        print(f"  ...fetched {doc_count} documents so far")
        
    out_file = os.path.join(BACKUP_DIR, f"{coll_name}.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(coll_data, f, cls=FirestoreEncoder, indent=2, ensure_ascii=False)
    
    print(f" -> Saved {doc_count} documents to {coll_name}.json")

print("\n✅ Backup completed successfully!")
