import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.core.database import get_db
from app.models.advanced import AutoPilotPlan, AutoPilotSurvey, QuestionBank
from app.models.base import Question
from app.models.base import Survey, User
from app.core.email import EmailService
from app.utils.helpers import generate_survey_token

logger = logging.getLogger(__name__)

class AutoPilotScheduler:
    def __init__(self):
        self.email_service = EmailService()
        self.running = False
        self.task = None

    async def start(self):
        """Start the auto-pilot scheduler"""
        if self.running:
            logger.warning("Auto-pilot scheduler is already running")
            return
        
        self.running = True
        self.task = asyncio.create_task(self._scheduler_loop())
        logger.info("Auto-pilot scheduler started")

    async def stop(self):
        """Stop the auto-pilot scheduler"""
        if not self.running:
            return
        
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("Auto-pilot scheduler stopped")

    async def _scheduler_loop(self):
        """Main scheduler loop"""
        while self.running:
            try:
                await self._process_scheduled_surveys()
                await self._process_reminders()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                await asyncio.sleep(60)

    async def _process_scheduled_surveys(self):
        """Process surveys that need to be sent"""
        db = next(get_db())
        try:
            # Get active plans
            active_plans = db.query(AutoPilotPlan).filter(
                AutoPilotPlan.is_active == True
            ).all()

            for plan in active_plans:
                await self._process_plan_surveys(db, plan)
        except Exception as e:
            logger.error(f"Error processing scheduled surveys: {e}")
        finally:
            db.close()

    async def _process_plan_surveys(self, db: Session, plan: AutoPilotPlan):
        """Process surveys for a specific plan"""
        try:
            # Check if plan has ended
            if plan.end_date and datetime.now() > plan.end_date:
                logger.info(f"Plan {plan.id} has ended, deactivating")
                plan.is_active = False
                db.commit()
                return

            # Check if plan should start
            if datetime.now() < plan.start_date:
                return

            # Get the next survey date
            next_survey_date = self._calculate_next_survey_date(plan)
            
            # Check if it's time to send a survey
            if datetime.now() >= next_survey_date:
                await self._send_scheduled_survey(db, plan)

        except Exception as e:
            logger.error(f"Error processing plan {plan.id}: {e}")

    async def _send_scheduled_survey(self, db: Session, plan: AutoPilotPlan):
        """Send a scheduled survey for a plan"""
        try:
            # Create the survey
            survey = await self._create_survey_from_plan(db, plan)
            
            # Send the survey
            await self._send_survey(db, survey, plan)
            
            # Update plan's last survey date
            plan.last_survey_date = datetime.now()
            db.commit()
            
            logger.info(f"Sent scheduled survey {survey.id} for plan {plan.id}")

        except Exception as e:
            logger.error(f"Error sending scheduled survey for plan {plan.id}: {e}")

    async def _create_survey_from_plan(self, db: Session, plan: AutoPilotPlan) -> Survey:
        """Create a survey from an auto-pilot plan"""
        # Get question set
        question_set = db.query(QuestionBank).filter(
            QuestionBank.id == plan.question_set_id
        ).first()

        if not question_set:
            raise ValueError(f"Question set {plan.question_set_id} not found")

        # Rotate questions if enabled
        if plan.question_rotation:
            questions = self._rotate_questions(db, question_set.questions)
        else:
            questions = question_set.questions

        # Create survey
        survey = Survey(
            title=f"{plan.name} - {datetime.now().strftime('%Y-%m-%d')}",
            description=plan.description,
            company_id=plan.company_id,
            created_by=plan.created_by,
            is_anonymous=plan.is_anonymous,
            status="active"
        )
        db.add(survey)
        db.commit()
        db.refresh(survey)

        # Add questions to survey
        for i, question in enumerate(questions):
            survey_question = Question(
                survey_id=survey.id,
                text=question.text,
                question_type="rating",
                order=i,
                required=True
            )
            db.add(survey_question)

        db.commit()
        return survey

    def _rotate_questions(self, db: Session, questions: List[Question]) -> List[Question]:
        """Rotate question variations"""
        rotated_questions = []
        
        for question in questions:
            # Get question variations
            variations = self._get_question_variations(question)
            
            # Rotate to next variation
            current_variation = question.current_variation or 0
            next_variation = (current_variation + 1) % len(variations)
            
            # Update question with new variation
            question.text = variations[next_variation]
            question.current_variation = next_variation
            
            rotated_questions.append(question)
        
        db.commit()
        return rotated_questions

    def _get_question_variations(self, question: Question) -> List[str]:
        """Get question variations based on category"""
        if question.variations:
            return question.variations.split('|')
        
        # Default variations based on category
        variations_map = {
            'satisfaction': [
                "How satisfied are you with your current role?",
                "Overall, how satisfied are you with your job right now?",
                "How positive is your daily experience at work?",
                "Do you feel good about coming to work each day?",
                "How content are you with your current responsibilities?"
            ],
            'enps': [
                "How likely are you to recommend working here to a friend?",
                "Would you tell a friend this is a good place to work?",
                "How likely are you to encourage others to join this company?",
                "If a friend was job-hunting, would you suggest they apply here?",
                "Would you speak positively about working here to others?"
            ],
            'manager': [
                "Do you feel supported by your manager?",
                "How well does your manager help you succeed?",
                "Do you trust your manager's leadership?",
                "Does your manager listen to your ideas and concerns?",
                "How approachable is your manager when you need help?"
            ],
            'collaboration': [
                "How connected do you feel with your teammates?",
                "Do you feel like you belong in your team?",
                "How well do you and your teammates work together?",
                "Do your colleagues support you when needed?",
                "How good is the teamwork in your department?"
            ]
        }
        
        return variations_map.get(question.category, [question.text])

    async def _send_survey(self, db: Session, survey: Survey, plan: AutoPilotPlan):
        """Send survey to target audience"""
        try:
            # Get target audience
            target_users = self._get_target_audience(db, plan)
            
            # Send via different channels
            for channel in plan.distribution_channels:
                if channel == "email":
                    await self._send_survey_email(db, survey, target_users, plan)
                elif channel == "link":
                    await self._send_survey_link(db, survey, target_users, plan)
                elif channel == "qr":
                    await self._send_survey_qr(db, survey, target_users, plan)

        except Exception as e:
            logger.error(f"Error sending survey {survey.id}: {e}")

    def _get_target_audience(self, db: Session, plan: AutoPilotPlan) -> List[User]:
        """Get target audience for the plan"""
        if "all_employees" in plan.target_audience:
            return db.query(User).filter(
                User.company_id == plan.company_id,
                User.is_active == True
            ).all()
        elif "managers" in plan.target_audience:
            return db.query(User).filter(
                User.company_id == plan.company_id,
                User.is_active == True,
                User.role == "manager"
            ).all()
        else:
            # Custom audience logic
            return []

    async def _send_survey_email(self, db: Session, survey: Survey, users: List[User], plan: AutoPilotPlan):
        """Send survey via email"""
        survey_link = f"http://localhost:3000/survey/{survey.id}"
        
        for user in users:
            try:
                await self.email_service.send_survey_email(
                    to_email=user.email,
                    survey_title=survey.title,
                    survey_link=survey_link,
                    user_name=user.first_name,
                    company_name=user.company.name if user.company else "Your Company"
                )
            except Exception as e:
                logger.error(f"Error sending email to {user.email}: {e}")

    async def _send_survey_link(self, db: Session, survey: Survey, users: List[User], plan: AutoPilotPlan):
        """Send survey via direct link"""
        # This would typically involve posting to Slack, Teams, etc.
        survey_link = f"http://localhost:3000/survey/{survey.id}"
        logger.info(f"Survey link generated: {survey_link}")

    async def _send_survey_qr(self, db: Session, survey: Survey, users: List[User], plan: AutoPilotPlan):
        """Send survey via QR code"""
        # This would typically involve generating QR codes and posting them
        survey_link = f"http://localhost:3000/survey/{survey.id}"
        logger.info(f"QR code generated for: {survey_link}")

    async def _process_reminders(self):
        """Process reminders for surveys"""
        db = next(get_db())
        try:
            # Get surveys that need reminders
            surveys_needing_reminders = db.query(AutoPilotSurvey).filter(
                and_(
                    AutoPilotSurvey.status == "sent",
                    AutoPilotSurvey.response_count < AutoPilotSurvey.target_count * 0.8
                )
            ).all()

            for survey in surveys_needing_reminders:
                await self._process_survey_reminder(db, survey)
                await self._check_survey_closure(db, survey)

        except Exception as e:
            logger.error(f"Error processing reminders: {e}")
        finally:
            db.close()

    async def _process_survey_reminder(self, db: Session, survey: AutoPilotSurvey):
        """Process reminder for a specific survey"""
        try:
            plan = db.query(AutoPilotPlan).filter(
                AutoPilotPlan.id == survey.plan_id
            ).first()

            if not plan or not plan.reminder_settings.enabled:
                return

            # Get reminder days from plan settings
            reminder_days = plan.reminder_settings.get('reminderDays', [3, 7])
            
            # Calculate days since survey was sent
            survey_date = survey.sent_date
            if not survey_date:
                return
                
            days_since_sent = (datetime.now() - survey_date).days
            
            # Check if it's time to send a reminder
            if days_since_sent in reminder_days:
                # Check if we haven't already sent this reminder
                reminder_index = reminder_days.index(days_since_sent)
                if survey.reminder_count <= reminder_index:
                    await self._send_reminder(db, survey, plan, days_since_sent)

        except Exception as e:
            logger.error(f"Error processing reminder for survey {survey.id}: {e}")

    async def _send_reminder(self, db: Session, survey: AutoPilotSurvey, plan: AutoPilotPlan, reminder_day: int):
        """Send a reminder for a survey"""
        try:
            # Get users who haven't responded
            responded_users = self._get_responded_users(db, survey)
            all_users = self._get_target_audience(db, plan)
            non_responded_users = [u for u in all_users if u.id not in responded_users]

            if not non_responded_users:
                return

            # Customize message based on reminder day
            base_message = plan.reminder_settings.get('messageTemplate', '')
            if reminder_day == 3:
                message = f"{base_message}\n\nThis is your first reminder - we'd love to hear from you!"
            elif reminder_day == 7:
                message = f"{base_message}\n\nThis is your final reminder - the survey will close soon!"
            elif reminder_day == 10:
                message = f"{base_message}\n\nThis is your extended reminder - the survey will close in a few days!"
            else:
                message = base_message

            # Send reminder emails
            survey_link = f"http://localhost:3000/survey/{survey.survey_id}"
            
            for user in non_responded_users:
                try:
                    await self.email_service.send_reminder_email(
                        to_email=user.email,
                        survey_title=survey.title,
                        survey_link=survey_link,
                        user_name=user.first_name,
                        reminder_message=message
                    )
                except Exception as e:
                    logger.error(f"Error sending reminder to {user.email}: {e}")

            # Update survey reminder count
            survey.reminder_count += 1
            survey.last_reminder_date = datetime.now()
            db.commit()

            logger.info(f"Sent Day {reminder_day} reminder for survey {survey.id}")

        except Exception as e:
            logger.error(f"Error sending reminder for survey {survey.id}: {e}")

    def _get_responded_users(self, db: Session, survey: AutoPilotSurvey) -> List[int]:
        """Get list of user IDs who have responded to the survey"""
        from app.models.base import Response
        
        responses = db.query(Response).filter(
            Response.survey_id == survey.survey_id
        ).all()
        
        return [r.user_id for r in responses if r.user_id]

    def _calculate_next_survey_date(self, plan: AutoPilotPlan) -> datetime:
        """Calculate the next survey date for a plan"""
        base_date = plan.last_survey_date or plan.start_date
        
        if plan.frequency == "daily":
            return base_date + timedelta(days=1)
        elif plan.frequency == "weekly":
            return base_date + timedelta(weeks=1)
        elif plan.frequency == "biweekly":
            return base_date + timedelta(weeks=2)
        elif plan.frequency == "monthly":
            return base_date + timedelta(days=30)
        elif plan.frequency == "quarterly":
            return base_date + timedelta(days=90)
        else:
            return base_date + timedelta(weeks=1)

    def _calculate_reminder_date(self, base_date: datetime, delay_days: int) -> datetime:
        """Calculate the next reminder date"""
        return base_date + timedelta(days=delay_days)

    async def _check_survey_closure(self, db: Session, survey: AutoPilotSurvey):
        """Check if survey should be closed"""
        try:
            plan = db.query(AutoPilotPlan).filter(
                AutoPilotPlan.id == survey.plan_id
            ).first()

            if not plan or not plan.reminder_settings.enabled:
                return

            # Get auto-close days from plan settings
            auto_close_days = plan.reminder_settings.get('autoCloseAfterDays', 10)
            
            # Calculate days since survey was sent
            survey_date = survey.sent_date
            if not survey_date:
                return
                
            days_since_sent = (datetime.now() - survey_date).days
            
            # Check if it's time to close the survey
            if days_since_sent >= auto_close_days and survey.status == "sent":
                await self._close_survey(db, survey)
                
        except Exception as e:
            logger.error(f"Error checking survey closure for survey {survey.id}: {e}")

    async def _close_survey(self, db: Session, survey: AutoPilotSurvey):
        """Close a survey"""
        try:
            # Update survey status
            survey.status = "completed"
            survey.closed_at = datetime.now()
            
            # Also close the actual survey in the base survey table
            base_survey = db.query(Survey).filter(Survey.id == survey.survey_id).first()
            if base_survey:
                base_survey.status = "closed"
                base_survey.closed_at = datetime.now()
            
            db.commit()
            
            logger.info(f"Auto-closed survey {survey.id} after {survey.auto_close_days} days")
            
        except Exception as e:
            logger.error(f"Error closing survey {survey.id}: {e}")

    async def manual_trigger_survey(self, plan_id: int):
        """Manually trigger a survey for a plan"""
        db = next(get_db())
        try:
            plan = db.query(AutoPilotPlan).filter(
                AutoPilotPlan.id == plan_id
            ).first()

            if not plan:
                raise ValueError(f"Plan {plan_id} not found")

            await self._send_scheduled_survey(db, plan)
            logger.info(f"Manually triggered survey for plan {plan_id}")

        except Exception as e:
            logger.error(f"Error manually triggering survey for plan {plan_id}: {e}")
        finally:
            db.close()

    async def manual_trigger_reminder(self, survey_id: int):
        """Manually trigger a reminder for a survey"""
        db = next(get_db())
        try:
            survey = db.query(AutoPilotSurvey).filter(
                AutoPilotSurvey.id == survey_id
            ).first()

            if not survey:
                raise ValueError(f"Survey {survey_id} not found")

            plan = db.query(AutoPilotPlan).filter(
                AutoPilotPlan.id == survey.plan_id
            ).first()

            if plan:
                await self._send_reminder(db, survey, plan)
                logger.info(f"Manually triggered reminder for survey {survey_id}")

        except Exception as e:
            logger.error(f"Error manually triggering reminder for survey {survey_id}: {e}")
        finally:
            db.close()

# Global scheduler instance
auto_pilot_scheduler = AutoPilotScheduler()
