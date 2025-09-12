"""Add critical composite indexes for performance optimization

Revision ID: add_critical_indexes
Revises: enhance_survey_tokens
Create Date: 2025-01-27 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_critical_indexes'
down_revision = 'enhance_survey_tokens'
branch_labels = None
depends_on = None

def upgrade():
    # Critical composite indexes for numeric_responses
    op.create_index('idx_numresp_survey_team', 'numeric_responses', ['survey_id', 'team_id'])
    op.create_index('idx_numresp_team_driver', 'numeric_responses', ['team_id', 'driver_id'])
    
    # Index for comments
    op.create_index('idx_comments_survey_team', 'comments', ['survey_id', 'team_id', 'ts'])
    
    # Index for alerts by team and creation time
    op.create_index('idx_alerts_team_created', 'alerts', ['team_id', 'created_at'])
    
    # Index for alerts by creation time
    op.create_index('idx_alerts_created_at', 'alerts', ['created_at'])
    
    # Index for team analytics
    op.create_index('idx_team_analytics_team_survey', 'team_analytics', ['team_id', 'survey_id'])
    
    # Index for participation summary
    op.create_index('idx_participation_summary_survey_team', 'participation_summary', ['survey_id', 'team_id'])
    
    # Index for driver summary
    op.create_index('idx_driver_summary_survey_team_driver', 'driver_summary', ['survey_id', 'team_id', 'driver_id'])
    
    # Index for sentiment summary
    op.create_index('idx_sentiment_summary_survey_team', 'sentiment_summary', ['survey_id', 'team_id'])
    
    # Index for org driver trends
    op.create_index('idx_org_driver_trends_team_driver_period', 'org_driver_trends', ['team_id', 'driver_id', 'period_month'])
    
    # Index for reports cache
    op.create_index('idx_reports_cache_org_scope_period', 'reports_cache', ['org_id', 'scope', 'period_start', 'period_end'])

def downgrade():
    # Drop indexes in reverse order
    op.drop_index('idx_reports_cache_org_scope_period', table_name='reports_cache')
    op.drop_index('idx_org_driver_trends_team_driver_period', table_name='org_driver_trends')
    op.drop_index('idx_sentiment_summary_survey_team', table_name='sentiment_summary')
    op.drop_index('idx_driver_summary_survey_team_driver', table_name='driver_summary')
    op.drop_index('idx_participation_summary_survey_team', table_name='participation_summary')
    op.drop_index('idx_team_analytics_team_survey', table_name='team_analytics')
    op.drop_index('idx_alerts_created_at', table_name='alerts')
    op.drop_index('idx_alerts_team_created', table_name='alerts')
    op.drop_index('idx_comments_survey_team', table_name='comments')
    op.drop_index('idx_numresp_team_driver', table_name='numeric_responses')
    op.drop_index('idx_numresp_survey_team', table_name='numeric_responses')
