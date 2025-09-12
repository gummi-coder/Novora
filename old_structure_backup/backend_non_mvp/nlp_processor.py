"""
Enhanced NLP Processor with PII Masking, Sentiment Analysis, and Theme Extraction
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from textblob import TextBlob
import spacy
from collections import Counter
from sqlalchemy.orm import Session

from app.models.summaries import CommentNLP
from app.models.responses import Comment
from app.core.privacy import mask_pii

logger = logging.getLogger(__name__)

# Load spaCy model for NLP processing
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.warning("spaCy model not found. Installing...")
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

class NLPProcessor:
    def __init__(self, db: Session):
        self.db = db
        
        # Common workplace themes/keywords
        self.theme_keywords = {
            "workload": ["workload", "busy", "overwhelmed", "stress", "pressure", "deadline", "overtime"],
            "recognition": ["recognition", "appreciation", "reward", "acknowledge", "credit", "praise"],
            "communication": ["communication", "feedback", "meeting", "email", "discussion", "collaboration"],
            "leadership": ["leadership", "manager", "boss", "direction", "guidance", "support"],
            "work_environment": ["office", "remote", "flexible", "workplace", "culture", "atmosphere"],
            "compensation": ["salary", "pay", "benefits", "compensation", "bonus", "raise"],
            "career_growth": ["growth", "development", "promotion", "advancement", "learning", "training"],
            "work_life_balance": ["balance", "flexibility", "time", "family", "personal", "life"],
            "teamwork": ["team", "collaboration", "cooperation", "support", "help", "together"],
            "resources": ["resources", "tools", "equipment", "budget", "staffing", "support"]
        }
    
    def process_comment(self, comment_id: str, text: str, pii_masking_enabled: bool = True) -> CommentNLP:
        """Process a single comment through the complete NLP pipeline"""
        try:
            # Step 1: PII Masking
            masked_text = self._mask_pii(text, pii_masking_enabled)
            
            # Step 2: Sentiment Analysis
            sentiment = self._analyze_sentiment(masked_text)
            
            # Step 3: Theme Extraction
            themes = self._extract_themes(masked_text)
            
            # Step 4: Store results
            comment_nlp = CommentNLP(
                comment_id=comment_id,
                sentiment=sentiment,
                themes=themes,
                pii_masked=pii_masking_enabled,
                processed_at=datetime.utcnow()
            )
            
            self.db.add(comment_nlp)
            self.db.commit()
            self.db.refresh(comment_nlp)
            
            logger.info(f"Processed comment {comment_id}: sentiment={sentiment}, themes={themes}")
            return comment_nlp
            
        except Exception as e:
            logger.error(f"Error processing comment {comment_id}: {str(e)}")
            self.db.rollback()
            raise
    
    def _mask_pii(self, text: str, enabled: bool = True) -> str:
        """Enhanced PII masking with comprehensive patterns"""
        if not enabled or not text:
            return text
        
        try:
            # Use the centralized PII masking function
            return mask_pii(text, enabled)
            
        except Exception as e:
            logger.error(f"Error masking PII: {str(e)}")
            return text
    
    def _analyze_sentiment(self, text: str) -> str:
        """Analyze sentiment using TextBlob with custom thresholds"""
        try:
            if not text or len(text.strip()) < 3:
                return '0'  # Neutral for very short text
            
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            # Custom thresholds for workplace feedback
            if polarity > 0.1:
                return '+'  # Positive
            elif polarity < -0.1:
                return '-'  # Negative
            else:
                return '0'  # Neutral
                
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            return '0'  # Default to neutral
    
    def _extract_themes(self, text: str) -> List[str]:
        """Extract themes using keyword matching and NLP analysis"""
        try:
            if not text:
                return []
            
            # Convert to lowercase for matching
            text_lower = text.lower()
            
            # Find matching themes
            matched_themes = []
            
            for theme, keywords in self.theme_keywords.items():
                for keyword in keywords:
                    if keyword in text_lower:
                        matched_themes.append(theme)
                        break  # Only count each theme once
            
            # Use spaCy for additional theme extraction
            doc = nlp(text)
            
            # Extract noun phrases and named entities
            noun_phrases = [chunk.text.lower() for chunk in doc.noun_chunks]
            entities = [ent.text.lower() for ent in doc.ents]
            
            # Additional workplace-specific themes
            additional_themes = self._extract_additional_themes(text_lower, noun_phrases, entities)
            matched_themes.extend(additional_themes)
            
            # Remove duplicates and return
            return list(set(matched_themes))
            
        except Exception as e:
            logger.error(f"Error extracting themes: {str(e)}")
            return []
    
    def _extract_additional_themes(self, text: str, noun_phrases: List[str], entities: List[str]) -> List[str]:
        """Extract additional themes from noun phrases and entities"""
        additional_themes = []
        
        # Check for specific workplace patterns
        if any(word in text for word in ["meeting", "call", "presentation"]):
            additional_themes.append("meetings")
        
        if any(word in text for word in ["deadline", "urgent", "rush"]):
            additional_themes.append("urgency")
        
        if any(word in text for word in ["remote", "home", "office", "hybrid"]):
            additional_themes.append("work_location")
        
        if any(word in text for word in ["salary", "pay", "money", "bonus"]):
            additional_themes.append("compensation")
        
        if any(word in text for word in ["promotion", "career", "advancement"]):
            additional_themes.append("career_growth")
        
        if any(word in text for word in ["training", "learning", "development"]):
            additional_themes.append("learning")
        
        if any(word in text for word in ["process", "procedure", "system"]):
            additional_themes.append("processes")
        
        if any(word in text for word in ["technology", "software", "tool"]):
            additional_themes.append("technology")
        
        return additional_themes
    
    def batch_process_comments(self, comment_ids: List[str], pii_masking_enabled: bool = True) -> Dict[str, CommentNLP]:
        """Process multiple comments in batch"""
        results = {}
        
        for comment_id in comment_ids:
            try:
                # Get comment text
                comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
                if not comment:
                    logger.warning(f"Comment {comment_id} not found")
                    continue
                
                # Process comment
                nlp_result = self.process_comment(comment_id, comment.text, pii_masking_enabled)
                results[comment_id] = nlp_result
                
            except Exception as e:
                logger.error(f"Error processing comment {comment_id}: {str(e)}")
                continue
        
        return results
    
    def update_sentiment_summary(self, survey_id: str, team_id: str):
        """Update sentiment summary after processing new comments"""
        try:
            # Get all comments with NLP results for this survey/team
            comments_with_nlp = self.db.query(Comment, CommentNLP).join(CommentNLP).filter(
                Comment.survey_id == survey_id,
                Comment.team_id == team_id
            ).all()
            
            if not comments_with_nlp:
                return
            
            # Calculate sentiment percentages
            total_comments = len(comments_with_nlp)
            positive_count = sum(1 for _, nlp in comments_with_nlp if nlp.sentiment == '+')
            negative_count = sum(1 for _, nlp in comments_with_nlp if nlp.sentiment == '-')
            neutral_count = total_comments - positive_count - negative_count
            
            pos_pct = (positive_count / total_comments * 100) if total_comments > 0 else 0
            neg_pct = (negative_count / total_comments * 100) if total_comments > 0 else 0
            neu_pct = (neutral_count / total_comments * 100) if total_comments > 0 else 0
            
            # Update sentiment summary
            from app.models.summaries import SentimentSummary
            sentiment_summary = self.db.query(SentimentSummary).filter(
                SentimentSummary.survey_id == survey_id,
                SentimentSummary.team_id == team_id
            ).first()
            
            if sentiment_summary:
                sentiment_summary.pos_pct = pos_pct
                sentiment_summary.neg_pct = neg_pct
                sentiment_summary.neu_pct = neu_pct
            else:
                sentiment_summary = SentimentSummary(
                    survey_id=survey_id,
                    team_id=team_id,
                    org_id=survey_id.split('-')[0],  # Extract org_id from survey_id
                    pos_pct=pos_pct,
                    neg_pct=neg_pct,
                    neu_pct=neu_pct
                )
                self.db.add(sentiment_summary)
            
            self.db.commit()
            logger.info(f"Updated sentiment summary for survey {survey_id}, team {team_id}")
            
        except Exception as e:
            logger.error(f"Error updating sentiment summary: {str(e)}")
            self.db.rollback()
    
    def get_theme_analysis(self, survey_id: str, team_id: str) -> Dict[str, Any]:
        """Get comprehensive theme analysis for a survey/team"""
        try:
            # Get all comments with NLP results
            comments_with_nlp = self.db.query(Comment, CommentNLP).join(CommentNLP).filter(
                Comment.survey_id == survey_id,
                Comment.team_id == team_id
            ).all()
            
            if not comments_with_nlp:
                return {"themes": [], "total_comments": 0}
            
            # Aggregate themes
            theme_counts = Counter()
            theme_sentiment = {}
            
            for comment, nlp in comments_with_nlp:
                if nlp.themes:
                    for theme in nlp.themes:
                        theme_counts[theme] += 1
                        
                        if theme not in theme_sentiment:
                            theme_sentiment[theme] = {"positive": 0, "negative": 0, "neutral": 0}
                        
                        if nlp.sentiment == '+':
                            theme_sentiment[theme]["positive"] += 1
                        elif nlp.sentiment == '-':
                            theme_sentiment[theme]["negative"] += 1
                        else:
                            theme_sentiment[theme]["neutral"] += 1
            
            # Format results
            themes_data = []
            for theme, count in theme_counts.most_common():
                sentiment_data = theme_sentiment.get(theme, {"positive": 0, "negative": 0, "neutral": 0})
                total = sum(sentiment_data.values())
                
                themes_data.append({
                    "theme": theme,
                    "count": count,
                    "percentage": (count / len(comments_with_nlp) * 100) if comments_with_nlp else 0,
                    "sentiment_breakdown": {
                        "positive": (sentiment_data["positive"] / total * 100) if total > 0 else 0,
                        "negative": (sentiment_data["negative"] / total * 100) if total > 0 else 0,
                        "neutral": (sentiment_data["neutral"] / total * 100) if total > 0 else 0
                    }
                })
            
            return {
                "themes": themes_data,
                "total_comments": len(comments_with_nlp),
                "unique_themes": len(theme_counts)
            }
            
        except Exception as e:
            logger.error(f"Error getting theme analysis: {str(e)}")
            return {"themes": [], "total_comments": 0, "error": str(e)}
    
    def backfill_existing_comments(self, org_id: str, pii_masking_enabled: bool = True) -> Dict[str, Any]:
        """Backfill NLP processing for existing comments"""
        try:
            # Get all comments without NLP results
            comments_without_nlp = self.db.query(Comment).outerjoin(CommentNLP).filter(
                CommentNLP.comment_id.is_(None)
            ).all()
            
            if not comments_without_nlp:
                return {"processed": 0, "message": "No comments found without NLP results"}
            
            processed_count = 0
            error_count = 0
            
            for comment in comments_without_nlp:
                try:
                    self.process_comment(str(comment.id), comment.text, pii_masking_enabled)
                    processed_count += 1
                except Exception as e:
                    logger.error(f"Error processing comment {comment.id}: {str(e)}")
                    error_count += 1
            
            return {
                "processed": processed_count,
                "errors": error_count,
                "total_found": len(comments_without_nlp),
                "message": f"Processed {processed_count} comments, {error_count} errors"
            }
            
        except Exception as e:
            logger.error(f"Error in backfill: {str(e)}")
            return {"processed": 0, "errors": 1, "message": f"Backfill error: {str(e)}"}
