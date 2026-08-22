import io
import torch
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from huggingface_hub import hf_hub_download
from supervision import Detections

app = FastAPI(title="Thermal Human Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Load model
model = YOLO(model_path)

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

@app.get("/")
def root():
    return {"message": "Thermal Human Detection API is running. Send a POST request to /detect with an image file."}
