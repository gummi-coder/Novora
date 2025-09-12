"""Enhance SurveyToken model for team-based tokens and single-use validation

Revision ID: enhance_survey_tokens
Revises: add_feedback_distribution_tables
Create Date: 2025-01-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'enhance_survey_tokens'
down_revision = 'add_feedback_distribution_tables'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to survey_tokens table
    op.add_column('survey_tokens', sa.Column('team_id', sa.Integer(), nullable=True))
    op.add_column('survey_tokens', sa.Column('employee_id', sa.Integer(), nullable=True))
    op.add_column('survey_tokens', sa.Column('used', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('survey_tokens', sa.Column('used_at', sa.DateTime(), nullable=True))
    op.add_column('survey_tokens', sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()))
    
    # Add foreign key constraints
    op.create_foreign_key('fk_survey_tokens_team_id', 'survey_tokens', 'teams', ['team_id'], ['id'])
    op.create_foreign_key('fk_survey_tokens_employee_id', 'survey_tokens', 'users', ['employee_id'], ['id'])
    
    # Add indexes for performance
    op.create_index('ix_survey_tokens_team_id', 'survey_tokens', ['team_id'])
    op.create_index('ix_survey_tokens_used', 'survey_tokens', ['used'])
    op.create_index('ix_survey_tokens_survey_team', 'survey_tokens', ['survey_id', 'team_id'])
    op.create_index('ix_survey_tokens_created_at', 'survey_tokens', ['created_at'])

def downgrade():
    # Drop indexes
    op.drop_index('ix_survey_tokens_created_at', table_name='survey_tokens')
    op.drop_index('ix_survey_tokens_survey_team', table_name='survey_tokens')
    op.drop_index('ix_survey_tokens_used', table_name='survey_tokens')
    op.drop_index('ix_survey_tokens_team_id', table_name='survey_tokens')
    
    # Drop foreign key constraints
    op.drop_constraint('fk_survey_tokens_employee_id', 'survey_tokens', type_='foreignkey')
    op.drop_constraint('fk_survey_tokens_team_id', 'survey_tokens', type_='foreignkey')
    
    # Drop columns
    op.drop_column('survey_tokens', 'created_at')
    op.drop_column('survey_tokens', 'used_at')
    op.drop_column('survey_tokens', 'used')
    op.drop_column('survey_tokens', 'employee_id')
    op.drop_column('survey_tokens', 'team_id')
