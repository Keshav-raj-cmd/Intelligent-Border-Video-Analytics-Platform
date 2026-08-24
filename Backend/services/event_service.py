import os
import cv2
import time
from datetime import datetime
from database import log_anpr_event
from pathlib import Path

STORAGE_DIR = Path(__file__).parent.parent / "storage" / "events"

class EventService:
    def __init__(self, cooldown_seconds=60):
        self.cooldown_seconds = cooldown_seconds
        self.last_alert_time = {} # track_id -> timestamp
        
        # Ensure storage dir exists
        os.makedirs(STORAGE_DIR, exist_ok=True)

    def process_event(self, track_id, plate_text, vehicle_class, match_data, match_type, risk_level, risk_score, frame_bgr, vehicle_bbox, plate_bbox):
        """
        Handles alert deduplication, logs the event, and saves evidence.
        """
        now = time.time()
        last_time = self.last_alert_time.get(track_id, 0)
        
        # We process an event if it's the first time we see it, OR if the cooldown has passed
        is_new_alert = (now - last_time) > self.cooldown_seconds
        
        # Always log/update the event to increment sighting counts and update last_seen
        event_id = f"EVENT-{datetime.now().strftime('%Y%m%d')}-{track_id}"
        
        snapshot_path = None
        
        if is_new_alert and risk_level in ['HIGH', 'CRITICAL', 'REVIEW']:
            # Capture evidence for high risk events
            snapshot_path = self.save_evidence(event_id, frame_bgr, vehicle_bbox, plate_bbox)
            self.last_alert_time[track_id] = now
            
        event_data = {
            "event_id": event_id,
            "plate_number": match_data['plate_number'] if match_data else plate_text,
            "normalized_plate": plate_text,
            "vehicle_class": vehicle_class,
            "vehicle_track_id": str(track_id),
            "vehicle_confidence": 0.9, # Mocked for now
            "plate_confidence": 0.9,
            "ocr_confidence": 0.9,
            "match_type": match_type,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "camera_id": "BOP-CAM-01",
            "snapshot_path": snapshot_path
        }
        
        log_anpr_event(event_data)
        
        return is_new_alert, event_data

    def save_evidence(self, event_id, frame_bgr, vehicle_bbox, plate_bbox):
        event_dir = STORAGE_DIR / event_id
        os.makedirs(event_dir, exist_ok=True)
        
        full_path = str(event_dir / "full_frame.jpg")
        cv2.imwrite(full_path, frame_bgr)
        
        if vehicle_bbox:
            vx1, vy1, vx2, vy2 = vehicle_bbox
            v_crop = frame_bgr[max(0, vy1):vy2, max(0, vx1):vx2]
            if v_crop.size > 0:
                cv2.imwrite(str(event_dir / "vehicle.jpg"), v_crop)
                
        if plate_bbox:
            px1, py1, px2, py2 = plate_bbox
            p_crop = frame_bgr[max(0, py1):py2, max(0, px1):px2]
            if p_crop.size > 0:
                cv2.imwrite(str(event_dir / "plate.jpg"), p_crop)
                
        return full_path
