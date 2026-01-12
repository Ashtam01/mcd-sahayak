from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime, timedelta
import random
import os
import numpy as np
from sklearn.cluster import DBSCAN
from collections import Counter
from ..database import supabase
from pydantic import BaseModel
from ..services.tools import detect_zone_and_coords, calculate_sla
from ..services.sms_service import send_complaint_sms

router = APIRouter()

# --- NEW ENDPOINTS ---

@router.get("/heatmap")
def get_heatmap_points(zone: Optional[str] = None):
    try:
        query = supabase.table("complaints").select("latitude,longitude,priority").not_.is_("latitude", "null").not_.is_("longitude", "null").limit(2000)
        
        if zone and zone != 'all':
            # Normalize zone format
            db_zone = zone.replace('-', ' ').title()
            query = query.eq("zone", db_zone)
            
        result = query.execute()
        data = result.data or []
        
        # Convert to format expected by frontend: [lat, lng, intensity]
        priority_map = {
            "critical": 1.0,
            "high": 0.8,
            "medium": 0.5,
            "low": 0.3
        }
        
        points = []
        for row in data:
            intensity = priority_map.get(row.get("priority", "medium").lower(), 0.5)
            points.append([row["latitude"], row["longitude"], intensity])
            
        return {"points": points}
    except Exception as e:
        print(f"Heatmap error: {e}")
        return {"points": []}

@router.get("/dashboard-stats")
def get_dashboard_stats(zone: Optional[str] = None):
    try:
        # Normalize zone format
        db_zone = zone.replace('-', ' ').title() if zone and zone != 'all' else None

        # 1. Total Complaints (approx)
        total_query = supabase.table("complaints").select("id", count="exact")
        if db_zone:
            total_query = total_query.eq("zone", db_zone)
        total_count = total_query.execute().count

        # 2. Resolved Today
        today = datetime.now().date().isoformat()
        resolved_query = supabase.table("complaints").select("id", count="exact").eq("status", "Resolved").gte("resolved_at", today)
        if db_zone:
            resolved_query = resolved_query.eq("zone", db_zone)
        resolved_count = resolved_query.execute().count
        
        # 3. Active Agents (Mock for now, or fetch from agents table if exists)
        active_agents = random.randint(12, 45) 
        
        # 4. Avg Resolution Time (Mock logic or complex query)
        avg_res_time = 4.2 # hours
        
        # 5. Trends
        complaint_trend = random.choice([-5, 12, 8, -2, 15])
        resolution_trend = random.choice([5, 10, 3, 8])

        return {
            "total_complaints": total_count or 0,
            "resolved": resolved_count or 0,
            "avg_resolution_hours": avg_res_time,
            "active_agents": active_agents,
            "complaint_trend": complaint_trend,
            "resolution_trend": resolution_trend
        }
    except Exception as e:
        print(f"Dashboard stats error: {e}")
        return {
            "total_complaints": 0,
            "resolved": 0,
            "avg_resolution_hours": 0,
            "active_agents": 0,
            "complaint_trend": 0,
            "resolution_trend": 0
        }

@router.get("/activity")
def get_recent_activity(limit: int = 5, zone: Optional[str] = None):
    try:
        # We can fetch from complaints table as "New Complaint" activity
        query = supabase.table("complaints").select("*").order("created_at", desc=True).limit(limit)
        
        if zone and zone != 'all':
            db_zone = zone.replace('-', ' ').title()
            query = query.eq("zone", db_zone)
            
        result = query.execute()
        
        activities = []
        for row in result.data or []:
            activities.append({
                "id": row["id"],
                "type": "complaint" if row["status"] == "Open" else "resolved",
                "title": f"New {row['category']} Report",
                "location": row['location'],
                "created_at": row['created_at'],
                "zone": row['zone']
            })
            
        return {"activities": activities}
    except Exception as e:
        print(f"Activity error: {e}")
        return {"activities": []}


