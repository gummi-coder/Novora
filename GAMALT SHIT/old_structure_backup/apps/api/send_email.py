from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
import os

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

def send_survey_email(to_email: str, survey_id: int, token: str):
    message = Mail(
        from_email="surveys@yourcompany.com",
        to_emails=to_email,
        subject="Monthly Employee Well-Being Survey",
        html_content=f"""
        <p>Please complete this month's anonymous survey:</p>
        <a href="http://localhost:8000/surveys/{survey_id}/respond?token={token}">Take the Survey</a>
        <p>This link expires in 7 days.</p>
        """
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Email sent: {response.status_code}")
    except Exception as e:
        print(f"Error sending email: {str(e)}") 