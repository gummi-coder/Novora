import asyncio
import random
from datetime import datetime, timedelta
from app.core.database import async_session_maker
from app.models.user import User
from app.models.survey import Survey
from app.models.response import Response
from app.models.base import Org, Employee

async def seed_orgs_employees(session, org_count=3):
    orgs = []
    for i in range(org_count):
        org = Org(name=f"Acme {i+1}", domain=f"acme{i+1}.test")
        session.add(org)
        orgs.append(org)
    await session.flush()
    for org in orgs:
        session.add_all([
            User(email=f"owner@{org.domain}", role="owner", org_id=org.id),
            User(email=f"hr@{org.domain}", role="admin", org_id=org.id)
        ])
        for n in range(random.randint(20, 60)):
            session.add(Employee(org_id=org.id, email=f"emp{n}@{org.domain}", department=random.choice(['Engineering','Design','Sales','Ops','Support'])))
    await session.commit()
    return orgs

async def seed_surveys_and_responses(session, orgs):
    base_date = datetime(2025, 4, 1)
    for org in orgs:
        for m in range(5):
            sent_at = base_date + timedelta(days=30*m)
            survey = Survey(org_id=org.id, title=f"Monthly Pulse {sent_at:%Y-%m}", sent_at=sent_at)
            session.add(survey)
            await session.flush()
            mean = 7.8 - (m*0.3)
            await generate_responses(session, org.id, survey.id, mean)
    await session.commit()

async def generate_responses(session, org_id, survey_id, mean_score):
    employees = (await session.execute(Employee.__table__.select().where(Employee.org_id==org_id))).fetchall()
    for row in employees:
        if random.random() > random.uniform(0.15, 0.30):
            score = max(0, min(10, random.gauss(mean_score, 1.2)))
            session.add(Response(org_id=org_id, survey_id=survey_id, score=round(score,1), comment=random.choice([None, "Good momentum", "Too many meetings", "Need better tooling", "Manager support improved", "Workload is heavy this sprint"])))

async def main():
    async with async_session_maker() as session:
        orgs = await seed_orgs_employees(session)
        await seed_surveys_and_responses(session, orgs)

if __name__ == "__main__":
    asyncio.run(main())