@router.get("/hotspots")
def get_hotspots(zone: Optional[str] = None):
    try:
        # Fetch complaints with coordinates
        query = supabase.table("complaints").select("*").not_.is_("latitude", "null").not_.is_("longitude", "null").limit(1000)
        
        if zone and zone != 'all':
            db_zone = zone.replace('-', ' ').title()
            query = query.eq("zone", db_zone)
            
        result = query.execute()
        data = result.data or []
        
        if len(data) < 1:
            return {"hotspots": []}
            
        # Prepare coordinates for clustering
        coords = np.array([[row['latitude'], row['longitude']] for row in data])
        
        # DBSCAN Clustering
        # eps is roughly degrees. 1 deg ~= 111km. 0.003 deg ~= 330m radius.
        # Reduced min_samples to 2 to catch smaller clusters in specific zones
        clustering = DBSCAN(eps=0.003, min_samples=2, metric='euclidean').fit(coords)
        
        labels = clustering.labels_
        unique_labels = set(labels)
        
        hotspots = []
        
        for k in unique_labels:
            if k == -1:
                # Noise points, ignore
                continue
                
            # Get indices for this cluster
            class_member_mask = (labels == k)
            cluster_data = [data[i] for i in range(len(data)) if class_member_mask[i]]
            
            # 1. Calculate centroid (average lat/lng)
            lat_center = np.mean([c['latitude'] for c in cluster_data])
            lng_center = np.mean([c['longitude'] for c in cluster_data])

            # 2. Determine Name
            locations = [c.get("location", "Unknown Area").split(',')[0].strip() for c in cluster_data]
            area_name = Counter(locations).most_common(1)[0][0]
            
            # 3. Stats
            count = len(cluster_data)
            categories = [c.get("category", "General") for c in cluster_data]
            main_issue = Counter(categories).most_common(1)[0][0]
            
            # 4. Severity
            severity = "low"
            if count >= 10: severity = "critical"
            elif count >= 5: severity = "high"
            else: severity = "medium"
            
            hotspots.append({
                "id": int(k) + 1,
                "area": area_name,
                "zone": cluster_data[0].get("zone", "General"),
                "complaints": count,
                "mainIssue": main_issue,
                "severity": severity,
                "trend": "stable",
                "lat": lat_center, 
                "lng": lng_center
            })
            
        # Sort by complaint count
        top_hotspots = sorted(hotspots, key=lambda x: x["complaints"], reverse=True)[:5]
        
        return {"hotspots": top_hotspots}
        
    except Exception as e:
        print(f"Hotspot AI error: {e}")
        # Fallback to empty if ML fails
        return {"hotspots": []}

@router.get("/complaints")
def get_complaints(limit: int = 50, zone: Optional[str] = None, status: Optional[str] = None):
    try:
        query = supabase.table("complaints").select("*").order("created_at", desc=True).limit(limit)
        if zone and zone != 'all':
            query = query.eq("zone", zone)
        if status and status != 'all':
            # Handle status mapping
            db_status = status
            if status == 'in-progress':
                # Use ILIKE with wildcards or OR if needed, but 'In Progress' is the standard
                # Or just construct a list of acceptable variants?
                # Simplest: if 'in-progress', map to 'In Progress' for specific match
                # But ILIKE "in-progress" fails against "In Progress".
                # Let's try to be smart.
                db_status = "In Progress"
            
            # Use ilike for case insensitivity
            query = query.ilike("status", db_status)
            
        response = query.execute()
        return {"complaints": response.data or []}
    except Exception as e:
        print(f"Error fetching complaints: {e}")
        return {"complaints": []}

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[str] = None

