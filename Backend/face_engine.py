import cv2
import numpy as np
import os
from pathlib import Path

MODELS_DIR = Path(__file__).parent / "models"

class LocalFaceEngine:
    def __init__(self):
        self.detector = cv2.FaceDetectorYN.create(
            str(MODELS_DIR / "face_detection_yunet_2023mar.onnx"),
            "",
            (320, 320),
            0.8, # score threshold
            0.3, # nms threshold
            5000 # top k
        )
        self.recognizer = cv2.FaceRecognizerSF.create(
            str(MODELS_DIR / "face_recognition_sface_2021dec.onnx"),
            ""
        )
    
    def extract_features(self, img_bgr):
        height, width, _ = img_bgr.shape
        self.detector.setInputSize((width, height))
        _, faces = self.detector.detect(img_bgr)
        
        if faces is None or len(faces) == 0:
            return None, None
            
        # Get largest face by area
        largest_face = max(faces, key=lambda f: f[2] * f[3])
        
        aligned_face = self.recognizer.alignCrop(img_bgr, largest_face)
        feature = self.recognizer.feature(aligned_face)
        return largest_face, feature
        
    def detect_and_extract_all(self, img_bgr):
        height, width, _ = img_bgr.shape
        self.detector.setInputSize((width, height))
        _, faces = self.detector.detect(img_bgr)
        
        results = []
        if faces is not None:
            for face in faces:
                aligned_face = self.recognizer.alignCrop(img_bgr, face)
                feature = self.recognizer.feature(aligned_face)
                results.append((face, feature))
        return results

    def match_feature(self, target_feature, database_features_dict, threshold=0.363):
        best_match = None
        best_score = 0.0
        
        for subject_name, db_feature_bytes in database_features_dict.items():
            db_feature = np.frombuffer(db_feature_bytes, dtype=np.float32).reshape(1, 128)
            score = self.recognizer.match(target_feature, db_feature, cv2.FaceRecognizerSF_FR_COSINE)
            if score > threshold and score > best_score:
                best_score = score
                best_match = subject_name
                
        return best_match, best_score

face_engine = LocalFaceEngine()
