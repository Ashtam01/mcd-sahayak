from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services import rag_service

router = APIRouter()

@router.post("/upload-scheme")
async def upload_scheme_pdf(file: UploadFile = File(...)):
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
            metadata={"type": "scheme_doc"}
        )
        
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("message"))
            
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
