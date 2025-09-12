"""
NLP Management Endpoints for Admin Control
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User
from app.services.nlp_processor import NLPProcessor
from app.models.responses import Comment
from app.models.summaries import CommentNLP

router = APIRouter()

@router.post("/process-comment")
async def process_single_comment(
    comment_id: str = Body(..., embed=True),
    pii_masking_enabled: bool = Body(True, embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually process a single comment through NLP pipeline"""
    try:
        # Only admins can trigger NLP processing
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Only admins can trigger NLP processing")
        
        processor = NLPProcessor(db)
        
        # Get comment
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        # Process comment
        nlp_result = processor.process_comment(comment_id, comment.text, pii_masking_enabled)
        
        # Update sentiment summary
        processor.update_sentiment_summary(comment.survey_id, comment.team_id)
        
        return {
            "status": "success",
            "comment_id": comment_id,
            "sentiment": nlp_result.sentiment,
            "themes": nlp_result.themes,
            "pii_masked": nlp_result.pii_masked,
            "processed_at": nlp_result.processed_at.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing comment: {str(e)}")

@router.post("/process-survey")
async def process_survey_comments(
    survey_id: str = Body(..., embed=True),
    pii_masking_enabled: bool = Body(True, embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process all comments for a specific survey"""
    try:
        # Only admins can trigger NLP processing
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Only admins can trigger NLP processing")
        
        processor = NLPProcessor(db)
        
        # Get all comments for this survey
        comments = db.query(Comment).filter(Comment.survey_id == survey_id).all()
        
        if not comments:
            return {
                "status": "success",
                "message": "No comments found for survey",
                "processed_count": 0
            }
        
        # Process comments
        comment_ids = [str(comment.id) for comment in comments]
        results = processor.batch_process_comments(comment_ids, pii_masking_enabled)
        
        # Update sentiment summaries for all teams
        teams_processed = set()
        for comment in comments:
            team_key = f"{comment.survey_id}_{comment.team_id}"
            if team_key not in teams_processed:
                processor.update_sentiment_summary(comment.survey_id, comment.team_id)
                teams_processed.add(team_key)
        
        return {
            "status": "success",
            "survey_id": survey_id,
            "processed_count": len(results),
            "total_comments": len(comments),
            "teams_processed": len(teams_processed)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing survey comments: {str(e)}")

@router.post("/backfill")
async def backfill_nlp_processing(
    org_id: str = Body(..., embed=True),
    pii_masking_enabled: bool = Body(True, embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Backfill NLP processing for all existing comments without NLP results"""
    try:
        # Only admins can trigger backfill
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Only admins can trigger backfill")
        
        processor = NLPProcessor(db)
        
        result = processor.backfill_existing_comments(org_id, pii_masking_enabled)
        
        return {
            "status": "success",
            "org_id": org_id,
            **result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in backfill: {str(e)}")

@router.get("/status")
async def get_nlp_status(
    survey_id: Optional[str] = Query(None, description="Survey ID (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get NLP processing status"""
    try:
        # Only admins can view NLP status
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Only admins can view NLP status")
        
        if survey_id:
            # Get status for specific survey
            total_comments = db.query(Comment).filter(Comment.survey_id == survey_id).count()
            processed_comments = db.query(Comment).join(CommentNLP).filter(
                Comment.survey_id == survey_id
            ).count()
            
            return {
                "survey_id": survey_id,
                "total_comments": total_comments,
                "processed_comments": processed_comments,
                "unprocessed_comments": total_comments - processed_comments,
                "processing_percentage": (processed_comments / total_comments * 100) if total_comments > 0 else 0
            }
        else:
            # Get overall status
            total_comments = db.query(Comment).count()
            processed_comments = db.query(Comment).join(CommentNLP).count()
            
            # Get recent processing activity
            recent_processing = db.query(CommentNLP).filter(
                CommentNLP.processed_at >= datetime.utcnow() - timedelta(hours=24)
            ).count()
            
            return {
                "total_comments": total_comments,
                "processed_comments": processed_comments,
                "unprocessed_comments": total_comments - processed_comments,
                "processing_percentage": (processed_comments / total_comments * 100) if total_comments > 0 else 0,
                "recent_processing_24h": recent_processing
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting NLP status: {str(e)}")

@router.get("/theme-analysis")
async def get_theme_analysis(
    survey_id: str = Query(..., description="Survey ID"),
    team_id: str = Query(..., description="Team ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive theme analysis for a survey/team"""
    try:
        # Only admins can view theme analysis
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Only admins can view theme analysis")
        
        processor = NLPProcessor(db)
        analysis = processor.get_theme_analysis(survey_id, team_id)
        
        return {
            "survey_id": survey_id,
            "team_id": team_id,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting theme analysis: {str(e)}")

@router.post("/update-sentiment-summaries")
async def update_sentiment_summaries(
    survey_id: Optional[str] = Body(None, embed=True),
    team_id: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually update sentiment summaries"""
    try:
        # Only admins can update sentiment summaries
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Only admins can update sentiment summaries")
        
        processor = NLPProcessor(db)
        
        if survey_id and team_id:
            # Update specific survey/team
            processor.update_sentiment_summary(survey_id, team_id)
            return {
                "status": "success",
                "message": f"Updated sentiment summary for survey {survey_id}, team {team_id}"
            }
        else:
            # Update all sentiment summaries
            from app.models.base import Survey
            from app.models.responses import NumericResponse
            
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
                        continue
            
            return {
                "status": "success",
                "message": f"Updated {updated_count} sentiment summaries"
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating sentiment summaries: {str(e)}")
