from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
import sys
import numpy as np
import random

# In a real implementation:
# from mmaction.apis import init_recognizer, inference_recognizer

app = FastAPI(title="MMAction2 Microservice")

# model_config = 'configs/skeleton/posec3d/slowonly_r50_8xb16-u48-240e_ntu60-xsub-keypoint.py'
# model_checkpoint = 'checkpoints/slowonly_r50_8xb16-u48-240e_ntu60-xsub-keypoint.pth'
# model = init_recognizer(model_config, model_checkpoint, device='cuda:0')

@app.post("/predict_action")
async def predict_action(request: Request):
    try:
        data = await request.json()
        # keypoints_sequence is a list of T frames, where each frame is a list of 17 keypoints [x, y, conf]
        sequence = data.get("keypoints_sequence", [])
        
        if not sequence or len(sequence) == 0:
            return JSONResponse({"action": "Unknown", "confidence": 0.0})
            
        T = len(sequence)
        
        # We need at least a few frames for temporal context, but if we don't have enough, 
        # we can just use the latest frame.
        latest_frame = sequence[-1]
        
        if not latest_frame or len(latest_frame) < 17:
            return JSONResponse({"action": "Unknown", "confidence": 0.0})
        
        # --- MOCK MMAction2 INFERENCE ---
        # A real MMAction2 model would process the (1, 1, T, 17, 3) tensor here:
        # result = inference_recognizer(model, sequence)
        
        action = "Walking"
        confidence = 0.85
        
        # For the mock, we can just look at the latest frame, or calculate velocity over the sequence
        try:
            nose_y = latest_frame[0][1]
            l_shoulder_y = latest_frame[5][1]
            l_elbow_y = latest_frame[7][1]
            r_elbow_y = latest_frame[8][1]
            l_wrist_y = latest_frame[9][1]
            r_wrist_y = latest_frame[10][1]
            
            l_wrist_conf = latest_frame[9][2]
            r_wrist_conf = latest_frame[10][2]
            
            fighting_stance = False
            if (l_wrist_conf > 0.4 and l_wrist_y < l_elbow_y - 10) or (r_wrist_conf > 0.4 and r_wrist_y < r_elbow_y - 10):
                fighting_stance = True
            
            suspicious_stance = False
            if (l_wrist_conf > 0.4 and l_wrist_y < nose_y) and (r_wrist_conf > 0.4 and r_wrist_y < nose_y):
                suspicious_stance = True
                
            if suspicious_stance:
                action = "Suspicious"
                confidence = random.uniform(0.88, 0.96)
            elif fighting_stance:
                action = "Fighting"
                confidence = random.uniform(0.85, 0.95)
            elif (l_shoulder_y - nose_y) > 40:
                action = "Running"
                confidence = random.uniform(0.75, 0.85)
                
            # Simulate temporal confidence boosting: the longer we see the action, the higher the confidence
            if T > 10:
                confidence = min(0.99, confidence + (T * 0.005))
                
        except IndexError:
            pass
            
        return JSONResponse(content={"action": action, "confidence": confidence, "sequence_length": T})
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

if __name__ == "__main__":
    print(f"Starting MMAction2 Temporal Service on Python {sys.version}")
    uvicorn.run(app, host="127.0.0.1", port=8001)
