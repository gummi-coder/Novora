import random
import sys
import os
from datetime import datetime, timedelta

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal
from app.models.base import User, Survey, Response
from app.models.advanced import Department, Team

def seed_orgs_employees(session, org_count=3):
    # Create company owners first
    owners = []
    for i in range(org_count):
        owner = User(
            email=f"owner{i+1}@acme{i+1}.test", 
            role="owner", 
            company_name=f"Acme {i+1}",
            password_hash="hashed_password_123"  # In real app, this would be properly hashed
        )
        session.add(owner)
        owners.append(owner)
    session.flush()
    
    # Create departments for each company
    departments = []
    for owner in owners:
        dept_names = ['Engineering', 'Design', 'Sales', 'Operations', 'Support']
        for dept_name in dept_names:
            dept = Department(
                name=dept_name,
                company_id=owner.id,
                level=1
            )
            session.add(dept)
            departments.append(dept)
    session.flush()
    
    # Create teams within departments
    teams = []
    for dept in departments:
        team_count = random.randint(2, 4)
        for t in range(team_count):
            team = Team(
                name=f"{dept.name} Team {t+1}",
                department_id=dept.id
            )
            session.add(team)
            teams.append(team)
    session.flush()
    
    # Create employees
    for owner in owners:
        # Create admin user
        admin = User(
            email=f"admin@{owner.company_name.lower().replace(' ', '')}.test",
            role="admin",
            company_name=owner.company_name,
            password_hash="hashed_password_123"
        )
        session.add(admin)
        
        # Create regular employees
        for n in range(random.randint(20, 60)):
            employee = User(
                email=f"emp{n}@{owner.company_name.lower().replace(' ', '')}.test",
                role="employee",
                company_name=owner.company_name,
                password_hash="hashed_password_123"
            )
            session.add(employee)
    
    session.commit()
    return owners

def seed_surveys_and_responses(session, owners):
    base_date = datetime(2025, 4, 1)
    for owner in owners:
        for m in range(5):
            sent_at = base_date + timedelta(days=30*m)
            survey = Survey(
                title=f"Monthly Pulse {sent_at:%Y-%m}", 
                creator_id=owner.id,
                status='active',
                start_date=sent_at,
                end_date=sent_at + timedelta(days=7)
            )
            session.add(survey)
            session.flush()
            mean = 7.8 - (m*0.3)
            generate_responses(session, owner.id, survey.id, mean)
    session.commit()

def generate_responses(session, owner_id, survey_id, mean_score):
    employees = session.query(User).filter(User.company_name == session.query(User.company_name).filter(User.id == owner_id).scalar()).filter(User.role == 'employee').all()
    
    # Create a simple question for the survey
    from app.models.base import Question
    question = Question(
        survey_id=survey_id,
        text="How satisfied are you with your work environment?",
        type="rating",
        required=True,
        order=1,
        options={"min": 1, "max": 10, "labels": {"1": "Very Dissatisfied", "10": "Very Satisfied"}}
    )
    session.add(question)
    session.flush()
    
    for employee in employees:
        if random.random() > random.uniform(0.15, 0.30):
            score = max(1, min(10, int(random.gauss(mean_score, 1.2))))
            
            # Create response
            response = Response(
                survey_id=survey_id,
                user_id=employee.id,
                submitted_at=datetime.now(),
                completed=True
            )
            session.add(response)
            session.flush()
            
            # Create answer
            from app.models.base import Answer
            comment = random.choice([None, "Good momentum", "Too many meetings", "Need better tooling", "Manager support improved", "Workload is heavy this sprint"])
            answer = Answer(
                response_id=response.id,
                question_id=question.id,
                value=str(score),
                comment=comment
            )
            session.add(answer)

def main():
    session = SessionLocal()
    try:
        orgs = seed_orgs_employees(session)
        seed_surveys_and_responses(session, orgs)
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    main()
