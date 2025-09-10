"""
Alert Evaluator with Default Rules ON
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from datetime import datetime, timedelta
import logging

from app.models.summaries import DriverSummary, ParticipationSummary, SentimentSummary
from app.models.advanced import DashboardAlert
from app.models.settings import AlertThresholds
from app.models.base import Survey

logger = logging.getLogger(__name__)

class AlertEvaluator:
    def __init__(self, db: Session):
        self.db = db
        
        # Default thresholds (can be overridden by org settings)
        self.default_thresholds = {
            "low_score": 6.0,
            "big_drop_abs": -1.0,
            "big_drop_rel": 0.85,
            "enps_negative": 0,
            "low_participation": 60.0,
            "participation_drop": 20.0,
            "neg_sentiment_spike": 30.0,
            "recurring_count": 3
        }
    
    def get_alert_thresholds(self, org_id: str) -> Dict[str, float]:
        """Get alert thresholds for organization (with defaults)"""
        try:
            thresholds = self.db.query(AlertThresholds).filter(
                AlertThresholds.org_id == org_id
            ).first()
            
            if thresholds:
                return {
                    "low_score": thresholds.low_score or self.default_thresholds["low_score"],
                    "big_drop_abs": thresholds.big_drop_abs or self.default_thresholds["big_drop_abs"],
                    "big_drop_rel": thresholds.big_drop_rel or self.default_thresholds["big_drop_rel"],
                    "enps_negative": thresholds.enps_negative or self.default_thresholds["enps_negative"],
                    "low_participation": thresholds.low_participation or self.default_thresholds["low_participation"],
                    "participation_drop": thresholds.participation_drop or self.default_thresholds["participation_drop"],
                    "neg_sentiment_spike": thresholds.neg_sentiment_spike or self.default_thresholds["neg_sentiment_spike"],
                    "recurring_count": thresholds.recurring_count or self.default_thresholds["recurring_count"]
                }
            
            return self.default_thresholds
            
        except Exception as e:
            logger.error(f"Error getting alert thresholds: {str(e)}")
            return self.default_thresholds
    
    def evaluate_survey_alerts(self, survey_id: str, team_id: str, org_id: str) -> List[DashboardAlert]:
        """Evaluate all alert rules for a team and survey"""
        try:
            thresholds = self.get_alert_thresholds(org_id)
            alerts = []
            
            # Get current survey data
            current_drivers = self.db.query(DriverSummary).filter(
                DriverSummary.survey_id == survey_id,
                DriverSummary.team_id == team_id
            ).all()
            
            current_participation = self.db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey_id,
                ParticipationSummary.team_id == team_id
            ).first()
            
            current_sentiment = self.db.query(SentimentSummary).filter(
                SentimentSummary.survey_id == survey_id,
                SentimentSummary.team_id == team_id
            ).first()
            
            if not current_drivers or not current_participation:
                return alerts
            
            # Get previous survey for comparison
            current_survey = self.db.query(Survey).filter(Survey.id == survey_id).first()
            if not current_survey:
                return alerts
            
            prev_survey = self.db.query(Survey).filter(
                Survey.creator_id == org_id,
                Survey.created_at < current_survey.created_at,
                Survey.status.in_(["active", "closed"])
            ).order_by(desc(Survey.created_at)).first()
            
            # Evaluate driver-based alerts
            for driver in current_drivers:
                driver_alerts = self._evaluate_driver_alerts(
                    driver, team_id, survey_id, org_id, thresholds, prev_survey
                )
                alerts.extend(driver_alerts)
            
            # Evaluate participation alerts
            if current_participation:
                participation_alerts = self._evaluate_participation_alerts(
                    current_participation, team_id, survey_id, org_id, thresholds, prev_survey
                )
                alerts.extend(participation_alerts)
            
            # Evaluate sentiment alerts
            if current_sentiment:
                sentiment_alerts = self._evaluate_sentiment_alerts(
                    current_sentiment, team_id, survey_id, org_id, thresholds, prev_survey
                )
                alerts.extend(sentiment_alerts)
            
            # Evaluate recurring alerts
            recurring_alerts = self._evaluate_recurring_alerts(
                team_id, survey_id, org_id, thresholds
            )
            alerts.extend(recurring_alerts)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error evaluating survey alerts: {str(e)}")
            return []
    
    def _evaluate_driver_alerts(self, driver: DriverSummary, team_id: str, survey_id: str, 
                               org_id: str, thresholds: Dict[str, float], 
                               prev_survey: Optional[Survey]) -> List[DashboardAlert]:
        """Evaluate driver-specific alerts"""
        alerts = []
        
        # LOW_SCORE alert
        if driver.avg_score < thresholds["low_score"]:
            alert = self._create_alert(
                team_id=team_id,
                survey_id=survey_id,
                org_id=org_id,
                driver_id=str(driver.driver_id),
                alert_type="LOW_SCORE",
                severity="high",
                reason=f"Driver score {driver.avg_score:.1f} below threshold {thresholds['low_score']}",
                current_score=driver.avg_score,
                delta_prev=driver.delta_vs_prev
            )
            alerts.append(alert)
        
        # BIG_DROP_ABS alert
        if driver.delta_vs_prev and driver.delta_vs_prev <= thresholds["big_drop_abs"]:
            alert = self._create_alert(
                team_id=team_id,
                survey_id=survey_id,
                org_id=org_id,
                driver_id=str(driver.driver_id),
                alert_type="BIG_DROP_ABS",
                severity="medium",
                reason=f"Driver score dropped by {abs(driver.delta_vs_prev):.1f} points",
                current_score=driver.avg_score,
                delta_prev=driver.delta_vs_prev
            )
            alerts.append(alert)
        
        # BIG_DROP_REL alert
        if prev_survey and driver.delta_vs_prev:
            prev_driver = self.db.query(DriverSummary).filter(
                DriverSummary.survey_id == prev_survey.id,
                DriverSummary.team_id == team_id,
                DriverSummary.driver_id == driver.driver_id
            ).first()
            
            if prev_driver and driver.avg_score <= prev_driver.avg_score * thresholds["big_drop_rel"]:
                alert = self._create_alert(
                    team_id=team_id,
                    survey_id=survey_id,
                    org_id=org_id,
                    driver_id=str(driver.driver_id),
                    alert_type="BIG_DROP_REL",
                    severity="medium",
                    reason=f"Driver score dropped to {driver.avg_score:.1f} ({(driver.avg_score/prev_driver.avg_score)*100:.0f}% of previous)",
                    current_score=driver.avg_score,
                    delta_prev=driver.delta_vs_prev
                )
                alerts.append(alert)
        
        # ENPS_NEG alert
        enps = driver.promoters_pct - driver.detractors_pct
        if enps < thresholds["enps_negative"]:
            alert = self._create_alert(
                team_id=team_id,
                survey_id=survey_id,
                org_id=org_id,
                driver_id=str(driver.driver_id),
                alert_type="ENPS_NEG",
                severity="high",
                reason=f"eNPS score {enps:.1f} is negative (promoters: {driver.promoters_pct:.1f}%, detractors: {driver.detractors_pct:.1f}%)",
                current_score=enps,
                delta_prev=driver.delta_vs_prev
            )
            alerts.append(alert)
        
        return alerts
    
    def _evaluate_participation_alerts(self, participation: ParticipationSummary, team_id: str, 
                                      survey_id: str, org_id: str, thresholds: Dict[str, float],
                                      prev_survey: Optional[Survey]) -> List[DashboardAlert]:
        """Evaluate participation-based alerts"""
        alerts = []
        
        # LOW_PARTICIPATION alert
        if participation.participation_pct < thresholds["low_participation"]:
            alert = self._create_alert(
                team_id=team_id,
                survey_id=survey_id,
                org_id=org_id,
                driver_id=None,
                alert_type="LOW_PARTICIPATION",
                severity="medium",
                reason=f"Participation rate {participation.participation_pct:.1f}% below threshold {thresholds['low_participation']}%",
                current_score=participation.participation_pct,
                delta_prev=participation.delta_pct
            )
            alerts.append(alert)
        
        # PARTICIPATION_DROP alert
        if participation.delta_pct and participation.delta_pct <= -thresholds["participation_drop"]:
            alert = self._create_alert(
                team_id=team_id,
                survey_id=survey_id,
                org_id=org_id,
                driver_id=None,
                alert_type="PARTICIPATION_DROP",
                severity="medium",
                reason=f"Participation dropped by {abs(participation.delta_pct):.1f}%",
                current_score=participation.participation_pct,
                delta_prev=participation.delta_pct
            )
            alerts.append(alert)
        
        return alerts
    
    def _evaluate_sentiment_alerts(self, sentiment: SentimentSummary, team_id: str, 
                                  survey_id: str, org_id: str, thresholds: Dict[str, float],
                                  prev_survey: Optional[Survey]) -> List[DashboardAlert]:
        """Evaluate sentiment-based alerts"""
        alerts = []
        
        # NEG_SENT_SPIKE alert
        if sentiment.neg_pct > thresholds["neg_sentiment_spike"]:
            alert = self._create_alert(
                team_id=team_id,
                survey_id=survey_id,
                org_id=org_id,
                driver_id=None,
                alert_type="NEG_SENT_SPIKE",
                severity="high",
                reason=f"Negative sentiment {sentiment.neg_pct:.1f}% above threshold {thresholds['neg_sentiment_spike']}%",
                current_score=sentiment.neg_pct,
                delta_prev=sentiment.delta_vs_prev
            )
            alerts.append(alert)
        
        return alerts
    
    def _evaluate_recurring_alerts(self, team_id: str, survey_id: str, org_id: str, 
                                  thresholds: Dict[str, float]) -> List[DashboardAlert]:
        """Evaluate recurring alerts (same issue for 3+ consecutive surveys)"""
        alerts = []
        
        # Get recent surveys for this team
        current_survey = self.db.query(Survey).filter(Survey.id == survey_id).first()
        if not current_survey:
            return alerts
        
        recent_surveys = self.db.query(Survey).filter(
            Survey.creator_id == org_id,
            Survey.created_at <= current_survey.created_at,
            Survey.status.in_(["active", "closed"])
        ).order_by(desc(Survey.created_at)).limit(thresholds["recurring_count"]).all()
        
        if len(recent_surveys) < thresholds["recurring_count"]:
            return alerts
        
        # Check for recurring issues
        recurring_issues = self._check_recurring_issues(team_id, recent_surveys, thresholds)
        
        for issue in recurring_issues:
            alert = self._create_alert(
                team_id=team_id,
                survey_id=survey_id,
                org_id=org_id,
                driver_id=issue.get("driver_id"),
                alert_type="RECURRING",
                severity="high",
                reason=f"Recurring issue: {issue['description']} for {len(recent_surveys)} consecutive surveys",
                current_score=issue.get("current_score"),
                delta_prev=issue.get("delta_prev")
            )
            alerts.append(alert)
        
        return alerts
    
    def _check_recurring_issues(self, team_id: str, surveys: List[Survey], 
                               thresholds: Dict[str, float]) -> List[Dict[str, Any]]:
        """Check for recurring issues across surveys"""
        issues = []
        
        # Check for recurring low scores
        low_score_count = 0
        for survey in surveys:
            drivers = self.db.query(DriverSummary).filter(
                DriverSummary.survey_id == survey.id,
                DriverSummary.team_id == team_id
            ).all()
            
            for driver in drivers:
                if driver.avg_score < thresholds["low_score"]:
                    low_score_count += 1
                    break
        
        if low_score_count >= len(surveys):
            issues.append({
                "description": "Low driver scores",
                "current_score": None,
                "delta_prev": None
            })
        
        # Check for recurring low participation
        low_participation_count = 0
        for survey in surveys:
            participation = self.db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey.id,
                ParticipationSummary.team_id == team_id
            ).first()
            
            if participation and participation.participation_pct < thresholds["low_participation"]:
                low_participation_count += 1
        
        if low_participation_count >= len(surveys):
            issues.append({
                "description": "Low participation rates",
                "current_score": None,
                "delta_prev": None
            })
        
        return issues
    
    def _create_alert(self, team_id: str, survey_id: str, org_id: str, driver_id: Optional[str],
                     alert_type: str, severity: str, reason: str, current_score: Optional[float],
                     delta_prev: Optional[float]) -> DashboardAlert:
        """Create a new alert"""
        # Check if alert already exists
        existing_alert = self.db.query(DashboardAlert).filter(
            DashboardAlert.team_id == team_id,
            DashboardAlert.survey_id == survey_id,
            DashboardAlert.alert_type == alert_type,
            DashboardAlert.status.in_(["open", "acknowledged"])
        ).first()
        
        if existing_alert:
            # Update existing alert if conditions worsened
            if severity == "high" and existing_alert.severity != "high":
                existing_alert.severity = "high"
                existing_alert.reason = reason
                existing_alert.current_score = current_score
                existing_alert.delta_prev = delta_prev
                existing_alert.updated_at = datetime.utcnow()
            
            return existing_alert
        
        # Create new alert
        alert = DashboardAlert(
            team_id=team_id,
            survey_id=survey_id,
            org_id=org_id,
            driver_id=driver_id,
            alert_type=alert_type,
            severity=severity,
            reason=reason,
            current_score=current_score,
            delta_prev=delta_prev,
            status="open",
            created_at=datetime.utcnow()
        )
        
        self.db.add(alert)
        self.db.commit()
        
        return alert
    
    def acknowledge_alert(self, alert_id: str, user_id: str) -> bool:
        """Acknowledge an alert"""
        try:
            alert = self.db.query(DashboardAlert).filter(DashboardAlert.id == alert_id).first()
            if not alert:
                return False
            
            alert.status = "acknowledged"
            alert.acknowledged_by = user_id
            alert.acknowledged_at = datetime.utcnow()
            alert.updated_at = datetime.utcnow()
            
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error acknowledging alert: {str(e)}")
            self.db.rollback()
            return False
    
    def resolve_alert(self, alert_id: str, user_id: str, resolution_notes: str = None) -> bool:
        """Resolve an alert"""
        try:
            alert = self.db.query(DashboardAlert).filter(DashboardAlert.id == alert_id).first()
            if not alert:
                return False
            
            alert.status = "resolved"
            alert.resolved_by = user_id
            alert.resolved_at = datetime.utcnow()
            alert.resolution_notes = resolution_notes
            alert.updated_at = datetime.utcnow()
            
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error resolving alert: {str(e)}")
            self.db.rollback()
            return False
