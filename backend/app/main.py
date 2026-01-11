from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import vapi_routes, api_routes, documents

app = FastAPI(title="MCD Sampark Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect Routes
app.include_router(vapi_routes.router, prefix="/api/vapi")
app.include_router(api_routes.router, prefix="/api") # For Frontend
app.include_router(documents.router, prefix="/api/documents")


@app.get("/")
def health():
    return {"status": "active"}