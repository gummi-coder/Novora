"""
Enhanced NLP Processing Tasks with Queue Management and PII Masking
"""
from celery import shared_task
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import logging

from app.core.database import SessionLocal
from app.services.nlp_processor import NLPProcessor
from app.models.responses import Comment
from app.models.summaries import CommentNLP

logger = logging.getLogger(__name__)

@shared_task(bind=True, name="nlp.process_comment")
def process_comment_nlp(self, comment_id: str, pii_masking_enabled: bool = True):
    """Process a single comment through the NLP pipeline"""
    try:
        db = SessionLocal()
        processor = NLPProcessor(db)
        
        # Get comment text
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            logger.warning(f"Comment {comment_id} not found for NLP processing")
            return {"status": "error", "message": "Comment not found"}
        
        # Process comment
        nlp_result = processor.process_comment(comment_id, comment.text, pii_masking_enabled)
        
        # Update sentiment summary
        processor.update_sentiment_summary(comment.survey_id, comment.team_id)
        
        logger.info(f"Successfully processed comment {comment_id} through NLP pipeline")
        return {
            "status": "success",
            "comment_id": comment_id,
            "sentiment": nlp_result.sentiment,
            "themes": nlp_result.themes,
            "pii_masked": nlp_result.pii_masked
        }
        
    except Exception as e:
        logger.error(f"Error processing comment {comment_id}: {str(e)}")
        # Retry with exponential backoff
        raise self.retry(countdown=60, max_retries=3)
    finally:
        db.close()

