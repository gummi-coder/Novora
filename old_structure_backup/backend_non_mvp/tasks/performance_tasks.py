"""
Performance Optimization Tasks for Near Real-time Processing
"""
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta
from celery import shared_task

from app.core.database import SessionLocal
from app.models.base import Survey, Team
from app.models.responses import NumericResponse, Comment
from app.models.summaries import (
    ParticipationSummary, DriverSummary, SentimentSummary,
    OrgDriverTrends, ReportsCache
)
from app.models.advanced import DashboardAlert
from app.services.cache_service import cache_service
from app.services.alert_evaluator import AlertEvaluator
from app.services.summary_service import SummaryService

logger = logging.getLogger(__name__)

@shared_task(bind=True, name="performance.refresh_kpis_cache")
def refresh_kpis_cache(self, org_id: str, survey_id: str, team_id: str = None):
    """Refresh KPIs cache for org/team"""
    try:
        db = SessionLocal()
        summary_service = SummaryService(db)
        
        # Get KPIs data
        if team_id:
            # Team-specific KPIs
            kpis_data = summary_service.get_team_summaries(team_id, survey_id)
        else:
            # Org-wide KPIs
            kpis_data = summary_service.get_org_summaries(org_id, survey_id)
        
        # Cache the data
        cache_service.set_kpis_cache(
            org_id=org_id,
            team_id=team_id,
            survey_id=survey_id,
            kpis_data=kpis_data,
            ttl_minutes=10
        )
        
        logger.info(f"Refreshed KPIs cache for org:{org_id}, team:{team_id}, survey:{survey_id}")
        
    except Exception as e:
        logger.error(f"Error refreshing KPIs cache: {str(e)}")
        raise
    finally:
        db.close()

@shared_task(bind=True, name="performance.refresh_heatmap_cache")
def refresh_heatmap_cache(self, org_id: str, survey_id: str):
    """Refresh heatmap cache for org"""
    try:
        db = SessionLocal()
        
        # Get all teams for org
        teams = db.query(Team).filter(Team.org_id == org_id).all()
        
        # Get driver data for each team
        heatmap_data = []
        for team in teams:
            team_id = str(team.id)
            
            # Get driver summaries for this team
            drivers = db.query(DriverSummary).filter(
                DriverSummary.survey_id == survey_id,
                DriverSummary.team_id == team_id
            ).all()
            
            driver_scores = {}
            for driver in drivers:
                driver_scores[str(driver.driver_id)] = {
                    "avg_score": round(driver.avg_score, 1),
                    "delta_vs_prev": round(driver.delta_vs_prev, 1) if driver.delta_vs_prev else 0
                }
            
            heatmap_data.append({
                "team_id": team_id,
                "team_name": team.name,
                "driver_scores": driver_scores
            })
        
        # Cache the data
        cache_service.set_heatmap_cache(
            org_id=org_id,
            survey_id=survey_id,
            heatmap_data=heatmap_data,
            ttl_minutes=15
        )
        
        logger.info(f"Refreshed heatmap cache for org:{org_id}, survey:{survey_id}")
        
    except Exception as e:
        logger.error(f"Error refreshing heatmap cache: {str(e)}")
        raise
    finally:
        db.close()

@shared_task(bind=True, name="performance.refresh_trend_cache")
def refresh_trend_cache(self, org_id: str, team_id: str = None, months: int = 6):
    """Refresh trend cache for org/team"""
    try:
        db = SessionLocal()
        
        # Get surveys for the last N months
        cutoff_date = datetime.utcnow() - timedelta(days=30 * months)
        surveys = db.query(Survey).filter(
            Survey.creator_id == org_id,
            Survey.created_at >= cutoff_date,
            Survey.status.in_(["active", "closed"])
        ).order_by(Survey.created_at).all()
        
        trend_data = []
        
        for survey in surveys:
            if team_id:
                # Team-specific trends
                trends = db.query(OrgDriverTrends).filter(
                    OrgDriverTrends.team_id == team_id,
                    OrgDriverTrends.period_month >= cutoff_date.date()
                ).order_by(OrgDriverTrends.period_month).all()
                
                monthly_data = {}
                for trend in trends:
                    month_key = trend.period_month.strftime("%Y-%m")
                    if month_key not in monthly_data:
                        monthly_data[month_key] = {"scores": [], "count": 0}
                    
                    monthly_data[month_key]["scores"].append(trend.avg_score)
                    monthly_data[month_key]["count"] += 1
                
                for month, data in monthly_data.items():
                    avg_score = sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0
                    trend_data.append({
                        "month": month,
                        "avg_score": round(avg_score, 1),
                        "drivers_count": data["count"]
                    })
            else:
                # Org-wide trends (simplified)
                trend_data.append({
                    "month": survey.created_at.strftime("%Y-%m"),
                    "survey_id": str(survey.id),
                    "survey_title": survey.title
                })
        
        # Cache the data
        cache_service.set_trend_cache(
            org_id=org_id,
            team_id=team_id,
            months=months,
            trend_data=trend_data,
            ttl_minutes=20
        )
        
        logger.info(f"Refreshed trend cache for org:{org_id}, team:{team_id}, months:{months}")
        
    except Exception as e:
        logger.error(f"Error refreshing trend cache: {str(e)}")
        raise
    finally:
        db.close()

