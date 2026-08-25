import cv2
import threading
import time
import asyncio
from ultralytics import YOLO
import uuid

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from virtual_fence.virtual_fence_db import get_all_vf_zones, get_vf_authorized_persons, log_vf_event
from virtual_fence.geometry import ZoneGeometry
from virtual_fence.decision_engine import IntrusionDecisionEngine
from virtual_fence.face_cache import FaceCache
from virtual_fence.event_publisher import publisher

class VirtualFenceRunner:
    def __init__(self):
        self.running = False
        self.thread = None
        self.model = None
        self.decision_engine = IntrusionDecisionEngine()
        self.face_cache = FaceCache()
        self.video_source = 0 # Default to webcam

    def set_source(self, source_path):
        self.video_source = source_path
        # Restart loop to apply new source
        if self.running:
            self.stop()
            self.start()

    def start(self):
        if not self.running:
            # Bypass PyTorch 2.6 weights_only=True restriction for Ultralytics YOLO
            import torch
            _original_load = torch.load
            def _patched_load(*args, **kwargs):
                if 'weights_only' not in kwargs:
                    kwargs['weights_only'] = False
                return _original_load(*args, **kwargs)
            torch.load = _patched_load
            
            try:
                self.model = YOLO('yolov8n.pt')
            except:
                self.model = YOLO('yolov8n.pt') # Will download if not exists
                
            self.running = True
            self.thread = threading.Thread(target=self._run_loop, daemon=True)
            self.thread.start()
            print(f"[INFO] Virtual Fence Runner started with source: {self.video_source}")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=2.0)

    def _run_loop(self):
        # Fallback to a black frame generation if no camera is available
        cap = cv2.VideoCapture(self.video_source)
        has_camera = cap.isOpened()
        
        while self.running:
            if has_camera:
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.1)
                    continue
            else:
                # Generate a dummy frame for pure simulation if no cam is connected
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                # We can't really do YOLO on black frame, so this would just idle
                time.sleep(1)
                continue

            frame_height, frame_width = frame.shape[:2]
            
            # 1. Fetch active zones
            zones = get_all_vf_zones()
            active_zones = [z for z in zones if z['enabled']]
            
            if not active_zones:
                time.sleep(1.0)
                continue
                
            # 2. Run Person Tracking
            results = self.model.track(frame, classes=[0], persist=True, tracker="bytetrack.yaml", verbose=False)
            
            if not results or not results[0].boxes or results[0].boxes.id is None:
                continue
                
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.cpu().numpy()
            confs = results[0].boxes.conf.cpu().numpy()
            
            active_track_ids = set()

            for box, track_id, conf in zip(boxes, track_ids, confs):
                track_id_str = str(int(track_id))
                active_track_ids.add(track_id_str)
                
                # Check confidence threshold
                if conf < 0.50:
                    continue
                    
                x1, y1, x2, y2 = box
                bottom_center = ZoneGeometry.get_bottom_center(x1, y1, x2, y2)
                
                # 3. Check Zone Intersections
                for zone in active_zones:
                    if ZoneGeometry.is_inside_polygon(bottom_center, zone['boundary'], frame_width, frame_height):
                        # 4. We are inside! Run Face Identity
                        status, name, face_conf = self.face_cache.get_identity(track_id_str, frame, box)
                        
                        # Fetch authorized persons
                        auth_persons = get_vf_authorized_persons(zone['id'])
                        
                        # 5. Evaluate Decision
                        event = self.decision_engine.evaluate(
                            zone=zone,
                            track_id=track_id_str,
                            person_id=name if status == "recognized" else None,
                            person_name=name,
                            confidence=face_conf,
                            recognition_status=status,
                            authorized_persons=auth_persons
                        )
                        
                        if event:
                            # 6. Save Snapshot & Log
                            event_id = event['id']
                            snapshot_path = f"storage/events/{event_id}.jpg"
                            os.makedirs("storage/events", exist_ok=True)
                            
                            # Draw box on snapshot
                            snap_frame = frame.copy()
                            cv2.rectangle(snap_frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                            cv2.putText(snap_frame, f"{name} ({status})", (int(x1), int(y1)-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                            cv2.imwrite(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), snapshot_path), snap_frame)
                            
                            event['snapshot_path'] = snapshot_path
                            log_vf_event(event)
                            
                            # 7. Publish to SSE
                            if event["event_type"] in ["UNAUTHORIZED_INTRUSION", "UNKNOWN_INTRUSION"]:
                                event['zone_name'] = zone['name'] # For UI
                                
                                # Use a threadsafe asyncio event loop call to publish
                                try:
                                    loop = asyncio.get_running_loop()
                                    loop.create_task(publisher.publish(event))
                                except RuntimeError:
                                    # If we can't find the loop (e.g. running outside ASGI), we do our best
                                    pass
                                
            # Cleanup exits
            # Any track_id that was in active_intrusions but is no longer detected needs an exit transition
            # For simplicity, we just clean up lost tracks from cache
            for t_id in list(self.face_cache.cache.keys()):
                if t_id not in active_track_ids:
                    self.face_cache.cleanup_track(t_id)
                    for z in zones:
                        self.decision_engine.handle_exit(z['id'], t_id)
                        
        if has_camera:
            cap.release()

runner = VirtualFenceRunner()
