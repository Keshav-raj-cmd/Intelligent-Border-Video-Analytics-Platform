import cv2
import requests
import numpy as np
from ultralytics import YOLO

import time
from collections import deque

class ActionRecognizer:
    def __init__(self, microservice_url="http://localhost:8001/predict_action"):
        self.pose_model = YOLO("yolov8n-pose.pt")
        self.microservice_url = microservice_url
        self.temporal_buffers = [] # list of dicts: {'bbox': [x1,y1,x2,y2], 'keypoints': deque, 'last_seen': timestamp}
        self.max_frames = 30
        
    def detect_and_recognize(self, frame_bgr, valid_boxes=None):
        """
        Runs YOLOv8-pose to get 2D skeletons, sends them to MotionBERT, 
        and returns the augmented results.
        If valid_boxes is provided, filters pose detections by IoU.
        """
        # Run YOLO-pose inference
        results = self.pose_model(frame_bgr, conf=0.5, verbose=False)
        
        detections = []
        
        if len(results) > 0 and results[0].keypoints is not None and results[0].keypoints.has_visible:
            keypoints_data = results[0].keypoints.data.cpu().numpy() # [N, 17, 3] (x, y, conf)
            boxes = results[0].boxes.xyxy.cpu().numpy()
            
            for i, (kp, box) in enumerate(zip(keypoints_data, boxes)):
                # Filter out false positives by checking IoU with valid_boxes if provided
                if valid_boxes is not None:
                    # box is [x1, y1, x2, y2]
                    matched = False
                    for vbox in valid_boxes:
                        # Calculate IoU
                        xx1 = max(box[0], vbox[0])
                        yy1 = max(box[1], vbox[1])
                        xx2 = min(box[2], vbox[2])
                        yy2 = min(box[3], vbox[3])
                        w = max(0, xx2 - xx1)
                        h = max(0, yy2 - yy1)
                        inter = w * h
                        area_box = (box[2] - box[0]) * (box[3] - box[1])
                        area_vbox = (vbox[2] - vbox[0]) * (vbox[3] - vbox[1])
                        iou = inter / float(area_box + area_vbox - inter + 1e-6)
                        
                        # Use a generous threshold since models might frame differently
                        if iou > 0.3:
                            matched = True
                            break
                    
                    if not matched:
                        continue
                        
                # Track person using IoU to build temporal sequence
                best_iou = 0
                best_buffer_idx = -1
                
                for b_idx, buffer in enumerate(self.temporal_buffers):
                    vbox = buffer['bbox']
                    xx1, yy1 = max(box[0], vbox[0]), max(box[1], vbox[1])
                    xx2, yy2 = min(box[2], vbox[2]), min(box[3], vbox[3])
                    w, h = max(0, xx2 - xx1), max(0, yy2 - yy1)
                    inter = w * h
                    area_box = (box[2] - box[0]) * (box[3] - box[1])
                    area_vbox = (vbox[2] - vbox[0]) * (vbox[3] - vbox[1])
                    iou = inter / float(area_box + area_vbox - inter + 1e-6)
                    
                    if iou > best_iou:
                        best_iou = iou
                        best_buffer_idx = b_idx
                
                if best_iou > 0.3 and best_buffer_idx != -1:
                    # Update existing buffer
                    self.temporal_buffers[best_buffer_idx]['bbox'] = box
                    self.temporal_buffers[best_buffer_idx]['keypoints'].append(kp.tolist())
                    self.temporal_buffers[best_buffer_idx]['last_seen'] = time.time()
                    sequence = list(self.temporal_buffers[best_buffer_idx]['keypoints'])
                else:
                    # Create new buffer
                    new_dq = deque(maxlen=self.max_frames)
                    new_dq.append(kp.tolist())
                    self.temporal_buffers.append({
                        'bbox': box,
                        'keypoints': new_dq,
                        'last_seen': time.time()
                    })
                    sequence = list(new_dq)
                    
                # Send temporal sequence to MMAction2 API
                try:
                    payload = {
                        "keypoints_sequence": sequence, 
                        "frame_width": frame_bgr.shape[1],
                        "frame_height": frame_bgr.shape[0]
                    }
                    
                    # We use a short timeout because video streams shouldn't block forever
                    response = requests.post(self.microservice_url, json=payload, timeout=2.0)
                    if response.status_code == 200:
                        data = response.json()
                        action = data.get("action", "Unknown")
                        action_confidence = data.get("confidence", 0.0)
                        
                        detections.append({
                            "bbox": box.tolist(),
                            "keypoints": kp.tolist(),
                            "action": action,
                            "action_confidence": action_confidence,
                            "is_suspicious": action in ["fighting", "running", "falling"]
                        })
                    else:
                        detections.append({
                            "bbox": box.tolist(),
                            "keypoints": kp.tolist(),
                            "action": "Error",
                            "action_confidence": 0.0,
                            "is_suspicious": False
                        })
                except Exception as e:
                    # Microservice down or timeout
                    detections.append({
                        "bbox": box.tolist(),
                        "keypoints": kp.tolist(),
                        "action": "Offline",
                        "action_confidence": 0.0,
                        "is_suspicious": False
                    })
        # Cleanup old temporal buffers
        current_time = time.time()
        self.temporal_buffers = [b for b in self.temporal_buffers if current_time - b['last_seen'] < 2.0]
        
        return detections
