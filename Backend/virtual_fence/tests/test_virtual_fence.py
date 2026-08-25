import pytest
import time
from unittest.mock import patch
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from virtual_fence.decision_engine import IntrusionDecisionEngine

@pytest.fixture
def engine():
    return IntrusionDecisionEngine()

@pytest.fixture
def mock_zone():
    return {
        "id": "zone_1",
        "name": "Restricted Area A",
        "camera_id": "cam_01",
        "severity": "CRITICAL"
    }

def test_authorized_entry(engine, mock_zone):
    # Setup
    track_id = "1"
    person_id = "p_001"
    person_name = "Officer Raj"
    confidence = 0.95
    recognition_status = "recognized"
    authorized_persons = ["Officer Raj", "Officer Sharma"]

    # Execute
    event = engine.evaluate(
        mock_zone, track_id, person_id, person_name, 
        confidence, recognition_status, authorized_persons
    )

    # Assert
    assert event is not None
    assert event["event_type"] == "AUTHORIZED_ENTRY"
    assert "Authorized entry by Officer Raj" in event["reason"]
    assert event["severity"] == "CRITICAL"
    # Ensure it's tracked as an active intrusion (so we don't spam logs)
    assert (mock_zone["id"], track_id) in engine.active_intrusions

def test_unauthorized_known_entry(engine, mock_zone):
    # Setup
    track_id = "2"
    person_id = "p_002"
    person_name = "Civilian Bob"
    confidence = 0.90
    recognition_status = "recognized"
    authorized_persons = ["Officer Raj", "Officer Sharma"]

    # Execute
    event = engine.evaluate(
        mock_zone, track_id, person_id, person_name, 
        confidence, recognition_status, authorized_persons
    )

    # Assert
    assert event is not None
    assert event["event_type"] == "UNAUTHORIZED_INTRUSION"
    assert "not authorized" in event["reason"]
    assert event["severity"] == "CRITICAL"

def test_unknown_intrusion(engine, mock_zone):
    # Setup
    track_id = "3"
    person_id = None
    person_name = "Unknown"
    confidence = 0.0
    recognition_status = "unknown"
    authorized_persons = ["Officer Raj"]

    # Execute
    event = engine.evaluate(
        mock_zone, track_id, person_id, person_name, 
        confidence, recognition_status, authorized_persons
    )

    # Assert
    assert event is not None
    assert event["event_type"] == "UNKNOWN_INTRUSION"
    assert "Unknown person entered" in event["reason"]

def test_cooldown_and_duplicate_prevention(engine, mock_zone):
    # Setup
    track_id = "4"
    
    # First entry
    event1 = engine.evaluate(
        mock_zone, track_id, None, "Unknown", 
        0.0, "unknown", []
    )
    assert event1 is not None

    # Immediate second entry (should be ignored due to active tracking)
    event2 = engine.evaluate(
        mock_zone, track_id, None, "Unknown", 
        0.0, "unknown", []
    )
    assert event2 is None

    # Exit the zone (starts cooldown)
    engine.handle_exit(mock_zone["id"], track_id)

    # Re-entry within cooldown period (should be ignored)
    event3 = engine.evaluate(
        mock_zone, track_id, None, "Unknown", 
        0.0, "unknown", []
    )
    assert event3 is None
    
    # Mock time passing beyond cooldown
    with patch('time.time', return_value=time.time() + 31):
        # Re-entry after cooldown period (should trigger new event)
        event4 = engine.evaluate(
            mock_zone, track_id, None, "Unknown", 
            0.0, "unknown", []
        )
        assert event4 is not None

def test_zone_exit_handling(engine, mock_zone):
    track_id = "5"
    
    # Enter
    engine.evaluate(mock_zone, track_id, None, "Unknown", 0.0, "unknown", [])
    assert (mock_zone["id"], track_id) in engine.active_intrusions
    
    # Exit
    engine.handle_exit(mock_zone["id"], track_id)
    
    assert (mock_zone["id"], track_id) not in engine.active_intrusions
    assert (mock_zone["id"], track_id) in engine.cooldowns
