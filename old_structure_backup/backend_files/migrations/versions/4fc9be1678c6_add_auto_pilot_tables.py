"""add auto pilot tables

Revision ID: 4fc9be1678c6
Revises: 002
Create Date: 2024-12-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '4fc9be1678c6'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create auto_pilot_plans table
    op.create_table('auto_pilot_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('frequency', sa.String(length=50), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=False),
        sa.Column('question_rotation', sa.Boolean(), nullable=False, default=True),
        sa.Column('reminder_settings', sa.Text(), nullable=True),  # JSON string
        sa.Column('distribution_channels', sa.Text(), nullable=True),  # JSON string
        sa.Column('target_audience', sa.Text(), nullable=True),  # JSON string
        sa.Column('max_responses', sa.Integer(), nullable=True),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['company_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create auto_pilot_surveys table
    op.create_table('auto_pilot_surveys',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plan_id', sa.Integer(), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=False),
        sa.Column('scheduled_date', sa.DateTime(), nullable=False),
        sa.Column('sent_date', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, default='scheduled'),
        sa.Column('question_set', sa.Text(), nullable=True),  # JSON string
        sa.Column('reminder_count', sa.Integer(), nullable=False, default=0),
        sa.Column('last_reminder_date', sa.DateTime(), nullable=True),
        sa.Column('response_count', sa.Integer(), nullable=False, default=0),
        sa.Column('target_count', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['plan_id'], ['auto_pilot_plans.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for better performance
    op.create_index(op.f('ix_auto_pilot_plans_company_id'), 'auto_pilot_plans', ['company_id'], unique=False)
    op.create_index(op.f('ix_auto_pilot_plans_is_active'), 'auto_pilot_plans', ['is_active'], unique=False)
    op.create_index(op.f('ix_auto_pilot_surveys_plan_id'), 'auto_pilot_surveys', ['plan_id'], unique=False)
    op.create_index(op.f('ix_auto_pilot_surveys_status'), 'auto_pilot_surveys', ['status'], unique=False)
    op.create_index(op.f('ix_auto_pilot_surveys_scheduled_date'), 'auto_pilot_surveys', ['scheduled_date'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_auto_pilot_surveys_scheduled_date'), table_name='auto_pilot_surveys')
    op.drop_index(op.f('ix_auto_pilot_surveys_status'), table_name='auto_pilot_surveys')
    op.drop_index(op.f('ix_auto_pilot_surveys_plan_id'), table_name='auto_pilot_surveys')
    op.drop_index(op.f('ix_auto_pilot_plans_is_active'), table_name='auto_pilot_plans')
    op.drop_index(op.f('ix_auto_pilot_plans_company_id'), table_name='auto_pilot_plans')
    
    # Drop tables
    op.drop_table('auto_pilot_surveys')
    op.drop_table('auto_pilot_plans') 