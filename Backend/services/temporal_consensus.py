from collections import defaultdict
import time

class TemporalConsensus:
    def __init__(self, min_confirmations=3, timeout_seconds=10.0):
        # track_id -> list of {"plate": str, "conf": float, "timestamp": float}
        self.history = defaultdict(list)
        self.min_confirmations = min_confirmations
        self.timeout = timeout_seconds

    def add_reading(self, track_id, plate_text, confidence):
        now = time.time()
        
        # Cleanup old entries for this track
        self.history[track_id] = [r for r in self.history[track_id] if now - r['timestamp'] < self.timeout]
        
        if plate_text:
            self.history[track_id].append({
                "plate": plate_text,
                "conf": confidence,
                "timestamp": now
            })

    def get_consensus(self, track_id):
        """
        Returns (best_plate, temporal_confidence, is_stable)
        """
        readings = self.history.get(track_id, [])
        if not readings:
            return None, 0.0, False
            
        freq = defaultdict(int)
        conf_sum = defaultdict(float)
        
        for r in readings:
            p = r["plate"]
            freq[p] += 1
            conf_sum[p] += r["conf"]
            
        # Find the most frequent reading
        best_plate = max(freq, key=freq.get)
        count = freq[best_plate]
        avg_conf = conf_sum[best_plate] / count
        
        # Calculate temporal confidence based on consistency
        temporal_conf = min(count / self.min_confirmations, 1.0) * avg_conf
        is_stable = count >= self.min_confirmations
        
        return best_plate, temporal_conf, is_stable
