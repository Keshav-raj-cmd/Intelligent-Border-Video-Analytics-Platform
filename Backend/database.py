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
            subject_name TEXT PRIMARY KEY,
            additional_info TEXT,
            photo_base64 TEXT,
            feature_vector BLOB
        )
    ''')
    
    # --- ANPR / Vehicles Table ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS registered_vehicles (
            plate_number TEXT PRIMARY KEY,
            model TEXT,
            color TEXT,
            owner_name TEXT,
            status TEXT,
            warrants TEXT,
            flagged BOOLEAN
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS anpr_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plate_number TEXT,
            is_suspected BOOLEAN,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    
    seed_dummy_vehicles()

def seed_dummy_vehicles():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    dummy_data = [
        ("DL 3C CQ 1234", "Maruti Suzuki Dzire", "White", "Rajesh Kumar", "CLEAN", "None", False),
        ("HR 26 DK 5678", "Mahindra XUV500", "Silver", "Amit Singh", "WANTED", "Robbery Suspect", True),
        ("KA 03 MS 9012", "Hyundai Elite i20", "Red", "Priya Sharma", "CLEAN", "None", False),
        ("HR 26 DK 5679", "Maruti Suzuki Swift", "Red", "Vikram Rathore", "STOLEN", "Reported stolen on 12th Aug", True),
        ("DL 10 CE 7890", "Maruti Suzuki Ciaz", "Grey", "Neha Gupta", "CLEAN", "None", False),
        ("HR 51 BQ 3456", "Mahindra XUV500", "White", "Suresh Menon", "CLEAN", "None", False),
        ("DL 2C AT 6789", "Mercedes-Benz E-Class", "Black", "Karan Johar", "FLAGGED", "VIP Escort needed", True),
    ]
    
    for v in dummy_data:
        cursor.execute('''
            INSERT OR IGNORE INTO registered_vehicles (plate_number, model, color, owner_name, status, warrants, flagged)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', v)
        
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

# --- Vehicle Registration Functions ---
def register_vehicle(plate_number, model, color, owner_name, status, warrants, flagged):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO registered_vehicles (plate_number, model, color, owner_name, status, warrants, flagged)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(plate_number) DO UPDATE SET
        model=excluded.model, color=excluded.color, owner_name=excluded.owner_name,
        status=excluded.status, warrants=excluded.warrants, flagged=excluded.flagged
    ''', (plate_number, model, color, owner_name, status, warrants, flagged))
    conn.commit()
    conn.close()

def get_all_vehicles():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM registered_vehicles')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def log_anpr_event(plate_number: str, is_suspected: bool):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO anpr_events (plate_number, is_suspected)
        VALUES (?, ?)
    ''', (plate_number, is_suspected))
    conn.commit()
    conn.close()
