import time
import cv2
import numpy as np
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from face_engine import face_engine
from database import get_all_features

class FaceCache:
    def __init__(self):
        # { track_id: {"status": "recognized"|"unknown"|"uncertain", "person_name": "...", "confidence": 0.9, "last_checked": timestamp} }
        self.cache = {}
        self.db_features = get_all_features()
        self.RECHECK_INTERVAL = 30 # seconds
        self.MATCH_THRESHOLD = 0.65

    def get_identity(self, track_id: str, frame: np.ndarray, bbox: list) -> tuple:
        """
        bbox: [x1, y1, x2, y2] of the person
        Returns: (status, person_name, confidence)
        """
        current_time = time.time()
        
        # Check cache
        if track_id in self.cache:
            entry = self.cache[track_id]
            # If recognized, we trust it for the duration of the track
            if entry["status"] == "recognized":
                return entry["status"], entry["person_name"], entry["confidence"]
                
            # If unknown/uncertain, retry periodically
            if current_time - entry["last_checked"] < self.RECHECK_INTERVAL:
                return entry["status"], entry["person_name"], entry["confidence"]
                
        # If we need to check, crop the person and try to find a face
        x1, y1, x2, y2 = [int(v) for v in bbox]
        # Pad slightly
        h, w = frame.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        person_crop = frame[y1:y2, x1:x2]
        
        if person_crop.size == 0:
            return "unknown", "Unknown", 0.0

        # Detect face in the crop
        results = face_engine.detect_and_extract_all(person_crop)
        
        if not results:
            self.cache[track_id] = {
                "status": "uncertain", 
                "person_name": "Unknown", 
                "confidence": 0.0, 
                "last_checked": current_time
            }
            return "uncertain", "Unknown", 0.0
            
        # We found a face. Try to match it
        face_bbox, target_feature = results[0]
        
        # Refresh DB features occasionally if needed, but for prototype we just use self.db_features
        best_match, best_score = face_engine.match_feature(target_feature, self.db_features)
        
        if best_match and best_score > self.MATCH_THRESHOLD:
            self.cache[track_id] = {
                "status": "recognized", 
                "person_name": best_match, 
                "confidence": float(best_score), 
                "last_checked": current_time
            }
            return "recognized", best_match, float(best_score)
            
        self.cache[track_id] = {
            "status": "unknown", 
            "person_name": "Unknown", 
            "confidence": float(best_score) if best_score else 0.0, 
            "last_checked": current_time
        }
        return "unknown", "Unknown", float(best_score) if best_score else 0.0

    def cleanup_track(self, track_id: str):
        if track_id in self.cache:
            del self.cache[track_id]
