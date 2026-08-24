from difflib import SequenceMatcher
from database import get_all_vehicles, get_all_suspicious_vehicles

class WatchlistService:
    @staticmethod
    def match_plate(plate_clean: str):
        """
        Matches a cleaned plate against registered and suspicious vehicles.
        Returns:
            match_data (dict or None),
            match_type (str): 'EXACT_MATCH', 'HIGH_CONFIDENCE_MATCH', 'POSSIBLE_MATCH', 'NO_MATCH',
            source (str): 'WATCHLIST' or 'REGISTERED'
        """
        if not plate_clean:
            return None, 'NO_MATCH', None
            
        suspicious = get_all_suspicious_vehicles()
        registered = get_all_vehicles()
        
        # 1. Check Watchlist first (higher priority)
        best_match, m_type = WatchlistService._find_best_match(plate_clean, suspicious)
        if best_match and m_type in ['EXACT_MATCH', 'HIGH_CONFIDENCE_MATCH']:
            return best_match, m_type, 'WATCHLIST'
            
        # 2. Check Registered Vehicles
        best_reg, r_type = WatchlistService._find_best_match(plate_clean, registered)
        if best_reg and r_type in ['EXACT_MATCH', 'HIGH_CONFIDENCE_MATCH']:
            return best_reg, r_type, 'REGISTERED'
            
        # 3. If no exact/high confidence, return the possible match from watchlist if it exists
        if best_match:
            return best_match, m_type, 'WATCHLIST'
            
        # 4. Fallback to possible match from registered
        if best_reg:
            return best_reg, r_type, 'REGISTERED'
            
        return None, 'NO_MATCH', None

    @staticmethod
    def _find_best_match(plate_clean: str, db_list: list):
        best_match = None
        best_ratio = 0.0
        
        for v in db_list:
            v_clean = v.get('normalized_plate', '')
            if not v_clean:
                continue
                
            if plate_clean == v_clean:
                return v, 'EXACT_MATCH'
                
            if v_clean in plate_clean or plate_clean in v_clean:
                # Substring match is strong, but let's just call it high confidence
                best_match = v
                best_ratio = 0.95
                continue
                
            ratio = SequenceMatcher(None, plate_clean, v_clean).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = v
                
        if best_ratio >= 0.85:
            return best_match, 'HIGH_CONFIDENCE_MATCH'
        elif best_ratio >= 0.70:
            return best_match, 'POSSIBLE_MATCH'
            
        return None, 'NO_MATCH'
