from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.settings import (
    OrgSettings, AlertThresholds, Integration, NotificationPrefs, SurveyDefaults, AuditLog, BillingAccount
)
from app.models.advanced import Role, Permission, RolePermission
from app.models.base import User
from app.schemas.settings import (
    OrgSettingsUpdate, AlertThresholdsUpdate, NotificationPrefsUpdate,
    SurveyDefaultsUpdate, IntegrationUpdate
)

class SettingsService:
    def __init__(self, db: Session):
        self.db = db

    def get_org_id(self, user: User) -> int:
        """Get organization ID for user"""
        # For now, assume org_id is 1 for all users
        # In a real implementation, this would come from user's organization
        return 1

    def log_audit_event(
        self, 
        org_id: int, 
        actor_id: int, 
        action: str, 
        details: Optional[Dict[str, Any]] = None
    ):
        """Log audit event"""
        audit_log = AuditLog(
            org_id=org_id,
            actor_id=actor_id,
            action=action,
            details_json=details
        )
        self.db.add(audit_log)
        self.db.commit()

    def get_org_settings(self, user: User) -> Optional[OrgSettings]:
        """Get organization settings, create defaults if none exist"""
        org_id = self.get_org_id(user)
        settings = self.db.query(OrgSettings).filter(OrgSettings.org_id == org_id).first()
        
        if not settings:
            # Create default settings
            settings = OrgSettings(
                org_id=org_id,
                timezone="UTC",
                locale="en-US",
                branding={"accent_color": "#3B82F6"},
                data_retention_days=365,
                min_n=4,
                pii_filter=True,
                profanity_filter=True
            )
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        
        return settings

    def update_org_settings(self, user: User, settings_update: OrgSettingsUpdate) -> OrgSettings:
        """Update organization settings with validation"""
        org_id = self.get_org_id(user)
        settings = self.get_org_settings(user)
        
        # Validate min_n setting
        if settings_update.min_n is not None:
            if settings_update.min_n < 3:
                raise ValueError("min_n must be at least 3 for anonymity")
            if settings_update.min_n > 10:
                raise ValueError("min_n cannot exceed 10")
        
        # Validate data retention
        if settings_update.data_retention_days is not None:
            if settings_update.data_retention_days < 30:
                raise ValueError("Data retention must be at least 30 days")
            if settings_update.data_retention_days > 2555:  # 7 years
                raise ValueError("Data retention cannot exceed 7 years")
        
        # Update settings
        for field, value in settings_update.dict(exclude_unset=True).items():
            setattr(settings, field, value)
        
        settings.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(settings)
        
        # Log audit event
        self.log_audit_event(
            org_id, user.id, 
            "settings.org.updated", 
            {"updated_fields": list(settings_update.dict(exclude_unset=True).keys())}
        )
        
        return settings

    def get_alert_thresholds(self, user: User) -> Optional[AlertThresholds]:
        """Get alert thresholds, create defaults if none exist"""
        org_id = self.get_org_id(user)
        thresholds = self.db.query(AlertThresholds).filter(AlertThresholds.org_id == org_id).first()
        
        if not thresholds:
            # Create default thresholds
            thresholds = AlertThresholds(
                org_id=org_id,
                score_drop_abs=1.0,
                score_drop_rel_pct=10.0,
                low_score_cutoff=6.0,
                enps_cutoff=50.0,
                participation_cutoff_pct=70.0,
                participation_drop_pct=15.0,
                neg_comment_spike_pct=20.0,
                consecutive_breaches=2,
                ack_sla_hours=24
            )
            self.db.add(thresholds)
            self.db.commit()
            self.db.refresh(thresholds)
        
        return thresholds

    def update_alert_thresholds(self, user: User, thresholds_update: AlertThresholdsUpdate) -> AlertThresholds:
        """Update alert thresholds with validation"""
        org_id = self.get_org_id(user)
        thresholds = self.get_alert_thresholds(user)
        
        # Validate thresholds
        if thresholds_update.score_drop_abs is not None:
            if thresholds_update.score_drop_abs < 0.1 or thresholds_update.score_drop_abs > 10.0:
                raise ValueError("Score drop absolute must be between 0.1 and 10.0")
        
        if thresholds_update.score_drop_rel_pct is not None:
            if thresholds_update.score_drop_rel_pct < 1.0 or thresholds_update.score_drop_rel_pct > 50.0:
                raise ValueError("Score drop relative percentage must be between 1.0 and 50.0")
        
        if thresholds_update.low_score_cutoff is not None:
            if thresholds_update.low_score_cutoff < 1.0 or thresholds_update.low_score_cutoff > 10.0:
                raise ValueError("Low score cutoff must be between 1.0 and 10.0")
        
        if thresholds_update.enps_cutoff is not None:
            if thresholds_update.enps_cutoff < -100.0 or thresholds_update.enps_cutoff > 100.0:
                raise ValueError("eNPS cutoff must be between -100.0 and 100.0")
        
        # Update thresholds
        for field, value in thresholds_update.dict(exclude_unset=True).items():
            setattr(thresholds, field, value)
        
        thresholds.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(thresholds)
        
        # Log audit event
        self.log_audit_event(
            org_id, user.id,
            "settings.alerts.updated",
            {"updated_fields": list(thresholds_update.dict(exclude_unset=True).keys())}
        )
        
        return thresholds

    def get_survey_defaults(self, user: User) -> Optional[SurveyDefaults]:
        """Get survey defaults, create defaults if none exist"""
        org_id = self.get_org_id(user)
        defaults = self.db.query(SurveyDefaults).filter(SurveyDefaults.org_id == org_id).first()
        
        if not defaults:
            # Create default settings
            defaults = SurveyDefaults(
                org_id=org_id,
                cadence_cron="0 9 1 * *",  # Monthly at 9 AM
                language="en",
                drivers_json=["leadership", "communication", "recognition"],
                reminders_json={"count": 2, "spacing_hours": 48}
            )
            self.db.add(defaults)
            self.db.commit()
            self.db.refresh(defaults)
        
        return defaults

    def update_survey_defaults(self, user: User, defaults_update: SurveyDefaultsUpdate) -> SurveyDefaults:
        """Update survey defaults"""
        org_id = self.get_org_id(user)
        defaults = self.get_survey_defaults(user)
        
        # Update defaults
        for field, value in defaults_update.dict(exclude_unset=True).items():
            setattr(defaults, field, value)
        
        defaults.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(defaults)
        
        # Log audit event
        self.log_audit_event(
            org_id, user.id,
            "settings.survey_defaults.updated",
            {"updated_fields": list(defaults_update.dict(exclude_unset=True).keys())}
        )
        
        return defaults

    def get_notification_prefs(self, user: User) -> Optional[NotificationPrefs]:
        """Get notification preferences, create defaults if none exist"""
        org_id = self.get_org_id(user)
        prefs = self.db.query(NotificationPrefs).filter(NotificationPrefs.org_id == org_id).first()
        
        if not prefs:
            # Create default preferences
            prefs = NotificationPrefs(
                org_id=org_id,
                digest_cadence="weekly",
                realtime_alerts=True,
                quiet_hours={"start": "18:00", "end": "08:00", "timezone": "UTC"}
            )
            self.db.add(prefs)
            self.db.commit()
            self.db.refresh(prefs)
        
        return prefs

    def update_notification_prefs(self, user: User, prefs_update: NotificationPrefsUpdate) -> NotificationPrefs:
        """Update notification preferences"""
        org_id = self.get_org_id(user)
        prefs = self.get_notification_prefs(user)
        
        # Update preferences
        for field, value in prefs_update.dict(exclude_unset=True).items():
            setattr(prefs, field, value)
        
        prefs.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(prefs)
        
        # Log audit event
        self.log_audit_event(
            org_id, user.id,
            "settings.notifications.updated",
            {"updated_fields": list(prefs_update.dict(exclude_unset=True).keys())}
        )
        
        return prefs

    def get_integrations(self, user: User) -> List[Integration]:
        """Get all integrations for organization"""
        org_id = self.get_org_id(user)
        return self.db.query(Integration).filter(Integration.org_id == org_id).all()

    def get_integration(self, user: User, integration_type: str) -> Optional[Integration]:
        """Get specific integration"""
        org_id = self.get_org_id(user)
        return self.db.query(Integration).filter(
            Integration.org_id == org_id, 
            Integration.type == integration_type
        ).first()

    def update_integration(self, user: User, integration_type: str, integration_update: IntegrationUpdate) -> Integration:
        """Update integration"""
        org_id = self.get_org_id(user)
        integration = self.get_integration(user, integration_type)
        
        if not integration:
            raise ValueError("Integration not found")
        
        # Update integration
        for field, value in integration_update.dict(exclude_unset=True).items():
            setattr(integration, field, value)
        
        integration.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(integration)
        
        # Log audit event
        self.log_audit_event(
            org_id, user.id,
            "settings.integration.updated",
            {"integration_type": integration_type, "updated_fields": list(integration_update.dict(exclude_unset=True).keys())}
        )
        
        return integration

    def get_roles(self, user: User) -> List[Role]:
        """Get all roles for organization"""
        org_id = self.get_org_id(user)
        return self.db.query(Role).filter(Role.org_id == org_id).all()

    def get_permissions(self) -> List[Permission]:
        """Get all available permissions"""
        return self.db.query(Permission).all()

    def get_user_permissions(self, user: User) -> List[str]:
        """Get permissions for current user"""
        # This is a simplified implementation
        # In a real system, you'd check user's role and get permissions from role_permissions table
        if user.role == "admin":
            return ["settings.read", "settings.write", "surveys.create", "surveys.read", "surveys.update", "surveys.delete", "responses.read", "analytics.read", "admin.access"]
        elif user.role == "manager":
            return ["settings.read", "surveys.create", "surveys.read", "surveys.update", "responses.read", "analytics.read"]
        else:
            return ["surveys.read", "responses.read", "analytics.read"]

    def check_permission(self, user: User, permission: str) -> bool:
        """Check if user has specific permission"""
        user_permissions = self.get_user_permissions(user)
        return permission in user_permissions

    def get_audit_log(self, user: User, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        """Get paginated audit log"""
        org_id = self.get_org_id(user)
        return self.db.query(AuditLog).filter(
            AuditLog.org_id == org_id
        ).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    def get_billing_account(self, user: User) -> Optional[BillingAccount]:
        """Get billing account, create default if none exists"""
        org_id = self.get_org_id(user)
        billing = self.db.query(BillingAccount).filter(BillingAccount.org_id == org_id).first()
        
        if not billing:
            # Create default billing account
            billing = BillingAccount(
                org_id=org_id,
                plan="basic",
                seats=10,
                renewal_at=datetime.utcnow() + timedelta(days=30)
            )
            self.db.add(billing)
            self.db.commit()
            self.db.refresh(billing)
        
        return billing

    def reset_to_defaults(self, user: User, section: str) -> Dict[str, Any]:
        """Reset specific section to defaults"""
        org_id = self.get_org_id(user)
        
        if section == "org":
            settings = self.get_org_settings(user)
            settings.timezone = "UTC"
            settings.locale = "en-US"
            settings.branding = {"accent_color": "#3B82F6"}
            settings.data_retention_days = 365
            settings.min_n = 4
            settings.pii_filter = True
            settings.profanity_filter = True
            settings.updated_at = datetime.utcnow()
            
        elif section == "alerts":
            thresholds = self.get_alert_thresholds(user)
            thresholds.score_drop_abs = 1.0
            thresholds.score_drop_rel_pct = 10.0
            thresholds.low_score_cutoff = 6.0
            thresholds.enps_cutoff = 50.0
            thresholds.participation_cutoff_pct = 70.0
            thresholds.participation_drop_pct = 15.0
            thresholds.neg_comment_spike_pct = 20.0
            thresholds.consecutive_breaches = 2
            thresholds.ack_sla_hours = 24
            thresholds.updated_at = datetime.utcnow()
            
        elif section == "survey_defaults":
            defaults = self.get_survey_defaults(user)
            defaults.cadence_cron = "0 9 1 * *"
            defaults.language = "en"
            defaults.drivers_json = ["leadership", "communication", "recognition"]
            defaults.reminders_json = {"count": 2, "spacing_hours": 48}
            defaults.updated_at = datetime.utcnow()
            
        elif section == "notifications":
            prefs = self.get_notification_prefs(user)
            prefs.digest_cadence = "weekly"
            prefs.realtime_alerts = True
            prefs.quiet_hours = {"start": "18:00", "end": "08:00", "timezone": "UTC"}
            prefs.updated_at = datetime.utcnow()
            
        else:
            raise ValueError(f"Unknown section: {section}")
        
        self.db.commit()
        
        # Log audit event
        self.log_audit_event(
            org_id, user.id,
            f"settings.{section}.reset_to_defaults",
            {"section": section}
        )
        
        return {"message": f"{section} settings reset to defaults"}
