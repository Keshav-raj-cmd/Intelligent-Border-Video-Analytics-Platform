import easyocr
import re
import numpy as np

class PlateOCR:
    def __init__(self):
        try:
            self.reader = easyocr.Reader(['en'], gpu=False)
        except Exception as e:
            print(f"Error initializing EasyOCR: {e}")
            self.reader = None

    def normalize_plate(self, text: str) -> str:
        """
        Strips all spaces, hyphens, and non-alphanumeric characters.
        """
        cleaned = re.sub(r'[^A-Z0-9]', '', text.upper())
        return cleaned

    def read_plate(self, image: np.ndarray):
        """
        Reads the plate from an image crop.
        Returns (best_text, confidence)
        """
        if self.reader is None or image is None or image.size == 0:
            return None, 0.0
            
        results = self.reader.readtext(image)
        best_text = ""
        best_conf = 0.0
        
        for (bbox, text, prob) in results:
            cleaned = self.normalize_plate(text)
            if len(cleaned) >= 4 and prob > best_conf:
                best_text = cleaned
                best_conf = float(prob)
                
        return best_text, best_conf
