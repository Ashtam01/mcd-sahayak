from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..services import rag_service
from ..database import supabase

router = APIRouter()

@router.post("/upload-scheme")
async def upload_scheme_pdf(
    file: UploadFile = File(...),
    description: str = Form("")
):
    """
    Uploads a scheme PDF, vectorizes it, and stores it in the knowledge base.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        result = rag_service.ingest_document(
            file_bytes=content, 
            filename=file.filename,
            description=description,
            metadata={"type": "scheme_doc"}
        )
        
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("message"))
            
        return result
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/schemes")
def get_schemes():
    try:
        # Fetch metadata from document_chunks to reconstruct scheme list
        # We need to filter by metadata->>type = 'scheme_doc'
        # Since we can't easily do distinct on jsonb field via this client without rpc,
        # We'll fetch a reasonable limit and deduplicate in python.
        
        response = supabase.table("document_chunks")\
            .select("metadata")\
            .order("created_at", desc=True)\
            .limit(1000)\
            .execute()
            
        data = response.data or []
        
        schemes = {}
        for item in data:
            meta = item.get("metadata", {})
            if meta.get("type") == "scheme_doc":
                doc_id = meta.get("doc_id") or meta.get("filename")
                if doc_id not in schemes:
                    schemes[doc_id] = {
                        "id": doc_id,
                        "name": meta.get("filename"),
                        "description": meta.get("description", ""),
                        "url": meta.get("public_url"),
                        "created_at": meta.get("created_at"),
                        "category": "General", # Default
                        "status": "active"
                    }
        
        return {"schemes": list(schemes.values())}
    except Exception as e:
        print(f"Error fetching schemes: {e}")
        return {"schemes": []}
