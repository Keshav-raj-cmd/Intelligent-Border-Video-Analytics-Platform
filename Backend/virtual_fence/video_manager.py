import os
import cv2
import uuid
import shutil
from datetime import datetime
from fastapi import UploadFile

# Configure storage path
STORAGE_BASE = os.environ.get("VIRTUAL_FENCE_VIDEO_STORAGE", "storage/virtual_fence/videos")
os.makedirs(STORAGE_BASE, exist_ok=True)

class VideoManager:
    @staticmethod
    def save_uploaded_video(file: UploadFile) -> dict:
        video_id = f"VID-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
        
        # Ensure safe filename
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'mp4'
        if ext not in ['mp4', 'avi', 'mov', 'mkv']:
            raise ValueError(f"Unsupported video format: {ext}")
            
        stored_filename = f"{video_id}.{ext}"
        file_path = os.path.join(STORAGE_BASE, stored_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract metadata
        metadata = VideoManager.extract_metadata(file_path)
        
        return {
            "video_id": video_id,
            "filename": file.filename,
            "file_path": file_path,
            "duration": metadata.get("duration", 0),
            "fps": metadata.get("fps", 0),
            "width": metadata.get("width", 0),
            "height": metadata.get("height", 0)
        }

    @staticmethod
    def extract_metadata(file_path: str) -> dict:
        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            return {}
            
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        duration = 0
        if fps > 0 and frame_count > 0:
            duration = frame_count / fps
            
        cap.release()
        
        return {
            "fps": fps,
            "duration": duration,
            "width": width,
            "height": height
        }
