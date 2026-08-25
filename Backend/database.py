import sqlite3
import json
import base64
import cv2
import numpy as np
from pathlib import Path
from face_engine import face_engine
import re

DB_PATH = Path(__file__).parent / "faces.db"

def normalize_plate(plate: str) -> str:
    if not plate:
        return ""
    return re.sub(r'[^A-Z0-9]', '', plate.upper())

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS known_faces (
            subject_name TEXT PRIMARY KEY,
            additional_info TEXT,
            photo_base64 TEXT,
            feature_vector BLOB,
            threat_level INTEGER DEFAULT 0,
            category TEXT DEFAULT 'Normal'
        )
    ''')
    
    # --- Registered Vehicles Table ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS registered_vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plate_number TEXT,
            normalized_plate TEXT,
            vehicle_type TEXT,
            make TEXT,
            model TEXT,
            color TEXT,
            owner_name TEXT,
            status TEXT,
            risk_level TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # --- Suspicious Vehicles / Watchlist ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS suspicious_vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plate_number TEXT NOT NULL,
            normalized_plate TEXT UNIQUE NOT NULL,
            vehicle_type TEXT,
            vehicle_make TEXT,
            vehicle_model TEXT,
            vehicle_color TEXT,
            status TEXT DEFAULT 'ACTIVE',
            risk_level TEXT DEFAULT 'HIGH',
            reason TEXT,
            source_reference TEXT,
            case_reference TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # --- ANPR Events Table ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS anpr_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT UNIQUE,
            plate_number TEXT,
            normalized_plate TEXT,
            vehicle_class TEXT,
            vehicle_track_id TEXT,
            vehicle_confidence REAL,
            plate_confidence REAL,
            ocr_confidence REAL,
            match_type TEXT,
            risk_level TEXT,
            risk_score INTEGER,
            camera_id TEXT,
            first_seen DATETIME,
            last_seen DATETIME,
            sighting_count INTEGER DEFAULT 1,
            alert_generated BOOLEAN DEFAULT 0,
            snapshot_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # --- Virtual Fence Tables ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vf_zones (
            id TEXT PRIMARY KEY,
            name TEXT,
            type TEXT,
            camera_id TEXT,
            severity TEXT,
            boundary TEXT,
            enabled BOOLEAN DEFAULT 1,
            alert_enabled BOOLEAN DEFAULT 1,
            color TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vf_authorized_persons (
            zone_id TEXT,
            person_id TEXT,
            PRIMARY KEY (zone_id, person_id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vf_events (
            id TEXT PRIMARY KEY,
            zone_id TEXT,
            camera_id TEXT,
            track_id TEXT,
            person_id TEXT,
            person_name TEXT,
            recognition_status TEXT,
            confidence REAL,
            event_type TEXT,
            severity TEXT,
            reason TEXT,
            snapshot_path TEXT,
            status TEXT DEFAULT 'ACTIVE',
            acknowledged_at DATETIME,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    
    # Ensure columns exist if tables were created previously
    migrate_tables()
    
    seed_dummy_vehicles()
    seed_watchlist()
    seed_virtual_fence()

def migrate_tables():
    """Add columns if missing from old schema"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Safely migrate existing tables if upgrading from v1
    try:
        cursor.execute("ALTER TABLE registered_vehicles ADD COLUMN normalized_plate TEXT")
    except: pass
    try:
        cursor.execute("ALTER TABLE registered_vehicles ADD COLUMN risk_level TEXT")
    except: pass
    try:
        cursor.execute("ALTER TABLE registered_vehicles ADD COLUMN vehicle_type TEXT")
    except: pass
    try:
        cursor.execute("ALTER TABLE registered_vehicles ADD COLUMN make TEXT")
    except: pass
    try:
        cursor.execute("ALTER TABLE registered_vehicles ADD COLUMN notes TEXT")
    except: pass
    
    # Add threat_level and category to known_faces
    try:
        cursor.execute("ALTER TABLE known_faces ADD COLUMN threat_level INTEGER DEFAULT 0")
    except: pass
    try:
        cursor.execute("ALTER TABLE known_faces ADD COLUMN category TEXT DEFAULT 'Normal'")
    except: pass
    
    conn.commit()
    conn.close()

def seed_dummy_vehicles():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    dummy_data = [
        ("DL 3C CQ 1234", "DL3CCQ1234", "Car", "Maruti Suzuki", "Dzire", "White", "Rajesh Kumar", "NORMAL", "LOW", "Clean"),
        ("KA 03 MS 9012", "KA03MS9012", "Car", "Hyundai", "Elite i20", "Red", "Priya Sharma", "NORMAL", "LOW", "Clean"),
        ("DL 10 CE 7890", "DL10CE7890", "Car", "Maruti Suzuki", "Ciaz", "Grey", "Neha Gupta", "NORMAL", "LOW", "Clean"),
        ("HR 51 BQ 3456", "HR51BQ3456", "Car", "Mahindra", "XUV500", "White", "Suresh Menon", "NORMAL", "LOW", "Clean"),
        ("DL8CAF5032", "DL8CAF5032", "Car", "Unknown", "Sedan", "Black", "Demo Owner", "NORMAL", "LOW", "Demo"),
        ("KA03MN9012", "KA03MN9012", "Car", "Unknown", "Hatchback", "Red", "Demo Owner", "NORMAL", "LOW", "Demo")
    ]
    
    for v in dummy_data:
        cursor.execute("SELECT id FROM registered_vehicles WHERE normalized_plate = ?", (v[1],))
        if not cursor.fetchone():
            try:
                cursor.execute('''
                    INSERT INTO registered_vehicles (plate_number, normalized_plate, vehicle_type, make, model, color, owner_name, status, risk_level, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', v)
            except Exception as e:
                print("Skipping insert due to schema mismatch:", e)
            
    conn.commit()
    conn.close()

def seed_watchlist():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    dummy_data = [
        ("UP32AB1234", "UP32AB1234", "Car", "Unknown", "SUV", "White", "ACTIVE", "CRITICAL", "Demo watchlist entry", "REF-001"),
        ("HR26DX5678", "HR26DX5678", "Car", "Unknown", "SUV", "Silver", "ACTIVE", "HIGH", "Demo suspicious", "REF-002"),
        ("BR01CD9876", "BR01CD9876", "Motorcycle", "Unknown", "Unknown", "Unknown", "UNDER_REVIEW", "MEDIUM", "Requires verification", "REF-003"),
        ("HR 26 DK 5678", "HR26DK5678", "Car", "Mahindra", "XUV500", "Silver", "ACTIVE", "CRITICAL", "Robbery Suspect", "REF-004"),
        ("HR 26 DK 5679", "HR26DK5679", "Car", "Maruti Suzuki", "Swift", "Red", "ACTIVE", "HIGH", "Reported stolen", "REF-005"),
        ("DL 2C AT 6789", "DL2CAT6789", "Car", "Mercedes-Benz", "E-Class", "Black", "ACTIVE", "HIGH", "VIP Escort needed", "REF-006")
    ]
    
    for v in dummy_data:
        cursor.execute('''
            INSERT OR IGNORE INTO suspicious_vehicles (plate_number, normalized_plate, vehicle_type, vehicle_make, vehicle_model, vehicle_color, status, risk_level, reason, case_reference)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', v)
        
    conn.commit()
    conn.close()

def seed_virtual_fence():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if zones already exist
    cursor.execute("SELECT id FROM vf_zones LIMIT 1")
    if cursor.fetchone():
        conn.close()
        return
        
    zones_data = [
        ("FZ-001", "Zone A - North Perimeter", "BOUNDARY", "CAM-001", "HIGH", json.dumps([{"x": 0.1, "y": 0.1}, {"x": 0.9, "y": 0.1}, {"x": 0.9, "y": 0.9}, {"x": 0.1, "y": 0.9}]), 1, 1, "#3b82f6"),
        ("FZ-002", "Zone B - Restricted Inner", "RESTRICTED", "CAM-002", "CRITICAL", json.dumps([{"x": 0.3, "y": 0.25}, {"x": 0.7, "y": 0.25}, {"x": 0.7, "y": 0.65}, {"x": 0.3, "y": 0.65}]), 1, 1, "#ef4444"),
        ("FZ-003", "Zone C - Warning Buffer", "WARNING", "CAM-001", "MEDIUM", json.dumps([{"x": 0.2, "y": 0.18}, {"x": 0.8, "y": 0.18}, {"x": 0.8, "y": 0.78}, {"x": 0.2, "y": 0.78}]), 1, 1, "#f59e0b"),
        ("FZ-004", "Entry Gate Alpha", "ENTRY", "CAM-004", "MEDIUM", json.dumps([{"x": 0.05, "y": 0.4}, {"x": 0.17, "y": 0.4}, {"x": 0.17, "y": 0.6}, {"x": 0.05, "y": 0.6}]), 1, 1, "#10b981")
    ]
    
    for z in zones_data:
        cursor.execute('''
            INSERT INTO vf_zones (id, name, type, camera_id, severity, boundary, enabled, alert_enabled, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', z)
        
    auth_data = [
        ("FZ-001", "Officer Raj"),
        ("FZ-002", "Officer Raj"),
        ("FZ-001", "Officer Sharma"),
        ("FZ-001", "Supervisor Kumar"),
        ("FZ-002", "Supervisor Kumar"),
        ("FZ-003", "Supervisor Kumar")
    ]
    
    for a in auth_data:
        cursor.execute("INSERT INTO vf_authorized_persons (zone_id, person_id) VALUES (?, ?)", a)
        
    conn.commit()
    conn.close()

def register_face(subject_name: str, additional_info: dict, photo_bytes: bytes, threat_level: int = 0):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    nparr = np.frombuffer(photo_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    face, feature = face_engine.extract_features(img)
    if feature is None:
        raise Exception("No face detected in the image.")
        
    feature_bytes = feature.tobytes()
    info_json = json.dumps(additional_info)
    photo_base64 = base64.b64encode(photo_bytes).decode('utf-8')
    
    category = "Criminal" if threat_level >= 50 else "Normal"
    
    try:
        cursor.execute('''
            INSERT INTO known_faces (subject_name, additional_info, photo_base64, feature_vector, threat_level, category)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(subject_name) DO UPDATE SET
            additional_info=excluded.additional_info,
            photo_base64=excluded.photo_base64,
            feature_vector=excluded.feature_vector,
            threat_level=excluded.threat_level,
            category=excluded.category
        ''', (subject_name, info_json, photo_base64, feature_bytes, threat_level, category))
        conn.commit()
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        conn.close()

def get_face_info(subject_name: str):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT additional_info, photo_base64, threat_level, category FROM known_faces WHERE subject_name = ?', (subject_name,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "subject_name": subject_name, 
            "additional_info": json.loads(row[0]), 
            "photo_base64": row[1],
            "threat_level": row[2] if len(row) > 2 else 0,
            "category": row[3] if len(row) > 3 else "Normal"
        }
    return None

def get_all_features():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT subject_name, feature_vector FROM known_faces WHERE feature_vector IS NOT NULL')
    rows = cursor.fetchall()
    conn.close()
    return {row[0]: row[1] for row in rows}

def get_all_vehicles():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM registered_vehicles')
        rows = cursor.fetchall()
    except:
        rows = []
    conn.close()
    return [dict(row) for row in rows]

def get_all_suspicious_vehicles():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM suspicious_vehicles')
        rows = cursor.fetchall()
    except:
        rows = []
    conn.close()
    return [dict(row) for row in rows]

def register_vehicle(plate_number: str, model: str, color: str, owner_name: str, status: str, warrants: str, flagged: bool):
    """Legacy wrapper for backward compatibility with main.py"""
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    normalized = normalize_plate(plate_number)
    risk_level = "CRITICAL" if flagged else "NORMAL"
    
    if flagged:
        # Add to watchlist
        cursor.execute('''
            INSERT OR REPLACE INTO suspicious_vehicles (plate_number, normalized_plate, vehicle_model, vehicle_color, status, risk_level, reason)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (plate_number, normalized, model, color, status, risk_level, warrants))
    else:
        # Add to registered
        cursor.execute('''
            INSERT INTO registered_vehicles (plate_number, normalized_plate, model, color, owner_name, status, risk_level, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (plate_number, normalized, model, color, owner_name, status, risk_level, warrants))
        
    conn.commit()
    conn.close()

def log_anpr_event(event_data: dict):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if event_id already exists for deduplication update
        cursor.execute("SELECT id, sighting_count FROM anpr_events WHERE event_id = ?", (event_data.get('event_id'),))
        row = cursor.fetchone()
        
        if row:
            # Update existing event
            sighting_count = row[1] + 1
            cursor.execute('''
                UPDATE anpr_events 
                SET last_seen = CURRENT_TIMESTAMP, sighting_count = ?
                WHERE id = ?
            ''', (sighting_count, row[0]))
        else:
            # Insert new event
            cursor.execute('''
                INSERT INTO anpr_events (
                    event_id, plate_number, normalized_plate, vehicle_class, vehicle_track_id, 
                    vehicle_confidence, plate_confidence, ocr_confidence, match_type, 
                    risk_level, risk_score, camera_id, first_seen, last_seen, snapshot_path
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
            ''', (
                event_data.get('event_id'), event_data.get('plate_number'), event_data.get('normalized_plate'),
                event_data.get('vehicle_class'), event_data.get('vehicle_track_id'), event_data.get('vehicle_confidence'),
                event_data.get('plate_confidence'), event_data.get('ocr_confidence'), event_data.get('match_type'),
                event_data.get('risk_level'), event_data.get('risk_score'), event_data.get('camera_id'),
                event_data.get('snapshot_path')
            ))
        conn.commit()
    except Exception as e:
        print(f"Error logging ANPR event: {e}")
    finally:
        conn.close()
