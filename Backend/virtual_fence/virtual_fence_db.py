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
