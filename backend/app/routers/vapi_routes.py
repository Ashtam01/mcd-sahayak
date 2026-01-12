import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Request
from ..database import supabase
from ..services.tools import detect_zone_and_coords, calculate_sla
from ..services.rag_service import search_knowledge_base
from ..services.sms_service import send_complaint_sms

# THIS LINE IS CRITICAL - DO NOT MISS IT
router = APIRouter()

@router.post("/incoming")
async def handle_incoming(request: Request):
    try:
        payload = await request.json()
        call_payload = payload.get("message", {}).get("call", {}) if "message" in payload else payload.get("call", {})
        phone = call_payload.get("customer", {}).get("number")
        
        greeting = "Namaste! I am the MCD Sahayak. How can I help you today?"
        
        if phone:
            data = supabase.table("complaints").select("citizen_name").eq("citizen_phone", phone).limit(1).execute()
            if data.data and data.data[0].get('citizen_name'):
                name = data.data[0]['citizen_name']
                greeting = f"Namaste {name} ji! Welcome back to MCD. How can I assist you?"

        return {
            "assistant": {
                "firstMessage": greeting,
                "model": {
                    "provider": "openai",
                    "model": "gpt-4-turbo",
                    "systemPrompt": "You are a helpful MCD officer. Speak in Hinglish. Keep answers under 2 sentences."
                }
            }
        }
    except Exception as e:
        print(f"Error: {e}")
        return {}

@router.post("/webhook")
async def vapi_webhook(request: Request):
    try:
        payload = await request.json()
        message = payload.get("message", {})
        
        if message.get("type") == "tool-calls":
            tool_calls = message.get("toolCallList", [])
            results = []
            
            for tool in tool_calls:
                fn = tool["function"]["name"]
                args = tool["function"]["arguments"]
                if isinstance(args, str):
                    args = json.loads(args)
                result_text = "Action failed."
                
                if fn == "createComplaint":
                    cat = args.get("category", "General")
                    desc = args.get("description", "Voice logged complaint")
                    loc = args.get("location", "Delhi")
                    phone = args.get("phone")
                    name = args.get("name", "Citizen")

                    zone, (lat, lng) = detect_zone_and_coords(loc)
                    sla_hrs, deadline = calculate_sla(cat)
                    ticket_id = f"MCD-{int(datetime.now().timestamp())}"[-8:]

                    row = {
                        "complaint_number": ticket_id,
                        "category": cat,
                        "description": desc,
                        "location": loc,
                        "latitude": lat,
                        "longitude": lng,
                        "zone": zone,
                        "citizen_phone": phone,
                        "citizen_name": name,
                        "status": "Open",
                        "sla_deadline": deadline,
                        "priority": "medium",
                        "source": "voice",
                        "created_at": datetime.now().isoformat()
                    }
                    try:
                        supabase.table("complaints").insert(row).execute()
                        result_text = f"Complaint registered. Ticket {ticket_id}."
                        print(f"✅ Logged: {ticket_id}")
                        
                        # Send SMS Notification
                        send_complaint_sms(phone, ticket_id, cat)
                        
                    except Exception as e:
                        print(f"❌ DB Error: {e}")
                        result_text = "Error logging complaint to database."

                elif fn == "consultManual":
                    query = args.get("query")
                    result_text = search_knowledge_base(query)

                results.append({
                    "toolCallId": tool["id"],
                    "result": result_text
                })
            return {"results": results}
        return {"status": "ok"}
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}