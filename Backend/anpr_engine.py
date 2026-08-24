import cv2
import numpy as np
import easyocr
import re

# Initialize EasyOCR reader
try:
    reader = easyocr.Reader(['en'], gpu=False)
except Exception as e:
    print(f"Error initializing EasyOCR: {e}")
    reader = None

def clean_plate_text(text: str) -> str:
    cleaned = re.sub(r'[^A-Z0-9]', '', text.upper())
    if len(cleaned) < 4:
        return ""
    if len(cleaned) >= 8 and len(cleaned) <= 10:
        match = re.match(r'^([A-Z]{2})([0-9]{1,2})([A-Z]{1,2})([0-9]{4})$', cleaned)
        if match:
            return f"{match.group(1)} {match.group(2)} {match.group(3)} {match.group(4)}"
    return cleaned

def extract_license_plate(frame: np.ndarray, xmin: int, ymin: int, xmax: int, ymax: int):
    if reader is None:
        return None
    vehicle_crop = frame[ymin:ymax, xmin:xmax]
    if vehicle_crop.size == 0:
        return None
        
    h, w, _ = vehicle_crop.shape
    start_y = int(h * 0.5)
    lower_half = vehicle_crop[start_y:h, :]
    gray = cv2.cvtColor(lower_half, cv2.COLOR_BGR2GRAY)
    filtered = cv2.bilateralFilter(gray, 11, 17, 17)
    
    results = reader.readtext(filtered)
    best_text = ""
    best_conf = 0.0
    
    for (bbox, text, prob) in results:
        cleaned = clean_plate_text(text)
        if len(cleaned) >= 4 and prob > best_conf:
            best_text = cleaned
            best_conf = prob
            
    if not best_text:
        results = reader.readtext(gray) 
        for (bbox, text, prob) in results:
            cleaned = clean_plate_text(text)
            if len(cleaned) >= 4 and prob > best_conf:
                best_text = cleaned
                best_conf = prob
                
    return best_text if best_text else None

from difflib import SequenceMatcher

def get_db_vehicle(plate_text: str, registered_vehicles: list):
    if not plate_text:
        return None
    plate_clean = plate_text.replace(" ", "")
    
    best_match = None
    best_ratio = 0.0
    
    for v in registered_vehicles:
        v_clean = v['plate_number'].replace(" ", "")
        
        # Exact match or substring match is an automatic win
        if plate_clean == v_clean or v_clean in plate_clean or plate_clean in v_clean:
            return v
            
        # Fuzzy match
        ratio = SequenceMatcher(None, plate_clean, v_clean).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_match = v
            
    # If the similarity is above 80%, consider it a match
    if best_ratio > 0.8:
        return best_match
        
    return None
