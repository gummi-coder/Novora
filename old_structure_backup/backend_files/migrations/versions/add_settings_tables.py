"""Add Settings tables

Revision ID: add_settings_tables
Revises: 4fc9be1678c6
Create Date: 2024-08-08 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_settings_tables'
down_revision = '4fc9be1678c6'
branch_labels = None
depends_on = None


def upgrade():
    # Create org_settings table
    op.create_table('org_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('timezone', sa.String(length=50), nullable=True),
        sa.Column('locale', sa.String(length=10), nullable=True),
        sa.Column('branding', sa.JSON(), nullable=True),
        sa.Column('data_retention_days', sa.Integer(), nullable=True),
        sa.Column('min_n', sa.Integer(), nullable=True),
        sa.Column('pii_filter', sa.Boolean(), nullable=True),
        sa.Column('profanity_filter', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_org_settings_org_id'), 'org_settings', ['org_id'], unique=False)

    # Create alert_thresholds table
    op.create_table('alert_thresholds',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('score_drop_abs', sa.Float(), nullable=True),
        sa.Column('score_drop_rel_pct', sa.Float(), nullable=True),
        sa.Column('low_score_cutoff', sa.Float(), nullable=True),
        sa.Column('enps_cutoff', sa.Float(), nullable=True),
        sa.Column('participation_cutoff_pct', sa.Float(), nullable=True),
        sa.Column('participation_drop_pct', sa.Float(), nullable=True),
        sa.Column('neg_comment_spike_pct', sa.Float(), nullable=True),
        sa.Column('consecutive_breaches', sa.Integer(), nullable=True),
        sa.Column('ack_sla_hours', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alert_thresholds_org_id'), 'alert_thresholds', ['org_id'], unique=False)

    # Create permissions table
    op.create_table('permissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key')
    )

    # Create roles table
    op.create_table('roles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('is_system', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roles_org_id'), 'roles', ['org_id'], unique=False)

    # Create role_permissions table
    op.create_table('role_permissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create integrations table
    op.create_table('integrations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('config_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_integrations_org_id'), 'integrations', ['org_id'], unique=False)

    # Create notification_prefs table
    op.create_table('notification_prefs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('digest_cadence', sa.String(length=20), nullable=True),
        sa.Column('realtime_alerts', sa.Boolean(), nullable=True),
        sa.Column('quiet_hours', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notification_prefs_org_id'), 'notification_prefs', ['org_id'], unique=False)

    # Create survey_defaults table
    op.create_table('survey_defaults',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('cadence_cron', sa.String(length=100), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=True),
        sa.Column('drivers_json', sa.JSON(), nullable=True),
        sa.Column('reminders_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_survey_defaults_org_id'), 'survey_defaults', ['org_id'], unique=False)

    # Create audit_log table
    op.create_table('audit_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('details_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_log_org_id'), 'audit_log', ['org_id'], unique=False)

    # Create billing_accounts table
    op.create_table('billing_accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('plan', sa.String(length=50), nullable=True),
        sa.Column('seats', sa.Integer(), nullable=True),
        sa.Column('renewal_at', sa.DateTime(), nullable=True),
        sa.Column('invoice_provider_id', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_billing_accounts_org_id'), 'billing_accounts', ['org_id'], unique=False)

    # Insert default permissions
    op.execute("""
        INSERT INTO permissions (key, description, created_at) VALUES
        ('settings.read', 'Read settings', NOW()),
        ('settings.write', 'Write settings', NOW()),
        ('surveys.create', 'Create surveys', NOW()),
        ('surveys.read', 'Read surveys', NOW()),
        ('surveys.update', 'Update surveys', NOW()),
        ('surveys.delete', 'Delete surveys', NOW()),
        ('responses.read', 'Read responses', NOW()),
        ('analytics.read', 'Read analytics', NOW()),
        ('admin.access', 'Admin access', NOW())
    """)

    # Insert default roles
    op.execute("""
        INSERT INTO roles (org_id, name, is_system, created_at, updated_at) VALUES
        (1, 'Admin', true, NOW(), NOW()),
        (1, 'Manager', true, NOW(), NOW()),
        (1, 'Viewer', true, NOW(), NOW())
    """)

    # Insert default role permissions
    op.execute("""
        INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES
        (1, 1, NOW()), (1, 2, NOW()), (1, 3, NOW()), (1, 4, NOW()), (1, 5, NOW()), (1, 6, NOW()), (1, 7, NOW()), (1, 8, NOW()), (1, 9, NOW()),
        (2, 1, NOW()), (2, 3, NOW()), (2, 4, NOW()), (2, 5, NOW()), (2, 7, NOW()), (2, 8, NOW()),
        (3, 1, NOW()), (3, 4, NOW()), (3, 7, NOW()), (3, 8, NOW())
    """)


def downgrade():
    # Drop tables in reverse order
    op.drop_index(op.f('ix_billing_accounts_org_id'), table_name='billing_accounts')
    op.drop_table('billing_accounts')
    
    op.drop_index(op.f('ix_audit_log_org_id'), table_name='audit_log')
    op.drop_table('audit_log')
    
    op.drop_index(op.f('ix_survey_defaults_org_id'), table_name='survey_defaults')
    op.drop_table('survey_defaults')
    
    op.drop_index(op.f('ix_notification_prefs_org_id'), table_name='notification_prefs')
    op.drop_table('notification_prefs')
    
    op.drop_index(op.f('ix_integrations_org_id'), table_name='integrations')
    op.drop_table('integrations')
    
    op.drop_table('role_permissions')
    
    op.drop_index(op.f('ix_roles_org_id'), table_name='roles')
    op.drop_table('roles')
    
    op.drop_table('permissions')
    
    op.drop_index(op.f('ix_alert_thresholds_org_id'), table_name='alert_thresholds')
    op.drop_table('alert_thresholds')
    
    op.drop_index(op.f('ix_org_settings_org_id'), table_name='org_settings')
    op.drop_table('org_settings')
