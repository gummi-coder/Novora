"""Final System Setup - Default Configurations and Thresholds

Revision ID: final_system_setup
Revises: performance_optimization
Create Date: 2024-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'final_system_setup'
down_revision = 'performance_optimization'
branch_labels = None
depends_on = None

def upgrade():
    # Insert default organization settings
    op.execute("""
        INSERT INTO org_settings (
            org_id, min_n, language, cadence, pii_masking_enabled, 
            safe_fallback_message, created_at, updated_at
        ) VALUES (
            'default', 4, 'en', 'monthly', true, 
            'Not enough responses to show data safely', 
            NOW(), NOW()
        )
        ON CONFLICT (org_id) DO UPDATE SET
            min_n = EXCLUDED.min_n,
            pii_masking_enabled = EXCLUDED.pii_masking_enabled,
            safe_fallback_message = EXCLUDED.safe_fallback_message,
            updated_at = NOW()
    """)
    
    # Insert default alert thresholds
    op.execute("""
        INSERT INTO alert_thresholds (
            org_id, alert_type, threshold_value, severity, enabled, created_at, updated_at
        ) VALUES 
        ('default', 'LOW_SCORE', 6.0, 'high', true, NOW(), NOW()),
        ('default', 'BIG_DROP_ABS', 1.0, 'medium', true, NOW(), NOW()),
        ('default', 'BIG_DROP_REL', 15.0, 'medium', true, NOW(), NOW()),
        ('default', 'ENPS_NEG', 0.0, 'high', true, NOW(), NOW()),
        ('default', 'LOW_PARTICIPATION', 60.0, 'medium', true, NOW(), NOW()),
        ('default', 'PARTICIPATION_DROP', 20.0, 'medium', true, NOW(), NOW()),
        ('default', 'NEG_SENT_SPIKE', 30.0, 'high', true, NOW(), NOW()),
        ('default', 'RECURRING', 3.0, 'high', true, NOW(), NOW())
        ON CONFLICT (org_id, alert_type) DO UPDATE SET
            threshold_value = EXCLUDED.threshold_value,
            severity = EXCLUDED.severity,
            enabled = EXCLUDED.enabled,
            updated_at = NOW()
    """)
    
    # Create default drivers for new organizations
    op.execute("""
        INSERT INTO drivers (id, org_id, key, label, description, created_at, updated_at)
        VALUES 
        (gen_random_uuid(), 'default', 'collaboration', 'Collaboration', 'Team collaboration and communication', NOW(), NOW()),
        (gen_random_uuid(), 'default', 'recognition', 'Recognition', 'Employee recognition and appreciation', NOW(), NOW()),
        (gen_random_uuid(), 'default', 'growth', 'Growth & Development', 'Career growth and learning opportunities', NOW(), NOW()),
        (gen_random_uuid(), 'default', 'work_life_balance', 'Work-Life Balance', 'Balance between work and personal life', NOW(), NOW()),
        (gen_random_uuid(), 'default', 'leadership', 'Leadership', 'Management and leadership effectiveness', NOW(), NOW()),
        (gen_random_uuid(), 'default', 'compensation', 'Compensation', 'Fair pay and benefits', NOW(), NOW()),
        (gen_random_uuid(), 'default', 'culture', 'Company Culture', 'Organizational culture and values', NOW(), NOW()),
        (gen_random_uuid(), 'default', 'resources', 'Resources & Tools', 'Access to necessary tools and resources', NOW(), NOW())
        ON CONFLICT (org_id, key) DO NOTHING
    """)
    
    # Create default questions for each driver
    op.execute("""
        INSERT INTO questions (id, driver_id, text, type, required, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            d.id,
            CASE d.key
                WHEN 'collaboration' THEN 'How would you rate the level of collaboration within your team?'
                WHEN 'recognition' THEN 'How well do you feel recognized for your contributions?'
                WHEN 'growth' THEN 'How satisfied are you with your growth and development opportunities?'
                WHEN 'work_life_balance' THEN 'How would you rate your work-life balance?'
                WHEN 'leadership' THEN 'How effective is your immediate manager?'
                WHEN 'compensation' THEN 'How satisfied are you with your compensation and benefits?'
                WHEN 'culture' THEN 'How well does the company culture align with your values?'
                WHEN 'resources' THEN 'Do you have the tools and resources you need to do your job effectively?'
            END,
            'numeric',
            true,
            NOW(),
            NOW()
        FROM drivers d
        WHERE d.org_id = 'default'
        ON CONFLICT (driver_id, text) DO NOTHING
    """)
    
    # Set up default notification channels (Email only for now)
    op.execute("""
        INSERT INTO notification_channels (
            org_id, channel_type, enabled, config, created_at, updated_at
        ) VALUES (
            'default', 'email', true, 
            '{"smtp_server": null, "smtp_port": 587, "from_email": "surveys@novora.com"}',
            NOW(), NOW()
        )
        ON CONFLICT (org_id, channel_type) DO UPDATE SET
            enabled = EXCLUDED.enabled,
            config = EXCLUDED.config,
            updated_at = NOW()
    """)
    
    # Create indexes for performance
    op.create_index('idx_org_settings_org_id', 'org_settings', ['org_id'])
    op.create_index('idx_alert_thresholds_org_type', 'alert_thresholds', ['org_id', 'alert_type'])
    op.create_index('idx_drivers_org_key', 'drivers', ['org_id', 'key'])
    op.create_index('idx_questions_driver_type', 'questions', ['driver_id', 'type'])
    op.create_index('idx_notification_channels_org_type', 'notification_channels', ['org_id', 'channel_type'])
    
    # Add constraints for data integrity
    op.execute("""
        ALTER TABLE org_settings 
        ADD CONSTRAINT chk_min_n_positive 
        CHECK (min_n > 0)
    """)
    
    op.execute("""
        ALTER TABLE alert_thresholds 
        ADD CONSTRAINT chk_threshold_value_valid 
        CHECK (threshold_value >= 0)
    """)
    
    op.execute("""
        ALTER TABLE drivers 
        ADD CONSTRAINT chk_driver_key_format 
        CHECK (key ~ '^[a-z_]+$')
    """)
    
    # Update table statistics
    op.execute("ANALYZE org_settings")
    op.execute("ANALYZE alert_thresholds")
    op.execute("ANALYZE drivers")
    op.execute("ANALYZE questions")
    op.execute("ANALYZE notification_channels")

def downgrade():
    # Drop constraints
    op.execute("ALTER TABLE org_settings DROP CONSTRAINT IF EXISTS chk_min_n_positive")
    op.execute("ALTER TABLE alert_thresholds DROP CONSTRAINT IF EXISTS chk_threshold_value_valid")
    op.execute("ALTER TABLE drivers DROP CONSTRAINT IF EXISTS chk_driver_key_format")
    
    # Drop indexes
    op.drop_index('idx_notification_channels_org_type', table_name='notification_channels')
    op.drop_index('idx_questions_driver_type', table_name='questions')
    op.drop_index('idx_drivers_org_key', table_name='drivers')
    op.drop_index('idx_alert_thresholds_org_type', table_name='alert_thresholds')
    op.drop_index('idx_org_settings_org_id', table_name='org_settings')
    
    # Remove default data
    op.execute("DELETE FROM notification_channels WHERE org_id = 'default'")
    op.execute("DELETE FROM questions WHERE driver_id IN (SELECT id FROM drivers WHERE org_id = 'default')")
    op.execute("DELETE FROM drivers WHERE org_id = 'default'")
    op.execute("DELETE FROM alert_thresholds WHERE org_id = 'default'")
    op.execute("DELETE FROM org_settings WHERE org_id = 'default'")