@shared_task(bind=True, name="nlp.batch_process_comments")
def batch_process_comments(self, comment_ids: List[str], pii_masking_enabled: bool = True):
    """Process multiple comments in batch"""
    try:
        db = SessionLocal()
        processor = NLPProcessor(db)
        
        results = processor.batch_process_comments(comment_ids, pii_masking_enabled)
        
        # Update sentiment summaries for affected surveys/teams
        processed_surveys = set()
        for comment_id in comment_ids:
            comment = db.query(Comment).filter(Comment.id == comment_id).first()
            if comment:
                survey_team_key = f"{comment.survey_id}_{comment.team_id}"
                if survey_team_key not in processed_surveys:
                    processor.update_sentiment_summary(comment.survey_id, comment.team_id)
                    processed_surveys.add(survey_team_key)
        
        logger.info(f"Successfully batch processed {len(results)} comments")
        return {
            "status": "success",
            "processed_count": len(results),
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Error in batch processing: {str(e)}")
        raise self.retry(countdown=120, max_retries=2)
    finally:
        db.close()

@shared_task(bind=True, name="nlp.process_new_comments")
def process_new_comments(self, survey_id: str, team_id: str, pii_masking_enabled: bool = True):
    """Process all new comments for a survey/team that don't have NLP results"""
    try:
        db = SessionLocal()
        
        # Find comments without NLP results
        comments_without_nlp = db.query(Comment).outerjoin(CommentNLP).filter(
            Comment.survey_id == survey_id,
            Comment.team_id == team_id,
            CommentNLP.comment_id.is_(None)
        ).all()
        
        if not comments_without_nlp:
            logger.info(f"No new comments to process for survey {survey_id}, team {team_id}")
            return {"status": "success", "processed_count": 0}
        
        # Process comments
        processor = NLPProcessor(db)
        comment_ids = [str(comment.id) for comment in comments_without_nlp]
        results = processor.batch_process_comments(comment_ids, pii_masking_enabled)
        
        # Update sentiment summary
        processor.update_sentiment_summary(survey_id, team_id)
        
        logger.info(f"Processed {len(results)} new comments for survey {survey_id}, team {team_id}")
        return {
            "status": "success",
            "survey_id": survey_id,
            "team_id": team_id,
            "processed_count": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error processing new comments: {str(e)}")
        raise self.retry(countdown=180, max_retries=2)
    finally:
        db.close()

@shared_task(bind=True, name="nlp.backfill_existing_comments")
def backfill_existing_comments(self, org_id: str, pii_masking_enabled: bool = True):
    """Backfill NLP processing for all existing comments without NLP results"""
    try:
        db = SessionLocal()
        processor = NLPProcessor(db)
        
        result = processor.backfill_existing_comments(org_id, pii_masking_enabled)
        
        logger.info(f"Backfill completed: {result['message']}")
        return {
            "status": "success",
            "org_id": org_id,
            **result
        }
        
    except Exception as e:
        logger.error(f"Error in backfill: {str(e)}")
        raise self.retry(countdown=300, max_retries=1)
    finally:
        db.close()

@shared_task(bind=True, name="nlp.refresh_nlp_processing")
def refresh_nlp_processing(self):
    """Periodic task to refresh NLP processing for all active surveys"""
    try:
        db = SessionLocal()
        
        # Get all active surveys
        from app.models.base import Survey
        active_surveys = db.query(Survey).filter(Survey.status == "active").all()
        
        total_processed = 0
        
        for survey in active_surveys:
            # Get teams with responses for this survey
            from app.models.responses import NumericResponse
            teams_with_responses = db.query(NumericResponse.team_id).filter(
                NumericResponse.survey_id == survey.id
            ).distinct().all()
            
            for (team_id,) in teams_with_responses:
                try:
                    # Process new comments for this survey/team
                    result = process_new_comments.delay(str(survey.id), str(team_id))
                    total_processed += result.get() or 0
                except Exception as e:
                    logger.error(f"Error processing comments for survey {survey.id}, team {team_id}: {str(e)}")
                    continue
        
        logger.info(f"Refresh NLP processing completed. Total processed: {total_processed}")
        return {
            "status": "success",
            "total_processed": total_processed,
            "surveys_processed": len(active_surveys)
        }
        
    except Exception as e:
        logger.error(f"Error in refresh NLP processing: {str(e)}")
        raise self.retry(countdown=600, max_retries=1)
    finally:
        db.close()

@shared_task(bind=True, name="nlp.update_sentiment_summaries")
def update_sentiment_summaries(self, survey_id: str = None, team_id: str = None):
    """Update sentiment summaries for specified survey/team or all"""
    try:
        db = SessionLocal()
        processor = NLPProcessor(db)
        
        if survey_id and team_id:
            # Update specific survey/team
            processor.update_sentiment_summary(survey_id, team_id)
            logger.info(f"Updated sentiment summary for survey {survey_id}, team {team_id}")
            return {
                "status": "success",
                "survey_id": survey_id,
                "team_id": team_id
            }
        else:
            # Update all sentiment summaries
            from app.models.base import Survey
            surveys = db.query(Survey).filter(Survey.status.in_(["active", "closed"])).all()
            
            updated_count = 0
            for survey in surveys:
                teams_with_responses = db.query(NumericResponse.team_id).filter(
                    NumericResponse.survey_id == survey.id
                ).distinct().all()
                
                for (team_id,) in teams_with_responses:
                    try:
                        processor.update_sentiment_summary(str(survey.id), str(team_id))
                        updated_count += 1
                    except Exception as e:
                        logger.error(f"Error updating sentiment for survey {survey.id}, team {team_id}: {str(e)}")
                        continue
            
            logger.info(f"Updated {updated_count} sentiment summaries")
            return {
                "status": "success",
                "updated_count": updated_count
            }
        
    except Exception as e:
        logger.error(f"Error updating sentiment summaries: {str(e)}")
        raise self.retry(countdown=300, max_retries=1)
    finally:
        db.close()

@shared_task(bind=True, name="nlp.get_theme_analysis")
def get_theme_analysis(self, survey_id: str, team_id: str):
    """Get comprehensive theme analysis for a survey/team"""
    try:
        db = SessionLocal()
        processor = NLPProcessor(db)
        
        analysis = processor.get_theme_analysis(survey_id, team_id)
        
        logger.info(f"Generated theme analysis for survey {survey_id}, team {team_id}")
        return {
            "status": "success",
            "survey_id": survey_id,
            "team_id": team_id,
            "analysis": analysis
        }
        
    except Exception as e:
        logger.error(f"Error getting theme analysis: {str(e)}")
        raise self.retry(countdown=60, max_retries=2)
    finally:
        db.close()

@shared_task(bind=True, name="nlp.queue_comment_for_processing")
def queue_comment_for_processing(self, comment_id: str, pii_masking_enabled: bool = True):
    """Queue a comment for NLP processing (called when new comment is submitted)"""
    try:
        # Queue the comment for processing
        task = process_comment_nlp.delay(comment_id, pii_masking_enabled)
        
        logger.info(f"Queued comment {comment_id} for NLP processing")
        return {
            "status": "queued",
            "comment_id": comment_id,
            "task_id": task.id
        }
        
    except Exception as e:
        logger.error(f"Error queuing comment {comment_id}: {str(e)}")
        # Retry immediately for queue failures
        raise self.retry(countdown=10, max_retries=3)

@shared_task(bind=True, name="nlp.process_survey_comments")
def process_survey_comments(self, survey_id: str, pii_masking_enabled: bool = True):
    """Process all comments for a specific survey"""
    try:
        db = SessionLocal()
        
        # Get all teams with comments for this survey
        teams_with_comments = db.query(Comment.team_id).filter(
            Comment.survey_id == survey_id
        ).distinct().all()
        
        total_processed = 0
        
        for (team_id,) in teams_with_comments:
            try:
                result = process_new_comments.delay(survey_id, str(team_id), pii_masking_enabled)
                processed_count = result.get() or 0
                total_processed += processed_count
            except Exception as e:
                logger.error(f"Error processing comments for survey {survey_id}, team {team_id}: {str(e)}")
                continue
        
        logger.info(f"Processed {total_processed} comments for survey {survey_id}")
        return {
            "status": "success",
            "survey_id": survey_id,
            "total_processed": total_processed,
            "teams_processed": len(teams_with_comments)
        }
        
    except Exception as e:
        logger.error(f"Error processing survey comments: {str(e)}")
        raise self.retry(countdown=240, max_retries=2)
    finally:
        db.close()
