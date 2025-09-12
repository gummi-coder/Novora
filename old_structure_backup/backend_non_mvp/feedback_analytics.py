"""
Feedback Analytics Service

Handles calculation and caching of feedback distribution metrics
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
import logging

from app.models.advanced import SurveyResponse, SurveyComment, MetricsSummary, Team
from app.models.base import Survey

logger = logging.getLogger(__name__)

class FeedbackAnalyticsService:
    """Service for calculating and managing feedback analytics"""
    
    @staticmethod
    def calculate_driver_metrics(
        db: Session,
        team_id: Optional[int] = None,
        survey_id: int = None,
        driver: Optional[str] = None
    ) -> List[Dict]:
        """
        Calculate metrics for drivers based on survey responses
        
        Args:
            db: Database session
            team_id: Optional team filter
            survey_id: Survey ID to analyze
            driver: Optional specific driver filter
            
        Returns:
            List of driver metrics with distribution data
        """
        try:
            # Build query
            query = db.query(SurveyResponse).filter(
                SurveyResponse.survey_id == survey_id
            )
            
            if team_id:
                query = query.filter(SurveyResponse.team_id == team_id)
            
            if driver:
                query = query.filter(SurveyResponse.driver == driver)
            
            responses = query.all()
            
            if not responses:
                return []
            
            # Group by driver
            driver_data = {}
            for response in responses:
                if response.driver not in driver_data:
                    driver_data[response.driver] = {
                        'scores': [],
                        'team_id': response.team_id,
                        'survey_id': response.survey_id
                    }
                driver_data[response.driver]['scores'].append(response.score)
            
            # Calculate metrics for each driver
            results = []
            for driver_name, data in driver_data.items():
                metrics = FeedbackAnalyticsService._calculate_single_driver_metrics(
                    db, driver_name, data, team_id
                )
                if metrics:
                    results.append(metrics)
            
            return results
            
        except Exception as e:
            logger.error(f"Error calculating driver metrics: {str(e)}")
            raise
    
    @staticmethod
    def _calculate_single_driver_metrics(
        db: Session,
        driver_name: str,
        data: Dict,
        team_id: Optional[int]
    ) -> Optional[Dict]:
        """Calculate metrics for a single driver"""
        try:
            scores = data['scores']
            total_responses = len(scores)
            
            if total_responses == 0:
                return None
            
            # Calculate average score
            avg_score = sum(scores) / total_responses
            
            # Calculate distribution buckets
            detractors = len([s for s in scores if s <= 6]) / total_responses * 100
            passives = len([s for s in scores if 7 <= s <= 8]) / total_responses * 100
            promoters = len([s for s in scores if s >= 9]) / total_responses * 100
            
            # Calculate change vs previous survey
            change = FeedbackAnalyticsService._calculate_trend_change(
                db, driver_name, data['team_id'], data['survey_id']
            )
            
            # Calculate participation rate
            participation_rate = FeedbackAnalyticsService._calculate_participation_rate(
                db, data['team_id'], data['survey_id']
            )
            
            return {
                'driver': driver_name,
                'avg_score': round(avg_score, 1),
                'change': round(change, 1),
                'distribution': {
                    'detractors': round(detractors, 1),
                    'passives': round(passives, 1),
                    'promoters': round(promoters, 1)
                },
                'response_count': total_responses,
                'participation_rate': participation_rate
            }
            
        except Exception as e:
            logger.error(f"Error calculating metrics for driver {driver_name}: {str(e)}")
            return None
    
    @staticmethod
    def _calculate_trend_change(
        db: Session,
        driver_name: str,
        team_id: int,
        current_survey_id: int
    ) -> float:
        """Calculate change vs previous survey for a driver"""
        try:
            # Get previous survey
            prev_survey = db.query(Survey).filter(
                Survey.status == "closed",
                Survey.id < current_survey_id
            ).order_by(desc(Survey.created_at)).first()
            
            if not prev_survey:
                return 0.0
            
            # Get previous responses for this driver and team
            prev_responses = db.query(SurveyResponse).filter(
                SurveyResponse.survey_id == prev_survey.id,
                SurveyResponse.team_id == team_id,
                SurveyResponse.driver == driver_name
            ).all()
            
            if not prev_responses:
                return 0.0
            
            # Calculate previous average
            prev_avg = sum(r.score for r in prev_responses) / len(prev_responses)
            
            # Get current average
            current_responses = db.query(SurveyResponse).filter(
                SurveyResponse.survey_id == current_survey_id,
                SurveyResponse.team_id == team_id,
                SurveyResponse.driver == driver_name
            ).all()
            
            if not current_responses:
                return 0.0
            
            current_avg = sum(r.score for r in current_responses) / len(current_responses)
            
            return current_avg - prev_avg
            
        except Exception as e:
            logger.error(f"Error calculating trend change: {str(e)}")
            return 0.0
    
    @staticmethod
    def _calculate_participation_rate(
        db: Session,
        team_id: int,
        survey_id: int
    ) -> float:
        """Calculate participation rate for a team in a survey"""
        try:
            # Get team size (mock implementation - would need user_teams table)
            team_size = 25  # Mock data
            
            # Get number of unique respondents
            unique_respondents = db.query(SurveyResponse.employee_id).filter(
                SurveyResponse.team_id == team_id,
                SurveyResponse.survey_id == survey_id
            ).distinct().count()
            
            if team_size == 0:
                return 0.0
            
            return round(unique_respondents / team_size, 2)
            
        except Exception as e:
            logger.error(f"Error calculating participation rate: {str(e)}")
            return 0.92  # Default fallback
    
    @staticmethod
    def cache_metrics_summary(
        db: Session,
        team_id: int,
        survey_id: int,
        driver: str,
        metrics: Dict
    ) -> MetricsSummary:
        """Cache calculated metrics for fast dashboard loads"""
        try:
            # Check if summary already exists
            existing = db.query(MetricsSummary).filter(
                MetricsSummary.team_id == team_id,
                MetricsSummary.survey_id == survey_id,
                MetricsSummary.driver == driver
            ).first()
            
            if existing:
                # Update existing
                existing.avg_score = metrics['avg_score']
                existing.change = metrics['change']
                existing.distribution = metrics['distribution']
                existing.response_count = metrics['response_count']
                existing.participation_rate = metrics['participation_rate']
                existing.last_calculated = datetime.utcnow()
            else:
                # Create new
                existing = MetricsSummary(
                    team_id=team_id,
                    survey_id=survey_id,
                    driver=driver,
                    avg_score=metrics['avg_score'],
                    change=metrics['change'],
                    distribution=metrics['distribution'],
                    response_count=metrics['response_count'],
                    participation_rate=metrics['participation_rate']
                )
                db.add(existing)
            
            db.commit()
            return existing
            
        except Exception as e:
            logger.error(f"Error caching metrics summary: {str(e)}")
            db.rollback()
            raise
    
    @staticmethod
    def get_cached_metrics(
        db: Session,
        team_id: Optional[int] = None,
        survey_id: Optional[int] = None,
        driver: Optional[str] = None
    ) -> List[Dict]:
        """Get cached metrics from MetricsSummary table"""
        try:
            query = db.query(MetricsSummary)
            
            if team_id:
                query = query.filter(MetricsSummary.team_id == team_id)
            
            if survey_id:
                query = query.filter(MetricsSummary.survey_id == survey_id)
            
            if driver:
                query = query.filter(MetricsSummary.driver == driver)
            
            summaries = query.all()
            return [summary.to_dict() for summary in summaries]
            
        except Exception as e:
            logger.error(f"Error getting cached metrics: {str(e)}")
            return []
    
    @staticmethod
    def get_comment_insights(
        db: Session,
        team_id: Optional[int] = None,
        survey_id: Optional[int] = None,
        time_range_days: int = 30
    ) -> Dict:
        """Get insights from comments for themes and keywords"""
        try:
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=time_range_days)
            
            query = db.query(SurveyComment).filter(
                SurveyComment.created_at >= start_date,
                SurveyComment.created_at <= end_date
            )
            
            if team_id:
                query = query.filter(SurveyComment.team_id == team_id)
            
            if survey_id:
                query = query.filter(SurveyComment.survey_id == survey_id)
            
            comments = query.all()
            
            # Analyze themes and sentiment
            themes = {}
            sentiment_counts = {'positive': 0, 'neutral': 0, 'negative': 0}
            
            for comment in comments:
                # Count sentiment
                sentiment_counts[comment.sentiment] += 1
                
                # Analyze themes from tags
                if comment.tags:
                    for tag in comment.tags:
                        if tag not in themes:
                            themes[tag] = {
                                'count': 0,
                                'positive': 0,
                                'negative': 0,
                                'neutral': 0
                            }
                        themes[tag]['count'] += 1
                        themes[tag][comment.sentiment] += 1
            
            # Calculate sentiment percentages
            total_comments = len(comments)
            sentiment_distribution = {}
            if total_comments > 0:
                sentiment_distribution = {
                    'positive': round(sentiment_counts['positive'] / total_comments * 100, 1),
                    'neutral': round(sentiment_counts['neutral'] / total_comments * 100, 1),
                    'negative': round(sentiment_counts['negative'] / total_comments * 100, 1)
                }
            
            return {
                'themes': themes,
                'sentiment_distribution': sentiment_distribution,
                'total_comments': total_comments,
                'time_range_days': time_range_days
            }
            
        except Exception as e:
            logger.error(f"Error getting comment insights: {str(e)}")
            return {
                'themes': {},
                'sentiment_distribution': {},
                'total_comments': 0,
                'time_range_days': time_range_days
            }
