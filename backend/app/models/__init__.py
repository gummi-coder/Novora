# Import all models to ensure they are registered with SQLAlchemy
from .base import (
    User,
    EmailVerificationToken,
    PasswordResetToken,
    UserSession,
    Survey,
    Question,
    SurveyTemplate,
    Response,
    Answer,
    FileAttachment
)

from .advanced import (
    Department,
    Team,
    UserDepartment,
    UserTeam,
    AnonymousComment,
    CommentAction,
    SurveyBranching,
    Permission,
    Role,
    RolePermission,
    UserRole,
    BrandingConfig,
    SSOConfig,
    APIKey,
    Webhook,
    SurveySchedule,
    DashboardAlert,
    TeamAnalytics,
    Metric,
    QuestionBank,
    AutoPilotPlan,
    AutoPilotSurvey
)

__all__ = [
    # Base models
    "User",
    "EmailVerificationToken", 
    "PasswordResetToken",
    "UserSession",
    "Survey",
    "Question",
    "SurveyTemplate",
    "Response",
    "Answer",
    "FileAttachment",
    
    # Advanced models
    "Department",
    "Team",
    "UserDepartment",
    "UserTeam",
    "AnonymousComment",
    "CommentAction",
    "SurveyBranching",
    "Permission",
    "Role",
    "RolePermission",
    "UserRole",
    "BrandingConfig",
    "SSOConfig",
    "APIKey",
    "Webhook",
    "SurveySchedule",
    "DashboardAlert",
    "TeamAnalytics",
    "Metric",
    "QuestionBank",
    "AutoPilotPlan",
    "AutoPilotSurvey"
]
