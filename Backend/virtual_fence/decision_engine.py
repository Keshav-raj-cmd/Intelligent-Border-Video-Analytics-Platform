import time
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

class IntrusionDecisionEngine:
    def __init__(self):
        # track state: { (zone_id, track_id): entry_time }
        self.active_intrusions = {}
        self.cooldowns = {}
        
    def evaluate(self, zone: Dict, track_id: str, person_id: Optional[str], 
                 person_name: str, confidence: float, recognition_status: str, 
                 authorized_persons: list) -> Optional[Dict]:
        """
        Evaluate if a person is authorized for the zone.
        Returns an event dictionary if an event is generated, otherwise None.
        """
        state_key = (zone['id'], track_id)
        current_time = time.time()
        
        # Check if already intruding (to prevent duplicate alerts every frame)
        if state_key in self.active_intrusions:
            return None
            
        # Check cooldown
        if state_key in self.cooldowns and current_time - self.cooldowns[state_key] < 30:
            return None

        event = {
            "id": f"ALT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4]}",
            "zone_id": zone['id'],
            "camera_id": zone['camera_id'],
            "track_id": str(track_id),
            "person_id": person_id,
            "person_name": person_name,
            "recognition_status": recognition_status,
            "confidence": confidence,
            "severity": zone['severity'],
            "snapshot_path": ""
        }

        # Decision Logic
        if recognition_status == "recognized":
            if person_name in authorized_persons:
                event["event_type"] = "AUTHORIZED_ENTRY"
                event["reason"] = f"Authorized entry by {person_name}."
                # We record it but usually don't throw UI alerts for authorized entry
            else:
                event["event_type"] = "UNAUTHORIZED_INTRUSION"
                event["reason"] = f"Recognized person {person_name} is not authorized for {zone['name']}."
        else:
            event["event_type"] = "UNKNOWN_INTRUSION"
            event["reason"] = f"Unknown person entered {zone['name']}."

        self.active_intrusions[state_key] = current_time
        
        # We only generate intrusion events for alerts
        if event["event_type"] in ["UNAUTHORIZED_INTRUSION", "UNKNOWN_INTRUSION"]:
            return event
            
        return None

    def handle_exit(self, zone_id: str, track_id: str):
        state_key = (zone_id, track_id)
        if state_key in self.active_intrusions:
            del self.active_intrusions[state_key]
            self.cooldowns[state_key] = time.time()
