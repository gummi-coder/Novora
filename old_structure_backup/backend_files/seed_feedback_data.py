#!/usr/bin/env python3
"""
Seed script for feedback distribution data

This script creates sample survey responses and comments for testing
the feedback distribution analysis feature.
"""
import sys
import os
from datetime import datetime, timedelta
import random
import hashlib

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.advanced import SurveyResponse, SurveyComment, Driver, MetricsSummary, Team
from app.models.base import Survey, Question, User
from app.services.feedback_analytics import FeedbackAnalyticsService

def create_sample_data():
    """Create sample feedback data for testing"""
    db = SessionLocal()
    
    try:
        # Get or create a test survey
        survey = db.query(Survey).filter(Survey.title.like("%Test%")).first()
        if not survey:
            # Create a test survey
            user = db.query(User).first()
            if not user:
                print("No users found. Please create a user first.")
                return
            
            survey = Survey(
                title="Employee Feedback Test Survey",
                description="Test survey for feedback distribution analysis",
                creator_id=user.id,
                status="active",
                start_date=datetime.utcnow() - timedelta(days=30),
                end_date=datetime.utcnow() + timedelta(days=30),
                is_anonymous=True,
                allow_comments=True
            )
            db.add(survey)
            db.commit()
            db.refresh(survey)
            print(f"Created test survey: {survey.title}")
        
        # Get or create teams
        teams = db.query(Team).limit(3).all()
        if not teams:
            print("No teams found. Please create teams first.")
            return
        
        # Get or create questions
        questions = db.query(Question).filter(Question.survey_id == survey.id).all()
        if not questions:
            # Create sample questions
            question_data = [
                {
                    "text": "I feel valued and recognized for my contributions at work",
                    "driver": "Recognition",
                    "category": "Leadership"
                },
                {
                    "text": "My team collaborates effectively and supports each other",
                    "driver": "Collaboration",
                    "category": "Team"
                },
                {
                    "text": "I have a good work-life balance",
                    "driver": "Work-Life Balance",
                    "category": "Wellness"
                },
                {
                    "text": "I receive regular and constructive feedback from my manager",
                    "driver": "Manager Relationship",
                    "category": "Leadership"
                },
                {
                    "text": "I have clear opportunities for career growth and advancement",
                    "driver": "Career Growth",
                    "category": "Development"
                },
                {
                    "text": "Communication between departments is effective and transparent",
                    "driver": "Communication",
                    "category": "Organization"
                }
            ]
            
            for q_data in question_data:
                question = Question(
                    survey_id=survey.id,
                    text=q_data["text"],
                    question_type="rating",
                    options=json.dumps({"min": 0, "max": 10}),
                    required=True
                )
                db.add(question)
                db.commit()
                db.refresh(question)
                
                # Create driver mapping
                driver = Driver(
                    question_id=question.id,
                    driver_name=q_data["driver"],
                    description=f"Driver for {q_data['driver']}",
                    category=q_data["category"]
                )
                db.add(driver)
            
            db.commit()
            questions = db.query(Question).filter(Question.survey_id == survey.id).all()
            print(f"Created {len(questions)} questions")
        
        # Create sample survey responses
        print("Creating sample survey responses...")
        drivers = ["Recognition", "Collaboration", "Work-Life Balance", "Manager Relationship", "Career Growth", "Communication"]
        
        for team in teams:
            # Create responses for each team
            for i in range(20):  # 20 employees per team
                employee_id = f"emp_{team.id}_{i:03d}"
                
                for question in questions:
                    # Get driver for this question
                    driver = db.query(Driver).filter(Driver.question_id == question.id).first()
                    if not driver:
                        continue
                    
                    # Generate realistic scores based on driver
                    base_scores = {
                        "Recognition": 7.5,
                        "Collaboration": 8.2,
                        "Work-Life Balance": 7.8,
                        "Manager Relationship": 6.1,
                        "Career Growth": 5.8,
                        "Communication": 6.5
                    }
                    
                    base_score = base_scores.get(driver.driver_name, 7.0)
                    # Add some variation
                    score = max(0, min(10, int(base_score + random.uniform(-2, 2))))
                    
                    response = SurveyResponse(
                        employee_id=employee_id,
                        team_id=team.id,
                        survey_id=survey.id,
                        question_id=question.id,
                        driver=driver.driver_name,
                        score=score,
                        timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                    )
                    db.add(response)
        
        # Create sample comments
        print("Creating sample comments...")
        comment_templates = [
            {
                "text": "I really appreciate the recognition I've been getting lately. It makes me feel valued.",
                "sentiment": "positive",
                "driver": "Recognition"
            },
            {
                "text": "Our team works together really well. Everyone is supportive and collaborative.",
                "sentiment": "positive",
                "driver": "Collaboration"
            },
            {
                "text": "I'm struggling with work-life balance. The workload has been overwhelming.",
                "sentiment": "negative",
                "driver": "Work-Life Balance"
            },
            {
                "text": "My manager rarely gives me feedback. I don't know how I'm performing.",
                "sentiment": "negative",
                "driver": "Manager Relationship"
            },
            {
                "text": "I see clear growth opportunities in my role and feel supported in my development.",
                "sentiment": "positive",
                "driver": "Career Growth"
            },
            {
                "text": "Communication between teams could be better. We often work in silos.",
                "sentiment": "negative",
                "driver": "Communication"
            }
        ]
        
        for team in teams:
            for i in range(5):  # 5 comments per team
                template = random.choice(comment_templates)
                employee_id = f"emp_{team.id}_{i:03d}"
                
                comment = SurveyComment(
                    comment_id=f"cmt_{team.id}_{i:03d}",
                    team_id=team.id,
                    survey_id=survey.id,
                    driver=template["driver"],
                    sentiment=template["sentiment"],
                    text=template["text"],
                    employee_id=employee_id,
                    is_flagged=random.choice([True, False]),
                    is_pinned=random.choice([True, False]),
                    tags=random.sample(["workload", "recognition", "communication", "growth"], random.randint(1, 3)),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                )
                db.add(comment)
        
        db.commit()
        print("Sample data created successfully!")
        
        # Calculate and cache metrics
        print("Calculating and caching metrics...")
        for team in teams:
            metrics = FeedbackAnalyticsService.calculate_driver_metrics(
                db, team_id=team.id, survey_id=survey.id
            )
            
            for metric in metrics:
                FeedbackAnalyticsService.cache_metrics_summary(
                    db, team.id, survey.id, metric['driver'], metric
                )
        
        print("Metrics calculated and cached!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import json
    create_sample_data()
