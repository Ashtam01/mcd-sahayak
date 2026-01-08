from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Sampark API", version="2.0")

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Connection
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase connected")
else:
    print("⚠️ WARNING: Supabase credentials not found")
    supabase = None

# Load MCD Knowledge Base
KNOWLEDGE_PATH = os.path.join(os.path.dirname(__file__), "data", "mcd_knowledge.json")
try:
    with open(KNOWLEDGE_PATH, "r", encoding="utf-8") as f:
        MCD_KNOWLEDGE = json.load(f)
    print("✅ Knowledge base loaded")
except FileNotFoundError:
    print("⚠️ WARNING: mcd_knowledge.json not found")
    MCD_KNOWLEDGE = {}

# --------------------- MODELS ---------------------

class Complaint(BaseModel):
    category: str
    subcategory: Optional[str] = None
    description: str
    location: str
    zone: Optional[str] = None
    caller_phone: Optional[str] = None
    priority: Optional[str] = "medium"

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[str] = None

# --------------------- HELPERS ---------------------

def detect_zone(location: str) -> str:
    """Detect zone from location string"""
    location_lower = location.lower()
    for zone in MCD_KNOWLEDGE.get("zones", []):
        for area in zone.get("areas", []):
            if area.lower() in location_lower:
                return zone["name"]
    return "Unknown Zone"

def get_sla_hours(category: str) -> int:
    """Get SLA hours for a category"""
    for cat in MCD_KNOWLEDGE.get("complaint_categories", []):
        if cat["id"] == category.lower() or cat["name"].lower() == category.lower():
            return cat.get("sla_hours", 48)
    return 48

# --------------------- API ENDPOINTS ---------------------

@app.get("/")
def health_check():
    return {
        "status": "Sampark API Online",
        "version": "2.0",
        "database": "connected" if supabase else "not connected",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/config")
def get_config():
    """Return public config for frontend (Vapi keys)"""
    return {
        "vapi_public_key": os.environ.get("VAPI_PUBLIC_KEY", ""),
        "vapi_assistant_id": os.environ.get("VAPI_ASSISTANT_ID", "")
    }

@app.post("/api/complaints")
def create_complaint(data: Complaint):
    """Create a new complaint"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    zone = data.zone or detect_zone(data.location)
    sla_hours = get_sla_hours(data.category)
    
    try:
        response = supabase.table("complaints").insert({
            "category": data.category,
            "subcategory": data.subcategory,
            "description": data.description,
            "location": data.location,
            "zone": zone,
            "caller_phone": data.caller_phone,
            "priority": data.priority,
            "sla_hours": sla_hours,
            "status": "Open"
        }).execute()
        
        return {
            "success": True,
            "message": "Complaint logged successfully",
            "data": response.data[0] if response.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/complaints")
def get_complaints(
    status: Optional[str] = None,
    zone: Optional[str] = None,
    limit: int = 50
):
    """Get list of complaints"""
    if not supabase:
        return {"complaints": []}
    
    try:
        query = supabase.table("complaints").select("*").order("created_at", desc=True).limit(limit)
        
        if status:
            query = query.eq("status", status)
        if zone:
            query = query.eq("zone", zone)
        
        response = query.execute()
        return {"complaints": response.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/complaints/{complaint_number}")
def get_complaint(complaint_number: str):
    """Get a specific complaint by number"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        response = supabase.table("complaints").select("*").eq("complaint_number", complaint_number).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        return {"complaint": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/complaints/{complaint_number}")
