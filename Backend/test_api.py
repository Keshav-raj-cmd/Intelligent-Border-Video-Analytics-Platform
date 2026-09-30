import requests
import numpy as np
import cv2

# create a dummy image
img = np.zeros((480, 640, 3), dtype=np.uint8)
cv2.imwrite('dummy.jpg', img)

with open('dummy.jpg', 'rb') as f:
    res = requests.post('http://127.0.0.1:8000/detect', files={'file': f})
    print("detect:", res.status_code, res.text)
    
with open('dummy.jpg', 'rb') as f:
    res2 = requests.post('http://127.0.0.1:8000/detect-night', files={'file': f})
    print("detect-night:", res2.status_code, res2.text)
