"""
Background tasks for alert evaluation and summary updates
"""
from celery import shared_task
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging
from app.core.database import SessionLocal
from app.services.alert_evaluator import AlertEvaluator
from app.models.summaries import ParticipationSummary, DriverSummary, SentimentSummary, CommentNLP
from app.models.advanced import AnonymousComment
from app.models.responses import NumericResponse, Comment
from app.models.base import Survey, Team
from sqlalchemy import func, desc

logger = logging.getLogger(__name__)

@shared_task
def evaluate_survey_alerts(survey_id: int, team_id: int, org_id: int):
    """Evaluate alerts for a specific survey and team"""
    try:
        db = SessionLocal()
        evaluator = AlertEvaluator(db)
        
        # Evaluate all alert conditions
        alerts = evaluator.evaluate_all_alerts(team_id, survey_id, org_id)
        
        logger.info(f"Evaluated {len(alerts)} alerts for survey {survey_id}, team {team_id}")
        return {
            "survey_id": survey_id,
            "team_id": team_id,
            "alerts_created": len(alerts),
            "alert_types": [alert.alert_type for alert in alerts]
        }
        
    except Exception as e:
        logger.error(f"Error evaluating alerts for survey {survey_id}: {str(e)}")
        raise
    finally:
        db.close()