@router.patch("/complaints/{complaint_id}")
def update_complaint(complaint_id: str, updates: ComplaintUpdate):
    try:
        data = {}
        if updates.status:
            # Normalize status to Title Case for DB consistency
            if updates.status.lower() == 'in-progress':
                data['status'] = 'In Progress'
            elif updates.status.lower() == 'resolved':
                data['status'] = 'Resolved'
                data['resolved_at'] = datetime.now().isoformat()
            else:
                data['status'] = updates.status.title()
                
        if updates.assigned_to:
            data['assigned_to'] = updates.assigned_to
        if updates.notes:
            data['notes'] = updates.notes
        if updates.priority:
            data['priority'] = updates.priority
            
        if not data:
            return {"status": "no changes"}

        # Use the service role client (supabase var) which should bypass RLS if configured
        result = supabase.table("complaints").update(data).eq("id", complaint_id).execute()
        
        return {"status": "success", "data": result.data}
    except Exception as e:
        print(f"Error updating complaint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ComplaintCreate(BaseModel):
    category: str
    description: str
    location: str
    citizen_phone: Optional[str] = None
    citizen_name: Optional[str] = "Citizen"
    priority: Optional[str] = "medium"

@router.post("/complaints")
def create_complaint(complaint: ComplaintCreate):
    try:
        # Auto-detect zone and coords
        zone, (lat, lng) = detect_zone_and_coords(complaint.location)
        sla_hrs, deadline = calculate_sla(complaint.category)
        ticket_id = f"MCD-WEB-{int(datetime.now().timestamp())}"[-10:]
        
        row = {
            "complaint_number": ticket_id,
            "category": complaint.category,
            "description": complaint.description,
            "location": complaint.location,
            "latitude": lat,
            "longitude": lng,
            "zone": zone,
            "citizen_phone": complaint.citizen_phone,
            "citizen_name": complaint.citizen_name,
            "status": "Open",
            "sla_deadline": deadline,
            "priority": complaint.priority,
            "source": "web",
            "created_at": datetime.now().isoformat()
        }
        
        data = supabase.table("complaints").insert(row).execute()
        
        # Send SMS
        if complaint.citizen_phone: 
             # In our specific demo case, we send to the registered Twilio number mostly
             # But we pass the citizen phone as 'to_number' logic in sms_service 
             # handles the override for the demo.
             send_complaint_sms(complaint.citizen_phone, ticket_id, complaint.category)
             
        # If no phone provided, we might still want to alert the hardcoded number?
        # The user said "use my number... even when complaint logged through... web app"
        # So yes, we should ALWAYS send SMS.
        else:
             send_complaint_sms("N/A", ticket_id, complaint.category)
             
        return {"status": "success", "ticket_id": ticket_id, "data": row}
        
    except Exception as e:
        print(f"Error creating complaint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from ..services.sms_service import send_complaint_sms, send_broadcast_sms

class BroadcastRequest(BaseModel):
    message: str
    phone: str
    type: str = "call" # 'call' or 'sms'

@router.post("/broadcast")
async def start_broadcast(request: BroadcastRequest):
    try:
        if request.type == "sms":
            success, msg = send_broadcast_sms(request.phone, request.message)
            if success:
                return {"status": "success", "mode": "sms", "details": msg}
            else:
                # Pass the specific Twilio error message to the frontend
                raise HTTPException(status_code=500, detail=f"Failed to send SMS: {msg}")

        # Fallback to defaults (Voice Call)
        vapi_private_key = os.environ.get("VAPI_PRIVATE_KEY")
        vapi_phone_id = os.environ.get("VAPI_PHONE_NUMBER_ID")
        vapi_assistant_id = os.environ.get("VAPI_ASSISTANT_ID")
        
        # Ensure E.164 format for Voice Calls (default to India +91)
        phone_number = request.phone
        if not phone_number.startswith('+'):
            phone_number = f"+91{phone_number}"
        
        if not vapi_private_key or not vapi_phone_id:
            raise HTTPException(status_code=500, detail="Vapi configuration missing (KEY or PHONE_ID)")
            
        # Prepare the buffer message to handle Twilio Trial overlap
        # Using a professional intro as a buffer. "Namaste" + Intro is ~4-5 seconds.
        # This is better than "..." which might be ignored by some TTS engines.
        safe_message = f"Namaste. This is an official call from the Municipal Corporation of Delhi. {request.message}"

        # If assistant ID is missing, we use a transient assistant config
        assistant_config = {
            "firstMessageMode": "assistant-speaks-first",
            "firstMessage": safe_message,
            "systemPrompt": "You are a helpful MCD officer. You just broadcasted a message to this citizen. Answer any questions they have about it or other MCD services politely and concisely in Hinglish.",
            "voice": {
                "provider": "11labs",
                "voiceId": "sarah",
            },
            "model": {
                "provider": "openai",
                "model": "gpt-4-turbo",
            }
        }
        
        # If we have an assistant ID, we can use it but override the first message
        payload = {
            "phoneNumberId": vapi_phone_id,
            "customer": {
                "number": phone_number
            },
        }
        
        if vapi_assistant_id:
             payload["assistantId"] = vapi_assistant_id
             payload["assistantOverrides"] = {
                 "firstMessageMode": "assistant-speaks-first",
                 "firstMessage": safe_message,
             }
        else:
            payload["assistant"] = assistant_config

        print(f"📡 Sending Vapi Payload: {payload}")

        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.vapi.ai/call",
                headers={
                    "Authorization": f"Bearer {vapi_private_key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=10.0
            )
            
            if resp.status_code not in [200, 201]:
                print(f"Vapi Error: {resp.text}")
                raise HTTPException(status_code=resp.status_code, detail=f"Vapi call failed: {resp.text}")
                
            return {"status": "success", "call_id": resp.json().get("id")}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Broadcast error: {e}")
        raise HTTPException(status_code=500, detail=str(e))