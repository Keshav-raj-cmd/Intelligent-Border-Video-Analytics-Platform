import sqlite3
import json
import base64
import cv2
import numpy as np
from pathlib import Path
from face_engine import face_engine

DB_PATH = Path(__file__).parent / "faces.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS known_faces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_name TEXT UNIQUE NOT NULL,
            additional_info TEXT,
            photo_base64 TEXT,
            feature_vector BLOB
        )
    ''')
    conn.commit()
    conn.close()

def register_face(subject_name: str, additional_info: dict, photo_bytes: bytes):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Convert image bytes to numpy array for OpenCV
    nparr = np.frombuffer(photo_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Extract feature
    face, feature = face_engine.extract_features(img)
    if feature is None:
        raise Exception("No face detected in the image.")
        
    feature_bytes = feature.tobytes()
    info_json = json.dumps(additional_info)
    photo_base64 = base64.b64encode(photo_bytes).decode('utf-8')
    
    try:
        cursor.execute('''
            INSERT INTO known_faces (subject_name, additional_info, photo_base64, feature_vector)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(subject_name) DO UPDATE SET
            additional_info=excluded.additional_info,
            photo_base64=excluded.photo_base64,
            feature_vector=excluded.feature_vector
        ''', (subject_name, info_json, photo_base64, feature_bytes))
        conn.commit()
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        conn.close()

def get_face_info(subject_name: str):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT additional_info, photo_base64 FROM known_faces WHERE subject_name = ?', (subject_name,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "subject_name": subject_name,
            "additional_info": json.loads(row[0]),
            "photo_base64": row[1]
        }
    return None

def get_all_features():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT subject_name, feature_vector FROM known_faces WHERE feature_vector IS NOT NULL')
    rows = cursor.fetchall()
    conn.close()
    
    features_dict = {}
    for row in rows:
        features_dict[row[0]] = row[1]
    return features_dict
