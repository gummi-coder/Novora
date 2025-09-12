"""
Email service for notifications and verification
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional
from pathlib import Path
import os

from app.core.config import settings

class EmailService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        
    def is_configured(self) -> bool:
        """Check if email is properly configured"""
        return all([
            self.smtp_server,
            self.smtp_username,
            self.smtp_password
        ])
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachments: Optional[List[Path]] = None
    ) -> bool:
        """Send an email"""
        if not self.is_configured():
            print(f"Email not configured. Would send to {to_email}: {subject}")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.smtp_username
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add text content
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Add attachments
            if attachments:
                for attachment_path in attachments:
                    if attachment_path.exists():
                        with open(attachment_path, "rb") as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                        
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename= {attachment_path.name}'
                        )
                        msg.attach(part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_verification_email(self, to_email: str, token: str, user_name: str) -> bool:
        """Send email verification email"""
        subject = "Verify your Novora account"
        
        verification_url = f"http://localhost:3000/verify-email?token={token}"
        
        html_content = f"""
        <html>
        <body>
            <h2>Welcome to Novora!</h2>
            <p>Hi {user_name},</p>
            <p>Thank you for registering with Novora Survey Platform. Please verify your email address by clicking the link below:</p>
            <p><a href="{verification_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{verification_url}</p>
            <p>This link will expire in 24 hours.</p>
            <p>Best regards,<br>The Novora Team</p>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to Novora!
        
        Hi {user_name},
        
        Thank you for registering with Novora Survey Platform. Please verify your email address by visiting:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        Best regards,
        The Novora Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_password_reset_email(self, to_email: str, token: str, user_name: str) -> bool:
        """Send password reset email"""
        subject = "Reset your Novora password"
        
        reset_url = f"http://localhost:3000/reset-password?token={token}"
        
        html_content = f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>Hi {user_name},</p>
            <p>We received a request to reset your password. Click the link below to create a new password:</p>
            <p><a href="{reset_url}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{reset_url}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The Novora Team</p>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        Hi {user_name},
        
        We received a request to reset your password. Visit this link to create a new password:
        
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The Novora Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_survey_notification(self, to_email: str, survey_title: str, survey_url: str, user_name: str) -> bool:
        """Send survey notification email"""
        subject = f"New Survey: {survey_title}"
        
        html_content = f"""
        <html>
        <body>
            <h2>New Survey Available</h2>
            <p>Hi {user_name},</p>
            <p>A new survey has been created: <strong>{survey_title}</strong></p>
            <p>Click the link below to view and respond to the survey:</p>
            <p><a href="{survey_url}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Take Survey</a></p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{survey_url}</p>
            <p>Thank you for your participation!</p>
            <p>Best regards,<br>The Novora Team</p>
        </body>
        </html>
        """
        
        text_content = f"""
        New Survey Available
        
        Hi {user_name},
        
        A new survey has been created: {survey_title}
        
        Click this link to view and respond to the survey:
        {survey_url}
        
        Thank you for your participation!
        
        Best regards,
        The Novora Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_survey_reminder(self, to_email: str, survey_title: str, survey_url: str, user_name: str) -> bool:
        """Send survey reminder email"""
        subject = f"Reminder: Complete Survey - {survey_title}"
        
        html_content = f"""
        <html>
        <body>
            <h2>Survey Reminder</h2>
            <p>Hi {user_name},</p>
            <p>This is a friendly reminder to complete the survey: <strong>{survey_title}</strong></p>
            <p>Click the link below to complete the survey:</p>
            <p><a href="{survey_url}" style="background-color: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Survey</a></p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{survey_url}</p>
            <p>Your feedback is important to us!</p>
            <p>Best regards,<br>The Novora Team</p>
        </body>
        </html>
        """
        
        text_content = f"""
        Survey Reminder
        
        Hi {user_name},
        
        This is a friendly reminder to complete the survey: {survey_title}
        
        Click this link to complete the survey:
        {survey_url}
        
        Your feedback is important to us!
        
        Best regards,
        The Novora Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)

# Create global email service instance
email_service = EmailService() 