@shared_task(bind=True, name="performance.refresh_themes_cache")
def refresh_themes_cache(self, org_id: str, survey_id: str):
    """Refresh themes cache for org"""
    try:
        db = SessionLocal()
        
        # Get all teams for org
        teams = db.query(Team).filter(Team.org_id == org_id).all()
        team_ids = [str(team.id) for team in teams]
        
        # Get comments with NLP analysis
        from app.models.summaries import CommentNLP
        comments_with_nlp = db.query(Comment, CommentNLP).join(CommentNLP).filter(
            Comment.survey_id == survey_id,
            Comment.team_id.in_(team_ids)
        ).all()
        
        # Aggregate themes
        theme_counts = {}
        sentiment_by_theme = {}
        
        for comment, nlp in comments_with_nlp:
            if nlp.themes:
                for theme in nlp.themes:
                    if theme not in theme_counts:
                        theme_counts[theme] = 0
                        sentiment_by_theme[theme] = {"positive": 0, "negative": 0, "neutral": 0}
                    
                    theme_counts[theme] += 1
                    
                    if nlp.sentiment == '+':
                        sentiment_by_theme[theme]["positive"] += 1
                    elif nlp.sentiment == '-':
                        sentiment_by_theme[theme]["negative"] += 1
                    else:
                        sentiment_by_theme[theme]["neutral"] += 1
        
        # Format themes data
        themes_data = []
        for theme, count in theme_counts.items():
            sentiment_data = sentiment_by_theme[theme]
            total = sum(sentiment_data.values())
            
            themes_data.append({
                "theme": theme,
                "count": count,
                "sentiment_breakdown": {
                    "positive": round(sentiment_data["positive"] / total * 100, 1) if total > 0 else 0,
                    "negative": round(sentiment_data["negative"] / total * 100, 1) if total > 0 else 0,
                    "neutral": round(sentiment_data["neutral"] / total * 100, 1) if total > 0 else 0
                }
            })
        
        # Sort by count
        themes_data.sort(key=lambda x: x["count"], reverse=True)
        
        # Cache the data
        cache_service.set_themes_cache(
            org_id=org_id,
            survey_id=survey_id,
            themes_data=themes_data,
            ttl_minutes=30
        )
        
        logger.info(f"Refreshed themes cache for org:{org_id}, survey:{survey_id}")
        
    except Exception as e:
        logger.error(f"Error refreshing themes cache: {str(e)}")
        raise
    finally:
        db.close()

@shared_task(bind=True, name="performance.invalidate_survey_cache")
def invalidate_survey_cache(self, org_id: str, survey_id: str):
    """Invalidate all cache entries for a survey"""
    try:
        # Invalidate survey cache
        cache_service.invalidate_survey_cache(org_id, survey_id)
        
        logger.info(f"Invalidated cache for survey:{survey_id}")
        
    except Exception as e:
        logger.error(f"Error invalidating survey cache: {str(e)}")
        raise

@shared_task(bind=True, name="performance.invalidate_team_cache")
def invalidate_team_cache(self, org_id: str, team_id: str):
    """Invalidate all cache entries for a team"""
    try:
        # Invalidate team cache
        cache_service.invalidate_team_cache(org_id, team_id)
        
        logger.info(f"Invalidated cache for team:{team_id}")
        
    except Exception as e:
        logger.error(f"Error invalidating team cache: {str(e)}")
        raise

