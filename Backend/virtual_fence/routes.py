from fastapi import APIRouter, Request, HTTPException, Body, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from sse_starlette.sse import EventSourceResponse
import json
import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from virtual_fence.virtual_fence_db import (
    get_all_vf_zones, get_recent_vf_events, toggle_vf_zone, get_vf_zone,
    create_vf_zone, update_vf_zone, delete_vf_zone,
    add_authorized_person, remove_authorized_person, get_all_vf_persons,
    get_vf_event, acknowledge_vf_event,
    create_vf_video, get_all_vf_videos, get_vf_video,
    get_vf_zone_suggestions, update_vf_zone_suggestion_status
)
from virtual_fence.video_manager import VideoManager
from virtual_fence.video_analyzer import analyzer as video_analyzer
from virtual_fence.event_publisher import publisher
from virtual_fence.pipeline import runner
from database import init_db
from fastapi import BackgroundTasks

router = APIRouter(prefix="/api/virtual-fence", tags=["virtual-fence"])

@router.on_event("startup")
async def startup_event():
    init_db()
    publisher.loop = asyncio.get_running_loop()
    runner.start()
    
@router.on_event("shutdown")
async def shutdown_event():
    runner.stop()

@router.post("/videos/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        video_data = VideoManager.save_uploaded_video(file)
        if create_vf_video(video_data):
            return JSONResponse(content={"status": "success", "video": video_data})
        raise HTTPException(status_code=500, detail="Failed to save video metadata to DB")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/videos")
async def list_videos():
    videos = get_all_vf_videos()
    return JSONResponse(content={"videos": videos})

@router.get("/videos/{video_id}")
async def get_video(video_id: str):
    video = get_vf_video(video_id)
    if video:
        return JSONResponse(content={"video": video})
    raise HTTPException(status_code=404, detail="Video not found")

@router.get("/videos/{video_id}/play")
async def play_video(video_id: str):
    video = get_vf_video(video_id)
    if not video or not os.path.exists(video['file_path']):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(video['file_path'], media_type="video/mp4")

@router.post("/source")
async def set_video_source(payload: dict = Body(...)):
    source = payload.get("source")
    if source is None:
        raise HTTPException(status_code=400, detail="source is required")
        
    if source == "live":
        runner.set_source(0)
    else:
        video = get_vf_video(source)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        runner.set_source(video['file_path'])
        
    return JSONResponse(content={"status": "success", "current_source": source})

@router.post("/videos/{video_id}/analyze")
async def analyze_video(video_id: str, background_tasks: BackgroundTasks):
    video = get_vf_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    def run_analysis_task():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(video_analyzer.analyze(video_id))
        loop.close()

    background_tasks.add_task(run_analysis_task)
    return JSONResponse(content={"status": "processing_started"})

@router.get("/videos/{video_id}/suggested-zones")
async def get_suggested_zones(video_id: str):
    suggestions = get_vf_zone_suggestions(video_id)
    return JSONResponse(content={"suggestions": suggestions})

@router.post("/videos/{video_id}/suggested-zones/{zone_id}/accept")
async def accept_suggested_zone(video_id: str, zone_id: str, payload: dict = Body(...)):
    suggestions = get_vf_zone_suggestions(video_id)
    suggestion = next((s for s in suggestions if s['id'] == zone_id), None)
    
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
        
    update_vf_zone_suggestion_status(zone_id, "ACCEPTED")
    
    zone_data = {
        "id": f"FZ-{zone_id.split('-')[1]}",
        "name": payload.get("name", suggestion["name"]),
        "type": payload.get("type", suggestion["suggested_type"]),
        "camera_id": video_id,
        "severity": payload.get("severity", "MEDIUM"),
        "boundary": suggestion["boundary"],
        "enabled": True,
        "alert_enabled": True,
        "color": payload.get("color", "#ef4444")
    }
    create_vf_zone(zone_data)
    
    return JSONResponse(content={"status": "success", "zone": zone_data})

@router.post("/videos/{video_id}/suggested-zones/{zone_id}/reject")
async def reject_suggested_zone(video_id: str, zone_id: str):
    if update_vf_zone_suggestion_status(zone_id, "REJECTED"):
        return JSONResponse(content={"status": "success"})
    raise HTTPException(status_code=404, detail="Suggestion not found")

@router.get("/zones")
async def get_zones():
    zones = get_all_vf_zones()
    return JSONResponse(content={"zones": zones})

@router.post("/zones/{zone_id}/toggle")
async def toggle_zone(zone_id: str):
    zone = toggle_vf_zone(zone_id)
    if zone:
        return JSONResponse(content={"zone": zone})
    return JSONResponse(status_code=404, content={"error": "Zone not found"})

@router.post("/zones")
async def create_zone(zone_data: dict = Body(...)):
    boundary = zone_data.get('boundary', [])
    if len(boundary) < 3:
        raise HTTPException(status_code=400, detail="Polygon must have at least 3 points")
    success = create_vf_zone(zone_data)
    if success:
        return JSONResponse(content={"status": "success", "zone": get_vf_zone(zone_data['id'])})
    raise HTTPException(status_code=500, detail="Failed to create zone")

@router.get("/zones/{zone_id}")
async def get_single_zone(zone_id: str):
    zone = get_vf_zone(zone_id)
    if zone:
        return JSONResponse(content={"zone": zone})
    raise HTTPException(status_code=404, detail="Zone not found")

@router.put("/zones/{zone_id}")
async def update_zone(zone_id: str, zone_data: dict = Body(...)):
    boundary = zone_data.get('boundary', [])
    if len(boundary) < 3:
        raise HTTPException(status_code=400, detail="Polygon must have at least 3 points")
    success = update_vf_zone(zone_id, zone_data)
    if success:
        return JSONResponse(content={"status": "success", "zone": get_vf_zone(zone_id)})
    raise HTTPException(status_code=404, detail="Zone not found")

@router.delete("/zones/{zone_id}")
async def delete_zone(zone_id: str):
    if delete_vf_zone(zone_id):
        return JSONResponse(content={"status": "success"})
    raise HTTPException(status_code=404, detail="Zone not found")

@router.post("/zones/{zone_id}/authorized-persons")
async def authorize_person_in_zone(zone_id: str, payload: dict = Body(...)):
    person_id = payload.get("person_id")
    if not person_id:
        raise HTTPException(status_code=400, detail="person_id is required")
    if add_authorized_person(zone_id, person_id):
        return JSONResponse(content={"status": "success"})
    raise HTTPException(status_code=500, detail="Failed to authorize person")

@router.delete("/zones/{zone_id}/authorized-persons/{person_id}")
async def deauthorize_person_in_zone(zone_id: str, person_id: str):
    if remove_authorized_person(zone_id, person_id):
        return JSONResponse(content={"status": "success"})
    raise HTTPException(status_code=404, detail="Authorization not found")

@router.get("/persons")
async def get_persons():
    persons = get_all_vf_persons()
    return JSONResponse(content={"persons": persons})

@router.get("/events/{event_id}")
async def get_event_details(event_id: str):
    event = get_vf_event(event_id)
    if event:
        return JSONResponse(content={"event": event})
    raise HTTPException(status_code=404, detail="Event not found")

@router.post("/events/{event_id}/acknowledge")
async def acknowledge_event(event_id: str):
    if acknowledge_vf_event(event_id):
        return JSONResponse(content={"status": "success"})
    raise HTTPException(status_code=404, detail="Event not found")

@router.get("/events")
async def get_events():
    events = get_recent_vf_events(limit=50)
    return JSONResponse(content={"events": events})

@router.get("/statistics")
async def get_statistics():
    zones = get_all_vf_zones()
    events = get_recent_vf_events(limit=50)
    
    active_zones = len([z for z in zones if z['enabled']])
    critical_alerts = len([e for e in events if e['severity'] == 'CRITICAL'])
    
    return JSONResponse(content={
        "active_zones": active_zones,
        "critical_alerts": critical_alerts,
        "total_zones": len(zones)
    })

@router.get("/stream")
async def event_stream(request: Request):
    async def event_generator():
        q = await publisher.subscribe()
        try:
            while True:
                if await request.is_disconnected():
                    break
                event = await q.get()
                yield {
                    "event": "message",
                    "id": event["id"],
                    "data": json.dumps(event)
                }
        except asyncio.CancelledError:
            pass
        finally:
            publisher.unsubscribe(q)
            
    return EventSourceResponse(event_generator())
