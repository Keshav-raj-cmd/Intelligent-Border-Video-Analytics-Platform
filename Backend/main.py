import io
import torch
import cv2
import numpy as np
import base64
import io
import torch
import cv2
import numpy as np
import base64
import threading
import time
import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from huggingface_hub import hf_hub_download
from supervision import Detections
from pydantic import BaseModel

# --- Local Face Engine Integration ---
from database import register_face, get_face_info, get_all_features
from face_engine import face_engine

app = FastAPI(title="Thermal Human Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Authentication ---
class LoginRequest(BaseModel):
    username: str
    password: str

VALID_USERS = {
    "admin1": "password123",
    "admin2": "securepass456",
    "commander": "bravo789"
}

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    if req.username in VALID_USERS and VALID_USERS[req.username] == req.password:
        return JSONResponse(content={"token": f"dummy-token-{req.username}", "username": req.username})
    return JSONResponse(status_code=401, content={"error": "Invalid username or password"})

# PyTorch security rules fix (Monkey-patch torch.load for PyTorch 2.6+)
_original_torch_load = torch.load
def _patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_load

# Download model
model_path = hf_hub_download(
    repo_id="pitangent-ds/YOLOv8-human-detection-thermal",
    filename="model.pt"
)

# Load models
model = YOLO(model_path)
model_night = YOLO('yolov8n.pt')

# Night Vision Enhancer (CLAHE)
class ImageEnhancer:
    def __init__(self):
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    
    def enhance(self, frame: np.ndarray) -> np.ndarray:
        try:
            lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            l_enhanced = self.clahe.apply(l)
            lab_enhanced = cv2.merge([l_enhanced, a, b])
            return cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)
        except Exception:
            return frame

