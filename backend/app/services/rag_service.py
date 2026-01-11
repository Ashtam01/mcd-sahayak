import io
import time
from typing import List
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from ..database import supabase

# Load a lightweight model for embeddings
# This will download the model on the first run
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text: str) -> List[float]:
    """
    Generates a version vector embedding for the given text.
    """
    return model.encode(text).tolist()

def ingest_document(file_bytes: bytes, filename: str, metadata: dict = None) -> dict:
    """
    Parses a PDF, chunks the text, vectors it, and stores in Supabase.
    """
    try:
        # 1. Upload to Supabase Storage
        file_path = f"schemes/{int(time.time())}_{filename}"
        storage_response = supabase.storage.from_("documents").upload(
            file_path,
            file_bytes,
            {"content-type": "application/pdf"}
        )
        
        # Get Public URL
        public_url_response = supabase.storage.from_("documents").get_public_url(file_path)
        # The supabase-py client usually returns the string URL directly or in a response property
        # depending on version. safe check:
        # public_url = public_url_response if isinstance(public_url_response, str) else public_url_response.get("publicURL", "")
        # Actually in recent supabase-py: get_public_url returns a string.
        public_url = public_url_response

        # 2. Parse PDF
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        if not text.strip():
            return {"status": "error", "message": "No text found in PDF"}

        # 3. Chunk Text
        # Simple character-based chunking for now
        chunk_size = 1000
        overlap = 200
        chunks = []
        
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap
            
        # 4. Generate Embeddings & Store
        stored_count = 0
        for i, chunk_text in enumerate(chunks):
            embedding = generate_embedding(chunk_text)
            
            row = {
                "content": chunk_text,
                "metadata": {
                    "filename": filename,
                    "storage_path": file_path,
                    "public_url": public_url,
                    "chunk_index": i,
                    **(metadata or {})
                },
                "embedding": embedding
            }
            
            # Insert into Supabase
            supabase.table("document_chunks").insert(row).execute()
            stored_count += 1
            
        return {
            "status": "success", 
            "chunks_processed": stored_count,
            "filename": filename,
            "public_url": public_url
        }

    except Exception as e:
        print(f"Ingest Error: {e}")
        return {"status": "error", "message": str(e)}

def search_knowledge_base(query: str, match_threshold: float = 0.7, match_count: int = 5):
    """
    Searches the vector database for relevant content.
    """
    try:
        query_embedding = generate_embedding(query)
        
        # Call the Supabase RPC function 'match_documents'
        # Ensure this function exists in your Supabase SQL
        response = supabase.rpc("match_documents", {
            "query_embedding": query_embedding,
            "match_threshold": match_threshold,
            "match_count": match_count
        }).execute()
        
        return response.data
    
    except Exception as e:
        print(f"RAG Search Error: {e}")
        return []