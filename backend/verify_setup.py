import os
import time
from app.database import supabase
from sentence_transformers import SentenceTransformer

def test_rag_setup():
    print("🔄 Starting RAG Setup Verification...")
    
    # 1. Test Storage Upload
    print("\n1️⃣  Testing Storage Upload to 'documents' bucket...")
    try:
        filename = f"verify_{int(time.time())}.txt"
        file_bytes = b"This is a test content for verification."
        
        # Check if bucket exists (listing isn't always allowed to public, but upload might be)
        # We just try upload
        response = supabase.storage.from_("documents").upload(
            filename,
            file_bytes,
            {"content-type": "text/plain"}
        )
        # In newer supabase-py versions, upload might return a response object or dict
        # We assume if no exception, it worked.
        print(f"✅ Storage Upload Successful: {filename}")
        
    except Exception as e:
        print(f"❌ Storage Upload FAILED: {e}")
        # Continue to DB test anyway
    
    # 2. Test Database Insert (Vector)
    print("\n2️⃣  Testing Database Insert to 'document_chunks'...")
    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embedding = model.encode("test query").tolist()
        
        row = {
            "content": "Verification text content",
            "metadata": {"source": "verification_script"},
            "embedding": embedding
        }
        
        response = supabase.table("document_chunks").insert(row).execute()
        print("✅ Database Insert Successful")
        print(f"   Inserted Data: {response.data}")
        
    except Exception as e:
        print(f"❌ Database Insert FAILED: {e}")

if __name__ == "__main__":
    try:
        test_rag_setup()
    except Exception as e:
        print(f"❌ Verification Script Crashed: {e}")