enhancer = ImageEnhancer()

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Convert bytes to cv2 image
        np_arr = np.frombuffer(contents, np.uint8)
        cv_image = cv2.imdecode(np_arr, cv2.IMREAD_ANYCOLOR)
        
        if cv_image is None:
            return JSONResponse(status_code=400, content={"error": "Failed to decode image"})
        
        # Run inference
        model_output = model(cv_image, conf=0.6, verbose=False)
        result = model_output[0]
        
        # Optionally parse with supervision (as requested, though we can also just use result.boxes)
        sv_detections = Detections.from_ultralytics(result)
        
        # Parse results for JSON response
        detections = []
        for i in range(len(sv_detections.xyxy)):
            x1, y1, x2, y2 = sv_detections.xyxy[i].tolist()
            conf = float(sv_detections.confidence[i])
            cls_id = int(sv_detections.class_id[i])
            
            # Using model's names dictionary if it has one, otherwise fallback to "human"
            class_name = result.names[cls_id] if hasattr(result, 'names') and cls_id in result.names else str(cls_id)
            
            detections.append({
                "xmin": x1,
                "ymin": y1,
                "xmax": x2,
                "ymax": y2,
                "confidence": conf,
                "class": class_name
            })
        
        return JSONResponse(content={"detections": detections})
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/detect-night")
async def detect_night(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        np_arr = np.frombuffer(contents, np.uint8)
        cv_image = cv2.imdecode(np_arr, cv2.IMREAD_ANYCOLOR)
        
        if cv_image is None:
            return JSONResponse(status_code=400, content={"error": "Failed to decode image"})
            
        # Detect if the video is already heavily green-tinted
        b, g, r = cv2.split(cv_image)
        mean_b = np.mean(b)
        mean_g = np.mean(g)
        mean_r = np.mean(r)
        is_already_green = bool((mean_g > mean_b + 15) and (mean_g > mean_r + 15))
        
        # Apply CLAHE enhancement
        enhanced_image = enhancer.enhance(cv_image)
        
        # Run inference on enhanced image using general purpose YOLOv8n
        model_output = model_night(enhanced_image, conf=0.4, verbose=False)
        result = model_output[0]
        
        sv_detections = Detections.from_ultralytics(result)
        
        detections = []
        for i in range(len(sv_detections.xyxy)):
            x1, y1, x2, y2 = sv_detections.xyxy[i].tolist()
            conf = float(sv_detections.confidence[i])
            cls_id = int(sv_detections.class_id[i])
            class_name = result.names[cls_id] if hasattr(result, 'names') and cls_id in result.names else str(cls_id)
            
            detections.append({
                "xmin": x1,
                "ymin": y1,
                "xmax": x2,
                "ymax": y2,
                "confidence": conf,
                "class": class_name
            })
            
        # Encode enhanced image to base64
        _, buffer = cv2.imencode('.jpg', enhanced_image, [cv2.IMWRITE_JPEG_QUALITY, 85])
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return JSONResponse(content={"detections": detections, "image_base64": img_base64, "is_already_green": is_already_green})
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/")
async def root():
    return {"message": "Thermal Human Detection API is running. Send a POST request to /detect with an image file."}

@app.post("/api/face/register")
async def api_face_register(
    subject_name: str = Form(...),
    info_json: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        contents = await file.read()
        
        # Save to local SQLite Database (also extracts and saves OpenCV feature vector)
        info_dict = json.loads(info_json)
        register_face(subject_name, info_dict, contents)
            
        return JSONResponse(content={"status": "success", "subject": subject_name})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/face/recognize")
async def api_face_recognize(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Decode image
        nparr = np.frombuffer(contents, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Get all registered features
        db_features = get_all_features()
        
        # Detect and extract all faces in the frame
        results = face_engine.detect_and_extract_all(img_bgr)
        
        detections = []
        for face, target_feature in results:
            # face is [x, y, w, h, ...]
            x, y, w, h = map(int, face[:4])
            
            best_match, best_score = face_engine.match_feature(target_feature, db_features)
            
            database_info = None
            class_name = "unknown"
            
            if best_match:
                class_name = best_match
                # Get rich info to return to frontend
                database_info = get_face_info(best_match)
                
            detections.append({
                "class": class_name,
                "confidence": float(best_score),
                "xmin": x,
                "ymin": y,
                "xmax": x + w,
                "ymax": y + h,
                "database_info": database_info
            })
            
        return JSONResponse(content={
            "detections": detections,
            "frame_width": img_bgr.shape[1],
            "frame_height": img_bgr.shape[0]
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# --- IP Camera Streaming Support ---
ipcam_cap = None
ipcam_latest_frame = None
ipcam_running = False
ipcam_thread = None

class IPCamStartRequest(BaseModel):
    url: str

def ipcam_daemon(url: str):
    global ipcam_cap, ipcam_latest_frame, ipcam_running
    ipcam_cap = cv2.VideoCapture(url)
    ipcam_cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    while ipcam_running:
        ret, frame = ipcam_cap.read()
        if ret:
            ipcam_latest_frame = frame
        else:
            time.sleep(0.01)
            
    if ipcam_cap:
        ipcam_cap.release()

@app.post("/api/face/ipcam/start")
async def start_ipcam(req: IPCamStartRequest):
    global ipcam_running, ipcam_thread
    if ipcam_running:
        # Stop existing stream if changing URL
        ipcam_running = False
        if ipcam_thread:
            ipcam_thread.join(timeout=2.0)
            
    ipcam_running = True
    ipcam_thread = threading.Thread(target=ipcam_daemon, args=(req.url,), daemon=True)
    ipcam_thread.start()
    return JSONResponse(content={"status": "started", "url": req.url})

@app.post("/api/face/ipcam/stop")
async def stop_ipcam():
    global ipcam_running, ipcam_thread, ipcam_latest_frame
    ipcam_running = False
    if ipcam_thread:
        ipcam_thread.join(timeout=1.0)
    ipcam_latest_frame = None
    return JSONResponse(content={"status": "stopped"})

@app.get("/api/face/ipcam/poll")
async def poll_ipcam():
    global ipcam_latest_frame
    
    if ipcam_latest_frame is None:
        return JSONResponse(status_code=503, content={"error": "No frame available yet", "detections": [], "frame_base64": None})
        
    try:
        # Copy to avoid race conditions
        img_bgr = ipcam_latest_frame.copy()
        
        # Get all registered features
        db_features = get_all_features()
        
        # Detect and extract all faces in the frame
        results = face_engine.detect_and_extract_all(img_bgr)
        
        detections = []
        for face, target_feature in results:
            x, y, w, h = map(int, face[:4])
            best_match, best_score = face_engine.match_feature(target_feature, db_features)
            
            database_info = None
            class_name = "unknown"
            
            if best_match:
                class_name = best_match
                database_info = get_face_info(best_match)
                
            detections.append({
                "class": class_name,
                "confidence": float(best_score),
                "xmin": x,
                "ymin": y,
                "xmax": x + w,
                "ymax": y + h,
                "database_info": database_info
            })
            
        # Encode frame to base64 JPEG to return to frontend
        _, buffer = cv2.imencode('.jpg', img_bgr)
        frame_b64 = base64.b64encode(buffer).decode('utf-8')
        
        return JSONResponse(content={
            "detections": detections, 
            "frame_base64": frame_b64,
            "frame_width": img_bgr.shape[1],
            "frame_height": img_bgr.shape[0]
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "detections": [], "frame_base64": None})
