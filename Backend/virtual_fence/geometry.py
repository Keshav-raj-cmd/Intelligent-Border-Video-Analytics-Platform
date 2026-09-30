import cv2
import numpy as np
from typing import List, Dict, Tuple

class ZoneGeometry:
    @staticmethod
    def is_inside_polygon(point: Tuple[float, float], polygon: List[Dict[str, float]], frame_width: int, frame_height: int) -> bool:
        """
        Check if a given (x, y) point is inside a normalized polygon using OpenCV pointPolygonTest.
        """
        if not polygon or len(polygon) < 3:
            return False
            
        # Convert normalized polygon coordinates to pixel coordinates
        pixel_polygon = []
        for p in polygon:
            pixel_polygon.append([int(p['x'] * frame_width), int(p['y'] * frame_height)])
            
        pixel_polygon_np = np.array(pixel_polygon, np.int32)
        pixel_polygon_np = pixel_polygon_np.reshape((-1, 1, 2))
        
        # Test the point
        # measureDist=False means it returns +1 (inside), -1 (outside), or 0 (on edge)
        result = cv2.pointPolygonTest(pixel_polygon_np, point, False)
        return result >= 0
        
    @staticmethod
    def get_bottom_center(x1: float, y1: float, x2: float, y2: float) -> Tuple[float, float]:
        """
        Return the bottom center coordinate of a bounding box. 
        This represents where a person's feet are touching the ground.
        """
        return ((x1 + x2) / 2.0, y2)
