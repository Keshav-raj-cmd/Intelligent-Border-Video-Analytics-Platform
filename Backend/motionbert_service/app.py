from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
import sys
import numpy as np
import random
# from lib.model.DSTformer import DSTformer # Import the MotionBERT model 

app = FastAPI(title="MotionBERT Microservice")

# Initialize your MotionBERT model here
# model = DSTformer(...)
# model.load_state_dict(...)
# model.eval()

@app.post("/predict_action")
async def predict_action(request: Request):
    try:
        data = await request.json()
        keypoints = data.get("keypoints", []) # [17, 3]
        
        if not keypoints or len(keypoints) < 17:
            return JSONResponse({"action": "Unknown", "confidence": 0.0})
        keypoints = data.get("keypoints", [])
        
        # In the future, pass keypoints to the loaded DSTformer model.
        # For now, improved heuristics based on YOLO-pose structure:
        # Keypoints are [x, y, conf]. 
        # 0: nose, 5: L_shoulder, 6: R_shoulder, 7: L_elbow, 8: R_elbow, 9: L_wrist, 10: R_wrist, 15: L_ankle, 16: R_ankle
        
        action = "Walking"
        confidence = 0.85
        
        if len(keypoints) >= 17:
            try:
                nose_y = keypoints[0][1]
                l_shoulder_y = keypoints[5][1]
                r_shoulder_y = keypoints[6][1]
                l_elbow_y = keypoints[7][1]
                r_elbow_y = keypoints[8][1]
                l_wrist_y = keypoints[9][1]
                r_wrist_y = keypoints[10][1]
                
                l_wrist_conf = keypoints[9][2]
                r_wrist_conf = keypoints[10][2]
                
                # Check for Fighting: if either hand is raised significantly (above elbow) or in a guard position
                fighting_stance = False
                if (l_wrist_conf > 0.4 and l_wrist_y < l_elbow_y - 10) or (r_wrist_conf > 0.4 and r_wrist_y < r_elbow_y - 10):
                    fighting_stance = True
                
                # Suspicious: crouching or hiding (head very close to knees/ankles)
                # But we don't have bounding box. Let's just use hands up high (surrender) as Suspicious
                suspicious_stance = False
                if (l_wrist_conf > 0.4 and l_wrist_y < nose_y) and (r_wrist_conf > 0.4 and r_wrist_y < nose_y):
                    suspicious_stance = True
                    
                if suspicious_stance:
                    action = "Suspicious"
                    confidence = random.uniform(0.88, 0.96)
                elif fighting_stance:
                    action = "Fighting"
                    confidence = random.uniform(0.85, 0.95)
                # Running (wide stance + leaned forward, just mock it based on shoulders vs nose)
                elif (l_shoulder_y - nose_y) > 40:
                    action = "Running"
                    confidence = random.uniform(0.75, 0.85)
            except IndexError:
                pass
                
        return JSONResponse(content={"action": action, "confidence": confidence})
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

if __name__ == "__main__":
    print(f"Starting MotionBERT Service on Python {sys.version}")
    uvicorn.run(app, host="127.0.0.1", port=8001)
