"""Add feedback distribution tables

Revision ID: feedback_distribution_001
Revises: 4fc9be1678c6
Create Date: 2025-01-27 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'feedback_distribution_001'
down_revision = '4fc9be1678c6'
branch_labels = None
depends_on = None


def upgrade():
    # Create survey_responses table
    op.create_table('survey_responses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.String(length=100), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('driver', sa.String(length=100), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create survey_comments table
    op.create_table('survey_comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('comment_id', sa.String(length=100), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=False),
        sa.Column('driver', sa.String(length=100), nullable=False),
        sa.Column('sentiment', sa.String(length=20), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('employee_id', sa.String(length=100), nullable=False),
        sa.Column('is_flagged', sa.Boolean(), nullable=True),
        sa.Column('is_pinned', sa.Boolean(), nullable=True),
        sa.Column('tags', sqlite.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('comment_id')
    )
    
    # Create drivers table
    op.create_table('drivers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('driver_name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create metrics_summary table
    op.create_table('metrics_summary',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('driver', sa.String(length=100), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=False),
        sa.Column('avg_score', sa.Float(), nullable=False),
        sa.Column('change', sa.Float(), nullable=True),
        sa.Column('distribution', sqlite.JSON, nullable=False),
        sa.Column('response_count', sa.Integer(), nullable=False),
        sa.Column('participation_rate', sa.Float(), nullable=False),
        sa.Column('last_calculated', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for performance
    op.create_index('ix_survey_responses_team_driver_survey', 'survey_responses', ['team_id', 'driver', 'survey_id'])
    op.create_index('ix_survey_responses_employee_id', 'survey_responses', ['employee_id'])
    op.create_index('ix_survey_responses_timestamp', 'survey_responses', ['timestamp'])
    
    op.create_index('ix_survey_comments_team_driver', 'survey_comments', ['team_id', 'driver'])
    op.create_index('ix_survey_comments_sentiment', 'survey_comments', ['sentiment'])
    op.create_index('ix_survey_comments_created_at', 'survey_comments', ['created_at'])
    op.create_index('ix_survey_comments_flagged', 'survey_comments', ['is_flagged'])
    
    op.create_index('ix_drivers_question_id', 'drivers', ['question_id'])
    op.create_index('ix_drivers_driver_name', 'drivers', ['driver_name'])
    
    op.create_index('ix_metrics_summary_team_driver_survey', 'metrics_summary', ['team_id', 'driver', 'survey_id'])
    op.create_index('ix_metrics_summary_last_calculated', 'metrics_summary', ['last_calculated'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_metrics_summary_last_calculated', table_name='metrics_summary')
    op.drop_index('ix_metrics_summary_team_driver_survey', table_name='metrics_summary')
    op.drop_index('ix_drivers_driver_name', table_name='drivers')
    op.drop_index('ix_drivers_question_id', table_name='drivers')
    op.drop_index('ix_survey_comments_flagged', table_name='survey_comments')
    op.drop_index('ix_survey_comments_created_at', table_name='survey_comments')
    op.drop_index('ix_survey_comments_sentiment', table_name='survey_comments')
    op.drop_index('ix_survey_comments_team_driver', table_name='survey_comments')
    op.drop_index('ix_survey_responses_timestamp', table_name='survey_responses')
    op.drop_index('ix_survey_responses_employee_id', table_name='survey_responses')
    op.drop_index('ix_survey_responses_team_driver_survey', table_name='survey_responses')
    
    # Drop tables
    op.drop_table('metrics_summary')
    op.drop_table('drivers')
    op.drop_table('survey_comments')
    op.drop_table('survey_responses')
