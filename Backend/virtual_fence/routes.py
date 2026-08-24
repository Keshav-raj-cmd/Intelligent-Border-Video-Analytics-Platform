from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
import json
import asyncio

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from virtual_fence.virtual_fence_db import (
    get_all_vf_zones, get_recent_vf_events, toggle_vf_zone, get_vf_zone
)
from virtual_fence.event_publisher import publisher
from virtual_fence.pipeline import runner
from database import init_db

router = APIRouter(prefix="/api/virtual-fence", tags=["virtual-fence"])

@router.on_event("startup")
async def startup_event():
    init_db()
    # Pass the running event loop to the publisher to ensure thread safety 
    publisher.loop = asyncio.get_running_loop()
    runner.start()
    
@router.on_event("shutdown")
async def shutdown_event():
    runner.stop()

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
    """Server-Sent Events endpoint to push live Virtual Fence alerts."""
    async def event_generator():
        q = await publisher.subscribe()
        try:
            while True:
                # If client closes connection, exit
                if await request.is_disconnected():
                    break
                    
                # Wait for an event
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
