"""Add audit tables for comprehensive logging

Revision ID: add_audit_tables
Revises: add_critical_indexes
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_audit_tables'
down_revision = 'add_critical_indexes'
branch_labels = None
depends_on = None

def upgrade():
    # Create audit_logs table
    op.create_table('audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action_type', sa.String(length=50), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('resource_id', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('success', sa.Boolean(), nullable=False, default=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create alert_audit_logs table
    op.create_table('alert_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('alert_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('previous_status', sa.String(length=20), nullable=True),
        sa.Column('new_status', sa.String(length=20), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('resolution_time', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create settings_audit_logs table
    op.create_table('settings_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('setting_category', sa.String(length=50), nullable=False),
        sa.Column('setting_name', sa.String(length=100), nullable=False),
        sa.Column('old_value', sa.Text(), nullable=True),
        sa.Column('new_value', sa.Text(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create token_audit_logs table
    op.create_table('token_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('survey_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('device_fingerprint', sa.String(length=64), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('failure_reason', sa.String(length=100), nullable=True),
        sa.Column('team_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Add indexes for performance
    op.create_index('idx_audit_logs_org_timestamp', 'audit_logs', ['org_id', 'timestamp'])
    op.create_index('idx_audit_logs_action_type', 'audit_logs', ['action_type'])
    op.create_index('idx_audit_logs_user_id', 'audit_logs', ['user_id'])
    
    op.create_index('idx_alert_audit_org_timestamp', 'alert_audit_logs', ['org_id', 'timestamp'])
    op.create_index('idx_alert_audit_alert_id', 'alert_audit_logs', ['alert_id'])
    op.create_index('idx_alert_audit_user_id', 'alert_audit_logs', ['user_id'])
    
    op.create_index('idx_settings_audit_org_timestamp', 'settings_audit_logs', ['org_id', 'timestamp'])
    op.create_index('idx_settings_audit_user_id', 'settings_audit_logs', ['user_id'])
    op.create_index('idx_settings_audit_category', 'settings_audit_logs', ['setting_category'])
    
    op.create_index('idx_token_audit_survey_timestamp', 'token_audit_logs', ['survey_id', 'timestamp'])
    op.create_index('idx_token_audit_action', 'token_audit_logs', ['action'])
    op.create_index('idx_token_audit_device', 'token_audit_logs', ['device_fingerprint'])

def downgrade():
    # Drop indexes
    op.drop_index('idx_token_audit_device', table_name='token_audit_logs')
    op.drop_index('idx_token_audit_action', table_name='token_audit_logs')
    op.drop_index('idx_token_audit_survey_timestamp', table_name='token_audit_logs')
    
    op.drop_index('idx_settings_audit_category', table_name='settings_audit_logs')
    op.drop_index('idx_settings_audit_user_id', table_name='settings_audit_logs')
    op.drop_index('idx_settings_audit_org_timestamp', table_name='settings_audit_logs')
    
    op.drop_index('idx_alert_audit_user_id', table_name='alert_audit_logs')
    op.drop_index('idx_alert_audit_alert_id', table_name='alert_audit_logs')
    op.drop_index('idx_alert_audit_org_timestamp', table_name='alert_audit_logs')
    
    op.drop_index('idx_audit_logs_user_id', table_name='audit_logs')
    op.drop_index('idx_audit_logs_action_type', table_name='audit_logs')
    op.drop_index('idx_audit_logs_org_timestamp', table_name='audit_logs')
    
    # Drop tables
    op.drop_table('token_audit_logs')
    op.drop_table('settings_audit_logs')
    op.drop_table('alert_audit_logs')
    op.drop_table('audit_logs')
