class RiskEngine:
    @staticmethod
    def calculate_risk(match_data, match_type, source, temporal_confidence, is_stable):
        """
        Calculates the risk score and level based on matching and temporal consensus.
        """
        if match_type == 'NO_MATCH':
            if is_stable:
                return "REVIEW", 50
            return "NORMAL", 10
            
        if not is_stable:
            return "REVIEW", 40

        risk_level = "NORMAL"
        risk_score = 10
        
        # If it matches something in the DB, extract its reported risk level
        db_risk = match_data.get('risk_level', 'LOW') if match_data else 'LOW'
        
        # Base score on DB risk
        if db_risk == 'CRITICAL':
            risk_score = 90
            risk_level = "CRITICAL"
        elif db_risk == 'HIGH':
            risk_score = 75
            risk_level = "HIGH"
        elif db_risk == 'MEDIUM':
            risk_score = 60
            risk_level = "MEDIUM"
        else:
            risk_score = 20
            risk_level = "NORMAL"
            
        # Adjust based on match quality
        if match_type == 'POSSIBLE_MATCH':
            # Downgrade risk slightly, flag for review
            risk_score = int(risk_score * 0.8)
            risk_level = "REVIEW"
            
        return risk_level, risk_score
