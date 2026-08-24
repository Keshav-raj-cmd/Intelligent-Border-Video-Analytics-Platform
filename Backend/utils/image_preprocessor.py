import cv2
import numpy as np

class ImagePreprocessor:
    @staticmethod
    def apply_pipeline(plate_crop, profile="adaptive_threshold"):
        """
        Applies image enhancement to the plate crop before OCR.
        Supported profiles: 'original', 'grayscale', 'clahe', 'adaptive_threshold'
        """
        if plate_crop is None or plate_crop.size == 0:
            return None
            
        if profile == "original":
            return plate_crop
            
        gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
        
        if profile == "grayscale":
            return gray
            
        # Noise reduction
        filtered = cv2.bilateralFilter(gray, 11, 17, 17)
        
        if profile == "clahe":
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            return clahe.apply(filtered)
            
        if profile == "adaptive_threshold":
            # Better for shadows
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            cl1 = clahe.apply(filtered)
            thresh = cv2.adaptiveThreshold(cl1, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            return thresh
            
        return plate_crop
