"""
Aggregator tasks for 5-15 minute processing jobs
"""
from celery import shared_task
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta, date
import logging
from decimal import Decimal

from app.core.database import SessionLocal
from app.models.responses import NumericResponse, Comment
from app.models.summaries import (
    ParticipationSummary, DriverSummary, SentimentSummary, 
    OrgDriverTrends, ReportsCache, CommentNLP
)
from app.models.base import Survey, Team
from app.core.privacy import enforce_min_n, safe_percentage
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)

@shared_task
def job_a_running_counters():
    """Job A: Recompute participation_summary from numeric_responses counts"""
    try:
        db = SessionLocal()
        
        # Get all active surveys
        active_surveys = db.query(Survey).filter(Survey.status == "active").all()
        
        for survey in active_surveys:
            # Get all teams that have responses for this survey
            teams_with_responses = db.query(NumericResponse.team_id).filter(
                NumericResponse.survey_id == survey.id
            ).distinct().all()
            
            for (team_id,) in teams_with_responses:
                # Count responses for this team and survey
                response_count = db.query(NumericResponse).filter(
                    NumericResponse.survey_id == survey.id,
                    NumericResponse.team_id == team_id
                ).count()
                
                # Get team size
                team = db.query(Team).filter(Team.id == team_id).first()
                team_size = team.size if team else 0
                
                # Calculate participation percentage
                participation_pct = (response_count / team_size * 100) if team_size > 0 else 0
                
                # Get previous survey for delta calculation
                prev_survey = db.query(Survey).filter(
                    Survey.creator_id == survey.creator_id,
                    Survey.created_at < survey.created_at,
                    Survey.status.in_(["active", "closed"])
                ).order_by(desc(Survey.created_at)).first()
                
                delta_pct = None
                if prev_survey:
                    prev_response_count = db.query(NumericResponse).filter(
                        NumericResponse.survey_id == prev_survey.id,
                        NumericResponse.team_id == team_id
                    ).count()
                    
                    prev_participation = (prev_response_count / team_size * 100) if team_size > 0 else 0
                    delta_pct = participation_pct - prev_participation
                
                # Upsert participation summary
                summary = db.query(ParticipationSummary).filter(
                    ParticipationSummary.survey_id == survey.id,
                    ParticipationSummary.team_id == team_id
                ).first()
                
                if summary:
                    summary.respondents = response_count
                    summary.team_size = team_size
                    summary.participation_pct = participation_pct
                    summary.delta_pct = delta_pct
                else:
                    summary = ParticipationSummary(
                        survey_id=survey.id,
                        team_id=team_id,
                        org_id=survey.creator_id,
                        respondents=response_count,
                        team_size=team_size,
                        participation_pct=participation_pct,
                        delta_pct=delta_pct
                    )
                    db.add(summary)
        
        db.commit()
        
        # Invalidate cache for affected surveys
        for survey in active_surveys:
            cache_service.invalidate_survey_cache(str(survey.creator_id), str(survey.id))
        
        logger.info(f"Updated running counters for {len(active_surveys)} active surveys")
        
    except Exception as e:
        logger.error(f"Error updating running counters: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task
def job_b_driver_summary():
    """Job B: Compute driver summary for each (survey, team, driver)"""
    try:
        db = SessionLocal()
        
        # Get all active surveys
        active_surveys = db.query(Survey).filter(Survey.status == "active").all()
        
        for survey in active_surveys:
            # Get all (team, driver) combinations with responses
            team_driver_combinations = db.query(
                NumericResponse.team_id,
                NumericResponse.driver_id
            ).filter(
                NumericResponse.survey_id == survey.id
            ).distinct().all()
            
            for team_id, driver_id in team_driver_combinations:
                # Get all responses for this combination
                responses = db.query(NumericResponse.score).filter(
                    NumericResponse.survey_id == survey.id,
                    NumericResponse.team_id == team_id,
                    NumericResponse.driver_id == driver_id
                ).all()
                
                scores = [r.score for r in responses]
                
                if not scores:
                    continue
                
                # Calculate average score
                avg_score = sum(scores) / len(scores)
                
                # Calculate NPS buckets
                detractors = len([s for s in scores if s <= 6])
                passives = len([s for s in scores if 7 <= s <= 8])
                promoters = len([s for s in scores if s >= 9])
                
                total = len(scores)
                detractors_pct = (detractors / total * 100) if total > 0 else 0
                passives_pct = (passives / total * 100) if total > 0 else 0
                promoters_pct = (promoters / total * 100) if total > 0 else 0
                
                # Get previous survey for delta calculation
                prev_survey = db.query(Survey).filter(
                    Survey.creator_id == survey.creator_id,
                    Survey.created_at < survey.created_at,
                    Survey.status.in_(["active", "closed"])
                ).order_by(desc(Survey.created_at)).first()
                
                delta_vs_prev = None
                if prev_survey:
                    prev_responses = db.query(NumericResponse.score).filter(
                        NumericResponse.survey_id == prev_survey.id,
                        NumericResponse.team_id == team_id,
                        NumericResponse.driver_id == driver_id
                    ).all()
                    
                    if prev_responses:
                        prev_avg = sum(r.score for r in prev_responses) / len(prev_responses)
                        delta_vs_prev = avg_score - prev_avg
                
                # Upsert driver summary
                summary = db.query(DriverSummary).filter(
                    DriverSummary.survey_id == survey.id,
                    DriverSummary.team_id == team_id,
                    DriverSummary.driver_id == driver_id
                ).first()
                
                if summary:
                    summary.avg_score = avg_score
                    summary.detractors_pct = detractors_pct
                    summary.passives_pct = passives_pct
                    summary.promoters_pct = promoters_pct
                    summary.delta_vs_prev = delta_vs_prev
                else:
                    summary = DriverSummary(
                        survey_id=survey.id,
                        team_id=team_id,
                        driver_id=driver_id,
                        org_id=survey.creator_id,
                        avg_score=avg_score,
                        detractors_pct=detractors_pct,
                        passives_pct=passives_pct,
                        promoters_pct=promoters_pct,
                        delta_vs_prev=delta_vs_prev
                    )
                    db.add(summary)
        
        db.commit()
        logger.info(f"Updated driver summaries for {len(active_surveys)} active surveys")
        
    except Exception as e:
        logger.error(f"Error updating driver summaries: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task
def job_c_sentiment_summary():
    """Job C: Aggregate sentiment summary from comments and NLP"""
    try:
        db = SessionLocal()
        
        # Get all active surveys
        active_surveys = db.query(Survey).filter(Survey.status == "active").all()
        
        for survey in active_surveys:
            # Get all teams with comments for this survey
            teams_with_comments = db.query(Comment.team_id).filter(
                Comment.survey_id == survey.id
            ).distinct().all()
            
            for (team_id,) in teams_with_comments:
                # Get all comments with NLP analysis
                comments_with_nlp = db.query(Comment, CommentNLP).join(CommentNLP).filter(
                    Comment.survey_id == survey.id,
                    Comment.team_id == team_id
                ).all()
                
                if not comments_with_nlp:
                    continue
                
                # Count sentiments
                positive_count = len([c for c, nlp in comments_with_nlp if nlp.sentiment == '+'])
                negative_count = len([c for c, nlp in comments_with_nlp if nlp.sentiment == '-'])
                neutral_count = len([c for c, nlp in comments_with_nlp if nlp.sentiment == '0'])
                
                total_count = len(comments_with_nlp)
                
                # Calculate percentages
                pos_pct = (positive_count / total_count * 100) if total_count > 0 else 0
                neg_pct = (negative_count / total_count * 100) if total_count > 0 else 0
                neu_pct = (neutral_count / total_count * 100) if total_count > 0 else 0
                
                # Get previous survey for delta calculation
                prev_survey = db.query(Survey).filter(
                    Survey.creator_id == survey.creator_id,
                    Survey.created_at < survey.created_at,
                    Survey.status.in_(["active", "closed"])
                ).order_by(desc(Survey.created_at)).first()
                
                delta_vs_prev = None
                if prev_survey:
                    prev_comments_with_nlp = db.query(Comment, CommentNLP).join(CommentNLP).filter(
                        Comment.survey_id == prev_survey.id,
                        Comment.team_id == team_id
                    ).all()
                    
                    if prev_comments_with_nlp:
                        prev_neg_count = len([c for c, nlp in prev_comments_with_nlp if nlp.sentiment == '-'])
                        prev_neg_pct = (prev_neg_count / len(prev_comments_with_nlp) * 100) if prev_comments_with_nlp else 0
                        delta_vs_prev = neg_pct - prev_neg_pct
                
                # Upsert sentiment summary
                summary = db.query(SentimentSummary).filter(
                    SentimentSummary.survey_id == survey.id,
                    SentimentSummary.team_id == team_id
                ).first()
                
                if summary:
                    summary.pos_pct = pos_pct
                    summary.neg_pct = neg_pct
                    summary.neu_pct = neu_pct
                    summary.delta_vs_prev = delta_vs_prev
                else:
                    summary = SentimentSummary(
                        survey_id=survey.id,
                        team_id=team_id,
                        org_id=survey.creator_id,
                        pos_pct=pos_pct,
                        neg_pct=neg_pct,
                        neu_pct=neu_pct,
                        delta_vs_prev=delta_vs_prev
                    )
                    db.add(summary)
        
        db.commit()
        logger.info(f"Updated sentiment summaries for {len(active_surveys)} active surveys")
        
    except Exception as e:
        logger.error(f"Error updating sentiment summaries: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task
def job_d_trends():
    """Job D: Roll driver_summary into org_driver_trends by month"""
    try:
        db = SessionLocal()
        
        # Get all driver summaries from the last 12 months
        cutoff_date = datetime.utcnow() - timedelta(days=365)
        
        summaries = db.query(DriverSummary).join(Survey).filter(
            Survey.created_at >= cutoff_date
        ).all()
        
        for summary in summaries:
            # Get survey month (first day of month)
            survey_month = summary.survey.created_at.replace(day=1).date()
            
            # Check if trend already exists
            existing_trend = db.query(OrgDriverTrends).filter(
                OrgDriverTrends.team_id == summary.team_id,
                OrgDriverTrends.driver_id == summary.driver_id,
                OrgDriverTrends.period_month == survey_month
            ).first()
            
            if not existing_trend:
                # Create new trend entry
                trend = OrgDriverTrends(
                    team_id=summary.team_id,
                    driver_id=summary.driver_id,
                    period_month=survey_month,
                    org_id=summary.org_id,
                    avg_score=summary.avg_score
                )
                db.add(trend)
        
        db.commit()
        logger.info(f"Updated trends for {len(summaries)} driver summaries")
        
    except Exception as e:
        logger.error(f"Error updating trends: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task
def job_e_alerts():
    """Job E: Evaluate thresholds vs latest summaries and generate alerts"""
    try:
        db = SessionLocal()
        
        from app.services.alert_evaluator import AlertEvaluator
        evaluator = AlertEvaluator(db)
        
        # Get all active surveys
        active_surveys = db.query(Survey).filter(Survey.status == "active").all()
        
        for survey in active_surveys:
            # Get all teams for this survey
            teams = db.query(Team).join(NumericResponse).filter(
                NumericResponse.survey_id == survey.id
            ).distinct().all()
            
            for team in teams:
                # Evaluate alerts for this team and survey
                evaluator.evaluate_survey_alerts(survey.id, team.id, survey.creator_id)
        
        logger.info(f"Evaluated alerts for {len(active_surveys)} active surveys")
        
    except Exception as e:
        logger.error(f"Error evaluating alerts: {str(e)}")
        raise
    finally:
        db.close()

@shared_task
def job_f_reports_cache():
    """Job F: Build digest payload for org/team into reports_cache"""
    try:
        db = SessionLocal()
        
        # Get all organizations with active surveys
        orgs_with_surveys = db.query(Survey.creator_id).filter(
            Survey.status.in_(["active", "closed"])
        ).distinct().all()
        
        for (org_id,) in orgs_with_surveys:
            # Build org-wide digest
            org_digest = build_org_digest(org_id, db)
            
            # Cache org digest
            cache_org_report(org_id, org_digest, db)
            
            # Get all teams for this org
            teams = db.query(Team).filter(Team.org_id == org_id).all()
            
            for team in teams:
                # Build team digest
                team_digest = build_team_digest(team.id, db)
                
                # Cache team digest
                cache_team_report(org_id, team.id, team_digest, db)
        
        logger.info(f"Built reports cache for {len(orgs_with_surveys)} organizations")
        
    except Exception as e:
        logger.error(f"Error building reports cache: {str(e)}")
        raise
    finally:
        db.close()

def build_org_digest(org_id: str, db: Session) -> dict:
    """Build organization-wide digest data"""
    # Get latest survey
    latest_survey = db.query(Survey).filter(
        Survey.creator_id == org_id,
        Survey.status.in_(["active", "closed"])
    ).order_by(desc(Survey.created_at)).first()
    
    if not latest_survey:
        return {"error": "No surveys found"}
    
    # Get participation summary
    participation = db.query(ParticipationSummary).filter(
        ParticipationSummary.survey_id == latest_survey.id,
        ParticipationSummary.org_id == org_id
    ).all()
    
    # Get driver summary
    drivers = db.query(DriverSummary).filter(
        DriverSummary.survey_id == latest_survey.id,
        DriverSummary.org_id == org_id
    ).all()
    
    # Get sentiment summary
    sentiment = db.query(SentimentSummary).filter(
        SentimentSummary.survey_id == latest_survey.id,
        SentimentSummary.org_id == org_id
    ).all()
    
    return {
        "survey_id": str(latest_survey.id),
        "survey_title": latest_survey.title,
        "created_at": latest_survey.created_at.isoformat(),
        "participation": [p.to_dict() for p in participation],
        "drivers": [d.to_dict() for d in drivers],
        "sentiment": [s.to_dict() for s in sentiment]
    }

def build_team_digest(team_id: str, db: Session) -> dict:
    """Build team-specific digest data"""
    # Get latest survey for this team
    latest_survey = db.query(Survey).join(NumericResponse).filter(
        NumericResponse.team_id == team_id
    ).order_by(desc(Survey.created_at)).first()
    
    if not latest_survey:
        return {"error": "No surveys found for team"}
    
    # Get participation summary
    participation = db.query(ParticipationSummary).filter(
        ParticipationSummary.survey_id == latest_survey.id,
        ParticipationSummary.team_id == team_id
    ).first()
    
    # Get driver summary
    drivers = db.query(DriverSummary).filter(
        DriverSummary.survey_id == latest_survey.id,
        DriverSummary.team_id == team_id
    ).all()
    
    # Get sentiment summary
    sentiment = db.query(SentimentSummary).filter(
        SentimentSummary.survey_id == latest_survey.id,
        SentimentSummary.team_id == team_id
    ).first()
    
    return {
        "survey_id": str(latest_survey.id),
        "survey_title": latest_survey.title,
        "created_at": latest_survey.created_at.isoformat(),
        "participation": participation.to_dict() if participation else None,
        "drivers": [d.to_dict() for d in drivers],
        "sentiment": sentiment.to_dict() if sentiment else None
    }

def cache_org_report(org_id: str, digest: dict, db: Session):
    """Cache organization report"""
    # Use current month as period
    period_start = date.today().replace(day=1)
    period_end = (period_start.replace(month=period_start.month + 1) - timedelta(days=1)) if period_start.month < 12 else period_start.replace(year=period_start.year + 1, month=1) - timedelta(days=1)
    
    cache_entry = ReportsCache(
        org_id=org_id,
        scope="org",
        period_start=period_start,
        period_end=period_end,
        payload_json=digest
    )
    
    db.add(cache_entry)
    db.commit()

def cache_team_report(org_id: str, team_id: str, digest: dict, db: Session):
    """Cache team report"""
    # Use current month as period
    period_start = date.today().replace(day=1)
    period_end = (period_start.replace(month=period_start.month + 1) - timedelta(days=1)) if period_start.month < 12 else period_start.replace(year=period_start.year + 1, month=1) - timedelta(days=1)
    
    cache_entry = ReportsCache(
        org_id=org_id,
        scope=f"team:{team_id}",
        period_start=period_start,
        period_end=period_end,
        payload_json=digest
    )
    
    db.add(cache_entry)
    db.commit()

@shared_task
def run_all_aggregator_jobs():
    """Run all aggregator jobs in sequence"""
    try:
        logger.info("Starting all aggregator jobs")
        
        # Run jobs in order
        job_a_running_counters.delay()
        job_b_driver_summary.delay()
        job_c_sentiment_summary.delay()
        job_d_trends.delay()
        job_e_alerts.delay()
        
        logger.info("All aggregator jobs queued successfully")
        
    except Exception as e:
        logger.error(f"Error running aggregator jobs: {str(e)}")
        raise
