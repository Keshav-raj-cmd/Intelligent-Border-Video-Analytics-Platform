from virtual_fence.geometry import ZoneGeometry
from virtual_fence.decision_engine import IntrusionDecisionEngine
import time

def test_polygon():
    polygon = [
        {"x": 0.1, "y": 0.1},
        {"x": 0.9, "y": 0.1},
        {"x": 0.9, "y": 0.9},
        {"x": 0.1, "y": 0.9}
    ]
    frame_width = 1000
    frame_height = 1000
    
    # Bottom center is 0.5, 0.5 -> 500, 500
    p1 = (500, 500)
    assert ZoneGeometry.is_inside_polygon(p1, polygon, frame_width, frame_height) == True
    
    # Bottom center is 0.0, 0.0 -> 0, 0
    p2 = (0, 0)
    assert ZoneGeometry.is_inside_polygon(p2, polygon, frame_width, frame_height) == False
    
    print("Geometry tests passed!")

def test_decision_logic():
    engine = IntrusionDecisionEngine()
    zone_b = {"id": "FZ-002", "name": "Zone B", "camera_id": "CAM-002", "severity": "CRITICAL"}
    
    # Test 1: Authorized person enters authorized zone
    event1 = engine.evaluate(zone_b, "42", "P001", "Officer Raj", 0.9, "recognized", ["Officer Raj"])
    assert event1 is None # Event should be ignored for alert purposes or returned if needed. In our logic, it returns None for AUTHORIZED_ENTRY.
    
    # Clean state
    engine.handle_exit("FZ-002", "42")
    engine.cooldowns.clear()
    
    # Test 2: Known person enters unauthorized zone
    event2 = engine.evaluate(zone_b, "43", "P002", "Officer Sharma", 0.94, "recognized", ["Officer Raj"])
    assert event2 is not None
    assert event2["event_type"] == "UNAUTHORIZED_INTRUSION"
    assert event2["severity"] == "CRITICAL"
    
    # Test 4: Person remains inside (no duplicate)
    event3 = engine.evaluate(zone_b, "43", "P002", "Officer Sharma", 0.94, "recognized", ["Officer Raj"])
    assert event3 is None # state blocked by active_intrusions
    
    # Test 5: Person exits
    engine.handle_exit("FZ-002", "43")
    assert ("FZ-002", "43") not in engine.active_intrusions
    
    # Test 3: Unknown person enters restricted zone
    # Simulate time pass to clear cooldown
    engine.cooldowns.clear()
    event4 = engine.evaluate(zone_b, "44", None, "Unknown", 0.2, "unknown", ["Officer Raj"])
    assert event4 is not None
    assert event4["event_type"] == "UNKNOWN_INTRUSION"
    
    print("Decision Logic tests passed!")

if __name__ == "__main__":
    test_polygon()
    test_decision_logic()
