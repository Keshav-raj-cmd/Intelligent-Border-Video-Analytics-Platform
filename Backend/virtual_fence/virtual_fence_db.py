import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = Path(__file__).parent.parent / "faces.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- Zones CRUD ---
def get_all_vf_zones() -> List[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vf_zones")
    zones = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    # Parse JSON boundary and count recent alerts (dummy logic for alerts count can be added later)
    for zone in zones:
        zone['boundary'] = json.loads(zone['boundary']) if zone['boundary'] else []
        zone['enabled'] = bool(zone['enabled'])
        zone['alert_enabled'] = bool(zone['alert_enabled'])
        # Mocking alert count for now, will replace if needed
        zone['alertCount'] = 0 
        zone['lastTriggered'] = None
    return zones

def get_vf_zone(zone_id: str) -> Optional[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vf_zones WHERE id = ?", (zone_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    zone = dict(row)
    zone['boundary'] = json.loads(zone['boundary']) if zone['boundary'] else []
    zone['enabled'] = bool(zone['enabled'])
    zone['alert_enabled'] = bool(zone['alert_enabled'])
    return zone

def toggle_vf_zone(zone_id: str) -> Optional[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE vf_zones SET enabled = NOT enabled WHERE id = ?", (zone_id,))
    conn.commit()
    conn.close()
    return get_vf_zone(zone_id)

def get_vf_authorized_persons(zone_id: str) -> List[str]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT person_id FROM vf_authorized_persons WHERE zone_id = ?", (zone_id,))
    persons = [row['person_id'] for row in cursor.fetchall()]
    conn.close()
    return persons

# --- Events CRUD ---
def log_vf_event(event_data: Dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO vf_events (
                id, zone_id, camera_id, track_id, person_id, person_name, 
                recognition_status, confidence, event_type, severity, reason, snapshot_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            event_data['id'], event_data['zone_id'], event_data['camera_id'], 
            event_data['track_id'], event_data.get('person_id'), event_data.get('person_name'),
            event_data.get('recognition_status'), event_data.get('confidence'),
            event_data['event_type'], event_data['severity'], event_data['reason'],
            event_data.get('snapshot_path')
        ))
        conn.commit()
    except Exception as e:
        print(f"Error logging Virtual Fence event: {e}")
    finally:
        conn.close()

def get_recent_vf_events(limit: int = 20) -> List[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT e.*, z.name as zone_name 
        FROM vf_events e
        LEFT JOIN vf_zones z ON e.zone_id = z.id
        ORDER BY e.timestamp DESC LIMIT ?
    ''', (limit,))
    events = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return events

def get_vf_event(event_id: str) -> Optional[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT e.*, z.name as zone_name 
        FROM vf_events e
        LEFT JOIN vf_zones z ON e.zone_id = z.id
        WHERE e.id = ?
    ''', (event_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def acknowledge_vf_event(event_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE vf_events 
        SET status = 'ACKNOWLEDGED', acknowledged_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (event_id,))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

# --- Extended Zones CRUD ---
def create_vf_zone(zone_data: Dict) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO vf_zones (
                id, name, type, camera_id, severity, boundary, enabled, alert_enabled, color
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            zone_data['id'], zone_data['name'], zone_data['type'], zone_data['camera_id'],
            zone_data['severity'], json.dumps(zone_data['boundary']),
            zone_data.get('enabled', 1), zone_data.get('alert_enabled', 1), zone_data.get('color', '#ef4444')
        ))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creating zone: {e}")
        return False
    finally:
        conn.close()

def update_vf_zone(zone_id: str, zone_data: Dict) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE vf_zones SET
                name = ?, type = ?, camera_id = ?, severity = ?, boundary = ?, 
                enabled = ?, alert_enabled = ?, color = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            zone_data['name'], zone_data['type'], zone_data['camera_id'],
            zone_data['severity'], json.dumps(zone_data['boundary']),
            zone_data.get('enabled', 1), zone_data.get('alert_enabled', 1), zone_data.get('color', '#ef4444'),
            zone_id
        ))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error updating zone: {e}")
        return False
    finally:
        conn.close()

def delete_vf_zone(zone_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vf_zones WHERE id = ?", (zone_id,))
    zone_deleted = cursor.rowcount > 0
    
    # Cascade delete authorized persons for this zone
    if zone_deleted:
        cursor.execute("DELETE FROM vf_authorized_persons WHERE zone_id = ?", (zone_id,))
        
    conn.commit()
    conn.close()
    return zone_deleted

# --- Authorized Persons CRUD ---
def add_authorized_person(zone_id: str, person_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT OR IGNORE INTO vf_authorized_persons (zone_id, person_id) VALUES (?, ?)", (zone_id, person_id))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error authorizing person: {e}")
        return False
    finally:
        conn.close()

def remove_authorized_person(zone_id: str, person_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vf_authorized_persons WHERE zone_id = ? AND person_id = ?", (zone_id, person_id))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

def get_all_vf_persons() -> List[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    # Query from the known_faces table which holds identity definitions
    try:
        cursor.execute("SELECT subject_name, category, threat_level FROM known_faces")
        persons = [dict(row) for row in cursor.fetchall()]
    except:
        persons = []
    conn.close()
    return persons


# --- Videos CRUD ---
def create_vf_video(video_data: Dict) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO vf_videos (
                video_id, filename, file_path, source_type, duration, fps, width, height, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            video_data['video_id'], video_data['filename'], video_data['file_path'],
            video_data.get('source_type', 'UPLOADED'), video_data.get('duration'),
            video_data.get('fps'), video_data.get('width'), video_data.get('height'),
            video_data.get('status', 'UPLOADED')
        ))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creating video: {e}")
        return False
    finally:
        conn.close()

def get_all_vf_videos() -> List[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vf_videos ORDER BY uploaded_at DESC")
    videos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return videos

def get_vf_video(video_id: str) -> Optional[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vf_videos WHERE video_id = ?", (video_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_vf_video_status(video_id: str, status: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE vf_videos SET status = ? WHERE video_id = ?", (status, video_id))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

# --- Zone Suggestions CRUD ---
def create_vf_zone_suggestion(suggestion_data: Dict) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO vf_zone_suggestions (
                id, video_id, name, suggested_type, confidence, reason, boundary, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            suggestion_data['id'], suggestion_data['video_id'], suggestion_data['name'],
            suggestion_data['suggested_type'], suggestion_data['confidence'],
            suggestion_data['reason'], json.dumps(suggestion_data['boundary']),
            suggestion_data.get('status', 'PENDING')
        ))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creating zone suggestion: {e}")
        return False
    finally:
        conn.close()

def get_vf_zone_suggestions(video_id: str) -> List[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vf_zone_suggestions WHERE video_id = ? AND status = 'PENDING'", (video_id,))
    suggestions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    for s in suggestions:
        s['boundary'] = json.loads(s['boundary']) if s['boundary'] else []
    return suggestions

def update_vf_zone_suggestion_status(suggestion_id: str, status: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE vf_zone_suggestions SET status = ? WHERE id = ?", (status, suggestion_id))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success
