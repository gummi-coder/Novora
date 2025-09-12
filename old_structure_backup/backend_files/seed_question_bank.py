#!/usr/bin/env python3
"""
Seed script to populate the question bank with predefined questions
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.advanced import Metric, QuestionBank

def seed_question_bank():
    db = SessionLocal()
    
    try:
        # Define metrics
        metrics_data = [
            {
                "name": "Job Satisfaction & Happiness",
                "category": "job_satisfaction",
                "description": "Measures overall job satisfaction and happiness at work",
                "is_core": True,
                "display_order": 1
            },
            {
                "name": "eNPS (Employee Net Promoter Score)",
                "category": "enps",
                "description": "Measures likelihood to recommend the company as a workplace",
                "is_core": True,
                "display_order": 2
            },
            {
                "name": "Manager Relationship",
                "category": "manager_relationship",
                "description": "Measures relationship quality with direct manager",
                "is_core": False,
                "display_order": 3
            },
            {
                "name": "Peer Collaboration",
                "category": "peer_collaboration",
                "description": "Measures team collaboration and peer relationships",
                "is_core": False,
                "display_order": 4
            },
            {
                "name": "Recognition",
                "category": "recognition",
                "description": "Measures feeling of being valued and recognized",
                "is_core": False,
                "display_order": 5
            },
            {
                "name": "Career Growth",
                "category": "career_growth",
                "description": "Measures opportunities for professional development",
                "is_core": False,
                "display_order": 6
            },
            {
                "name": "Value Alignment",
                "category": "value_alignment",
                "description": "Measures alignment with company values and mission",
                "is_core": False,
                "display_order": 7
            },
            {
                "name": "Communication",
                "category": "communication",
                "description": "Measures effectiveness of internal communication",
                "is_core": False,
                "display_order": 8
            },
            {
                "name": "Work Environment",
                "category": "work_environment",
                "description": "Measures satisfaction with physical and digital work environment",
                "is_core": False,
                "display_order": 9
            },
            {
                "name": "Health & Wellness",
                "category": "health_wellness",
                "description": "Measures company support for mental and physical well-being",
                "is_core": False,
                "display_order": 10
            },
            {
                "name": "Engagement",
                "category": "engagement",
                "description": "Measures overall engagement and motivation at work",
                "is_core": False,
                "display_order": 11
            }
        ]
        
        # Create metrics
        metrics = {}
        for metric_data in metrics_data:
            metric = Metric(**metric_data)
            db.add(metric)
            db.flush()  # Get the ID
            metrics[metric_data["category"]] = metric
        
        # Define questions for each metric
        questions_data = {
            "job_satisfaction": [
                "How happy and satisfied do you feel at work lately?",
                "Overall, how satisfied are you with your job right now?",
                "How positive is your daily experience at work?",
                "Do you feel good about coming to work each day?",
                "How content are you with your current role?",
                "How well does your work bring you a sense of fulfillment?",
                "How enjoyable do you find your work most days?",
                "How satisfied are you with your current responsibilities?"
            ],
            "enps": [
                "How likely are you to recommend working here to a friend?",
                "Would you tell a friend this is a good place to work?",
                "How likely are you to encourage others to join this company?",
                "If a friend was job-hunting, would you suggest they apply here?",
                "Would you speak positively about working here to others?",
                "How likely are you to promote this company as a workplace?",
                "Would you tell people this is a great team to join?",
                "How likely are you to refer someone for a job here?"
            ],
            "manager_relationship": [
                "Do you feel supported by your manager?",
                "How well does your manager help you succeed?",
                "Do you trust your manager's leadership?",
                "Does your manager listen to your ideas and concerns?",
                "How approachable is your manager when you need help?",
                "Do you feel respected by your manager?",
                "Does your manager provide helpful feedback regularly?",
                "Do you feel your manager values your input?"
            ],
            "peer_collaboration": [
                "How connected do you feel with your teammates?",
                "Do you feel like you belong in your team?",
                "How well do you and your teammates work together?",
                "Do your colleagues support you when needed?",
                "How good is the teamwork in your department?",
                "Do you feel encouraged to collaborate with others?",
                "Do you trust your teammates to deliver quality work?",
                "How strong is the sense of unity in your team?"
            ],
            "recognition": [
                "Do you feel your work is valued here?",
                "How often do you feel appreciated for what you do?",
                "Do you get enough recognition when you do good work?",
                "How recognized do you feel for your contributions?",
                "Does your manager/team acknowledge your efforts regularly?",
                "Do you feel unseen or underappreciated for your work?",
                "How good is the company at celebrating success?",
                "Do you feel your contributions make a difference?"
            ],
            "career_growth": [
                "Do you feel like you are growing and developing at work?",
                "How much progress have you made in your skills lately?",
                "Do you have opportunities to advance in your career here?",
                "Do you feel challenged in a way that helps you grow?",
                "Does your work help you learn new things?",
                "Are you building the skills you want for your career?",
                "Do you have a clear career path here?",
                "How much support do you get for professional growth?"
            ],
            "value_alignment": [
                "Do you feel your values align with the company's values?",
                "How well do you believe in the company's mission?",
                "Do you agree with the direction the company is heading?",
                "Do you feel the company acts in line with its stated values?",
                "Does the company's purpose inspire you?",
                "Do you feel proud to be part of this company?",
                "Do you share the same priorities as the company leadership?",
                "Do you feel connected to the company's goals?"
            ],
            "communication": [
                "How clear is communication within your team?",
                "Do you get the information you need to do your job well?",
                "How openly do people share important updates here?",
                "Do you feel kept in the loop about changes that affect you?",
                "How well does leadership communicate with the team?",
                "Are you comfortable raising concerns openly?",
                "Do you get feedback that helps you improve?",
                "How effective is the flow of information in the company?"
            ],
            "work_environment": [
                "Do you have the tools and equipment you need to do your job well?",
                "How comfortable is your workspace?",
                "Does the company provide a safe work environment?",
                "Do you have the resources you need to be effective?",
                "How well does your work environment help you focus?",
                "Do you feel physically comfortable during your workday?",
                "How satisfied are you with the office setup or remote tools?",
                "Do you have access to the technology you need for your role?"
            ],
            "health_wellness": [
                "How well does the company support your mental health?",
                "Do you feel your physical well-being is looked after here?",
                "How manageable is your workload for maintaining balance?",
                "Does the company care about your health and wellness?",
                "Do you have enough flexibility to manage personal needs?",
                "How much does work negatively affect your well-being?",
                "Do you feel supported during stressful periods?",
                "Does the company encourage healthy work habits?"
            ],
            "engagement": [
                "How motivated are you to give your best at work?",
                "Do you feel excited about your work most days?",
                "How committed are you to helping the company succeed?",
                "Do you put extra effort into your work because you want to?",
                "How connected do you feel to the company's success?",
                "Do you feel energized by your daily tasks?",
                "Are you motivated to contribute beyond your core duties?",
                "How often do you go above and beyond at work?"
            ]
        }
        
        # Create questions
        for category, questions in questions_data.items():
            metric = metrics[category]
            for i, question_text in enumerate(questions):
                # Determine if question is sensitive or reverse scored
                sensitive = category in ["health_wellness", "manager_relationship"]
                reverse_scored = "negative" in question_text.lower() or "unseen" in question_text.lower()
                
                question = QuestionBank(
                    metric_id=metric.id,
                    question_text_en=question_text,
                    variation_order=i,
                    sensitive=sensitive,
                    reverse_scored=reverse_scored
                )
                db.add(question)
        
        db.commit()
        print("✅ Question bank seeded successfully!")
        print(f"Created {len(metrics)} metrics and {sum(len(q) for q in questions_data.values())} questions")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding question bank: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_question_bank()