@shared_task
def update_participation_summary(survey_id: int, team_id: int):
    """Update participation summary for a team and survey"""
    try:
        db = SessionLocal()
        
        # Get team size
        team = db.query(Team).filter(Team.id == team_id).first()
        team_size = team.member_count if team else 25  # Default fallback
        
        # Get response count
        response_count = db.query(NumericResponse).filter(
            NumericResponse.survey_id == survey_id,
            NumericResponse.team_id == team_id
        ).count()
        
        # Calculate participation percentage
        participation_pct = (response_count / team_size * 100) if team_size > 0 else 0
        
        # Get previous survey participation for delta calculation
        prev_survey = db.query(NumericResponse).filter(
            NumericResponse.team_id == team_id,
            NumericResponse.survey_id < survey_id
        ).order_by(desc(NumericResponse.survey_id)).first()
        
        delta_pct = None
        if prev_survey:
            prev_response_count = db.query(NumericResponse).filter(
                NumericResponse.survey_id == prev_survey.survey_id,
                NumericResponse.team_id == team_id
            ).count()
            prev_participation = (prev_response_count / team_size * 100) if team_size > 0 else 0
            delta_pct = participation_pct - prev_participation
        
        # Update or create participation summary
        summary = db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == survey_id,
            ParticipationSummary.team_id == team_id
        ).first()
        
        if summary:
            summary.respondents = response_count
            summary.team_size = team_size
            summary.participation_pct = participation_pct
            summary.delta_pct = delta_pct
            summary.last_updated = datetime.utcnow()
        else:
            summary = ParticipationSummary(
                survey_id=survey_id,
                team_id=team_id,
                respondents=response_count,
                team_size=team_size,
                participation_pct=participation_pct,
                delta_pct=delta_pct
            )
            db.add(summary)
        
        db.commit()
        logger.info(f"Updated participation summary for survey {survey_id}, team {team_id}")
        
    except Exception as e:
        logger.error(f"Error updating participation summary: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task
def update_driver_summary(survey_id: int, team_id: int):
    """Update driver summary for a team and survey"""
    try:
        db = SessionLocal()
        
        # Get all responses for this team and survey
        responses = db.query(NumericResponse).filter(
            NumericResponse.survey_id == survey_id,
            NumericResponse.team_id == team_id
        ).all()
        
        # Group by driver
        driver_data = {}
        for response in responses:
            driver_id = str(response.driver_id)
            if driver_id not in driver_data:
                driver_data[driver_id] = []
            driver_data[driver_id].append(response.score)
        
        # Calculate metrics for each driver
        for driver_name, scores in driver_data.items():
            if len(scores) == 0:
                continue
                
            avg_score = sum(scores) / len(scores)
            
            # Calculate distribution
            detractors = len([s for s in scores if s <= 6]) / len(scores) * 100
            passives = len([s for s in scores if 7 <= s <= 8]) / len(scores) * 100
            promoters = len([s for s in scores if s >= 9]) / len(scores) * 100
            
            # Calculate delta vs previous survey
            prev_survey = db.query(NumericResponse).filter(
                NumericResponse.team_id == team_id,
                NumericResponse.driver_id == driver_name,
                NumericResponse.survey_id < survey_id
            ).order_by(desc(NumericResponse.survey_id)).first()
            
            delta_vs_prev = None
            if prev_survey:
                prev_responses = db.query(NumericResponse).filter(
                    NumericResponse.team_id == team_id,
                    NumericResponse.driver_id == driver_name,
                    NumericResponse.survey_id == prev_survey.survey_id
                ).all()
                if prev_responses:
                    prev_avg = sum(r.score for r in prev_responses) / len(prev_responses)
                    delta_vs_prev = avg_score - prev_avg
            
            # Update or create driver summary
            summary = db.query(DriverSummary).filter(
                DriverSummary.survey_id == survey_id,
                DriverSummary.team_id == team_id,
                DriverSummary.driver_id == 1  # Assuming driver_id mapping
            ).first()
            
            if summary:
                summary.avg_score = avg_score
                summary.detractors_pct = detractors
                summary.passives_pct = passives
                summary.promoters_pct = promoters
                summary.delta_vs_prev = delta_vs_prev
                summary.response_count = len(scores)
                summary.last_updated = datetime.utcnow()
            else:
                summary = DriverSummary(
                    survey_id=survey_id,
                    team_id=team_id,
                    driver_id=1,  # Assuming driver_id mapping
                    avg_score=avg_score,
                    detractors_pct=detractors,
                    passives_pct=passives,
                    promoters_pct=promoters,
                    delta_vs_prev=delta_vs_prev,
                    response_count=len(scores)
                )
                db.add(summary)
        
        db.commit()
        logger.info(f"Updated driver summary for survey {survey_id}, team {team_id}")
        
    except Exception as e:
        logger.error(f"Error updating driver summary: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task
def update_sentiment_summary(survey_id: int, team_id: int):
    """Update sentiment summary for a team and survey"""
    try:
        db = SessionLocal()
        
        # Get comments for this team and survey
        comments = db.query(Comment).filter(
            Comment.survey_id == survey_id,
            Comment.team_id == team_id
        ).all()
        
        if not comments:
            return
        
        # Calculate sentiment distribution (using CommentNLP table)
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        for comment in comments:
            nlp = db.query(CommentNLP).filter(CommentNLP.comment_id == comment.id).first()
            if nlp:
                if nlp.sentiment == '+':
                    positive_count += 1
                elif nlp.sentiment == '-':
                    negative_count += 1
                else:
                    neutral_count += 1
        total_count = len(comments)
        
        pos_pct = (positive_count / total_count * 100) if total_count > 0 else 0
        neg_pct = (negative_count / total_count * 100) if total_count > 0 else 0
        neu_pct = (neutral_count / total_count * 100) if total_count > 0 else 0
        
        # Calculate delta vs previous survey
        prev_survey = db.query(Comment).filter(
            Comment.team_id == team_id,
            Comment.survey_id < survey_id
        ).order_by(desc(Comment.survey_id)).first()
        
        delta_vs_prev = None
        if prev_survey:
            prev_comments = db.query(Comment).filter(
                Comment.team_id == team_id,
                Comment.survey_id == prev_survey.survey_id
            ).all()
            if prev_comments:
                prev_neg_count = 0
                for prev_comment in prev_comments:
                    prev_nlp = db.query(CommentNLP).filter(CommentNLP.comment_id == prev_comment.id).first()
                    if prev_nlp and prev_nlp.sentiment == '-':
                        prev_neg_count += 1
                prev_neg_pct = (prev_neg_count / len(prev_comments) * 100) if prev_comments else 0
                delta_vs_prev = neg_pct - prev_neg_pct
        
        # Update or create sentiment summary
        summary = db.query(SentimentSummary).filter(
            SentimentSummary.survey_id == survey_id,
            SentimentSummary.team_id == team_id
        ).first()
        
        if summary:
            summary.pos_pct = pos_pct
            summary.neu_pct = neu_pct
            summary.neg_pct = neg_pct
            summary.delta_vs_prev = delta_vs_prev
            summary.comment_count = total_count
            summary.last_updated = datetime.utcnow()
        else:
            summary = SentimentSummary(
                survey_id=survey_id,
                team_id=team_id,
                pos_pct=pos_pct,
                neu_pct=neu_pct,
                neg_pct=neg_pct,
                delta_vs_prev=delta_vs_prev,
                comment_count=total_count
            )
            db.add(summary)
        
        db.commit()
        logger.info(f"Updated sentiment summary for survey {survey_id}, team {team_id}")
        
    except Exception as e:
        logger.error(f"Error updating sentiment summary: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task
def refresh_all_summaries():
    """Refresh all summary tables (run every 5-15 minutes)"""
    try:
        db = SessionLocal()
        
        # Get all active surveys
        active_surveys = db.query(Survey).filter(Survey.status == "active").all()
        
        for survey in active_surveys:
            # Get all teams for this survey
            teams = db.query(Team).join(NumericResponse).filter(
                NumericResponse.survey_id == survey.id
            ).distinct().all()
            
            for team in teams:
                # Update all summaries for this team and survey
                update_participation_summary.delay(survey.id, team.id)
                update_driver_summary.delay(survey.id, team.id)
                update_sentiment_summary.delay(survey.id, team.id)
        
        logger.info(f"Refreshed summaries for {len(active_surveys)} active surveys")
        
    except Exception as e:
        logger.error(f"Error refreshing summaries: {str(e)}")
        raise
    finally:
        db.close()