@shared_task(bind=True, name="performance.optimize_database")
def optimize_database(self):
    """Run database optimization tasks"""
    try:
        db = SessionLocal()
        
        # Update table statistics
        tables = [
            'numeric_responses', 'comments', 'participation_summary',
            'driver_summary', 'sentiment_summary', 'org_driver_trends',
            'reports_cache', 'comment_nlp', 'alerts', 'survey_tokens',
            'audit_logs', 'alert_audit_logs', 'settings_audit_logs',
            'token_audit_logs'
        ]
        
        for table in tables:
            try:
                db.execute(f"ANALYZE {table}")
                logger.info(f"Updated statistics for table: {table}")
            except Exception as e:
                logger.warning(f"Failed to analyze table {table}: {str(e)}")
        
        # Vacuum tables if needed (only if autovacuum is disabled)
        # db.execute("VACUUM ANALYZE")
        
        logger.info("Database optimization completed")
        
    except Exception as e:
        logger.error(f"Error optimizing database: {str(e)}")
        raise
    finally:
        db.close()

@shared_task(bind=True, name="performance.monitor_cache_performance")
def monitor_cache_performance(self):
    """Monitor cache performance and log statistics"""
    try:
        # Get cache statistics
        stats = cache_service.get_cache_stats()
        
        if "error" not in stats:
            logger.info(f"Cache performance stats: {stats}")
            
            # Log warning if hit rate is low
            hit_rate = stats.get("hit_rate", 0)
            if hit_rate < 50:
                logger.warning(f"Low cache hit rate: {hit_rate}%")
            
            # Log warning if memory usage is high
            memory_usage = stats.get("used_memory", "Unknown")
            if isinstance(memory_usage, str) and "MB" in memory_usage:
                try:
                    mb_value = float(memory_usage.replace("MB", ""))
                    if mb_value > 1000:  # 1GB
                        logger.warning(f"High cache memory usage: {memory_usage}")
                except:
                    pass
        else:
            logger.error(f"Cache monitoring error: {stats['error']}")
        
    except Exception as e:
        logger.error(f"Error monitoring cache performance: {str(e)}")

@shared_task(bind=True, name="performance.preload_active_surveys")
def preload_active_surveys(self):
    """Preload cache for active surveys"""
    try:
        db = SessionLocal()
        
        # Get all active surveys
        active_surveys = db.query(Survey).filter(
            Survey.status == "active"
        ).all()
        
        for survey in active_surveys:
            org_id = str(survey.creator_id)
            survey_id = str(survey.id)
            
            # Get teams for this survey
            teams = db.query(Team).filter(Team.org_id == org_id).all()
            
            # Preload org-wide KPIs
            refresh_kpis_cache.delay(org_id, survey_id)
            
            # Preload team-specific KPIs
            for team in teams:
                refresh_kpis_cache.delay(org_id, survey_id, str(team.id))
            
            # Preload heatmap
            refresh_heatmap_cache.delay(org_id, survey_id)
            
            # Preload themes
            refresh_themes_cache.delay(org_id, survey_id)
        
        logger.info(f"Preloaded cache for {len(active_surveys)} active surveys")
        
    except Exception as e:
        logger.error(f"Error preloading active surveys: {str(e)}")
        raise
    finally:
        db.close()

@shared_task(bind=True, name="performance.cleanup_expired_cache")
def cleanup_expired_cache(self):
    """Clean up expired cache entries (Redis handles this automatically, but we can log)"""
    try:
        # Redis automatically expires keys, but we can log cache stats
        stats = cache_service.get_cache_stats()
        
        if "error" not in stats:
            logger.info(f"Cache cleanup stats: {stats}")
        
    except Exception as e:
        logger.error(f"Error during cache cleanup: {str(e)}")

@shared_task(bind=True, name="performance.refresh_all_caches")
def refresh_all_caches(self):
    """Refresh all caches for all active surveys"""
    try:
        # This is a heavy operation, so we do it in the background
        preload_active_surveys.delay()
        
        logger.info("Scheduled refresh of all caches")
        
    except Exception as e:
        logger.error(f"Error refreshing all caches: {str(e)}")
        raise