def update_complaint(complaint_number: str, data: ComplaintUpdate):
    """Update complaint status"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now().isoformat()
    
    if data.status == "Resolved":
        update_data["resolved_at"] = datetime.now().isoformat()
    
    try:
        response = supabase.table("complaints").update(update_data).eq("complaint_number", complaint_number).execute()
        return {"success": True, "data": response.data[0] if response.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard-stats")
def get_dashboard_stats():
    """Get real-time dashboard statistics"""
    if not supabase:
        # Return mock data if DB not connected
        return {
            "total_complaints": 124,
            "open": 26,
            "resolved": 98,
            "critical": 5,
            "recent_complaints": []
        }
    
    try:
        # Get counts
        total = supabase.table("complaints").select("*", count="exact").execute()
        open_count = supabase.table("complaints").select("*", count="exact").eq("status", "Open").execute()
        resolved = supabase.table("complaints").select("*", count="exact").eq("status", "Resolved").execute()
        critical = supabase.table("complaints").select("*", count="exact").eq("priority", "critical").execute()
        
        # Recent complaints
        recent = supabase.table("complaints").select("*").order("created_at", desc=True).limit(10).execute()
        
        return {
            "total_complaints": total.count or 0,
            "open": open_count.count or 0,
            "resolved": resolved.count or 0,
            "critical": critical.count or 0,
            "recent_complaints": recent.data or []
        }
    except Exception as e:
        print(f"Dashboard stats error: {e}")
        return {
            "total_complaints": 0,
            "open": 0,
            "resolved": 0,
            "critical": 0,
            "recent_complaints": []
        }

@app.get("/api/knowledge/{topic}")
def get_knowledge(topic: str):
    """Get knowledge base info"""
    if topic in MCD_KNOWLEDGE:
        return {topic: MCD_KNOWLEDGE[topic]}
    return {"error": "Topic not found", "available": list(MCD_KNOWLEDGE.keys())}

# --------------------- VAPI WEBHOOK ---------------------

def extract_complaint_from_transcript(transcript: str, summary: str) -> dict:
    """Extract complaint details from call transcript"""
    transcript_lower = transcript.lower()
    
    # Detect category from keywords
    category = "others"
    category_keywords = MCD_KNOWLEDGE.get("common_issues_keywords", {})
    for cat, keywords in category_keywords.items():
        if any(kw in transcript_lower for kw in keywords):
            category = cat
            break
    
    # Try to extract location (look for common patterns)
    location = "Unknown Location"
    location_indicators = ["rohini", "dwarka", "pitampura", "lajpat", "mayur vihar", 
                          "karol bagh", "saket", "janakpuri", "vikaspuri", "model town",
                          "sector", "block", "colony", "nagar", "vihar", "enclave"]
    
    words = transcript_lower.split()
    for i, word in enumerate(words):
        for indicator in location_indicators:
            if indicator in word or (i < len(words) - 1 and indicator in f"{word} {words[i+1]}"):
                # Try to capture surrounding context for location
                start = max(0, i - 2)
                end = min(len(words), i + 4)
                location = " ".join(words[start:end]).title()
                break
    
    # Use summary as description if available, else use part of transcript
    description = summary if summary else transcript[:200] if transcript else "Complaint via voice call"
    
    return {
        "category": category,
        "description": description,
        "location": location
    }

@app.post("/api/vapi/webhook")
async def vapi_webhook(request: Request):
    """Handle Vapi webhook events"""
    try:
        payload = await request.json()
        message = payload.get("message", {})
        message_type = message.get("type")
        
        print(f"📞 Vapi webhook: {message_type}")
        
        # End of call - save transcript AND create complaint
        if message_type == "end-of-call-report":
            call_data = message.get("call", {})
            transcript = message.get("transcript", "")
            summary = message.get("summary", "")
            phone = call_data.get("customer", {}).get("number")
            
            complaint_id = None
            
            if supabase and transcript:
                try:
                    # Extract complaint from transcript
                    complaint_data = extract_complaint_from_transcript(transcript, summary)
                    
                    # Detect zone
                    zone = detect_zone(complaint_data["location"])
                    sla_hours = get_sla_hours(complaint_data["category"])
                    
                    # Create complaint
                    complaint_response = supabase.table("complaints").insert({
                        "category": complaint_data["category"],
                        "description": complaint_data["description"],
                        "location": complaint_data["location"],
                        "zone": zone,
                        "caller_phone": phone,
                        "sla_hours": sla_hours,
                        "status": "Open",
                        "priority": "medium"
                    }).execute()
                    
                    if complaint_response.data:
                        complaint_id = complaint_response.data[0].get("id")
                        print(f"✅ Complaint created: {complaint_response.data[0].get('complaint_number')}")
                    
                except Exception as e:
                    print(f"❌ Failed to create complaint: {e}")
                
                try:
                    # Save call record
                    supabase.table("calls").insert({
                        "call_id": call_data.get("id"),
                        "phone_number": phone,
                        "duration_seconds": call_data.get("duration"),
                        "transcript": transcript,
                        "summary": summary,
                        "complaint_id": complaint_id,
                        "status": "completed"
                    }).execute()
                    print("✅ Call saved to database")
                except Exception as e:
                    print(f"❌ Failed to save call: {e}")
            
            return {"status": "saved", "complaint_created": complaint_id is not None}
        
        return {"status": "ok"}
    
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        return {"error": str(e)}