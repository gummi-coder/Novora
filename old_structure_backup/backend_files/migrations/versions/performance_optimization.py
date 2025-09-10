"""Performance Optimization with Critical Indexes

Revision ID: performance_optimization
Revises: add_audit_tables
Create Date: 2024-01-15 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'performance_optimization'
down_revision = 'add_audit_tables'
branch_labels = None
depends_on = None

def upgrade():
    # Critical composite indexes for performance
    
    # 1. Survey responses indexes
    op.create_index('idx_numresp_survey_team_driver', 'numeric_responses', ['survey_id', 'team_id', 'driver_id'])
    op.create_index('idx_numresp_team_driver_ts', 'numeric_responses', ['team_id', 'driver_id', 'ts'])
    op.create_index('idx_numresp_survey_ts', 'numeric_responses', ['survey_id', 'ts'])
    
    # 2. Comments indexes
    op.create_index('idx_comments_survey_team_ts', 'comments', ['survey_id', 'team_id', 'ts'])
    op.create_index('idx_comments_team_driver_ts', 'comments', ['team_id', 'driver_id', 'ts'])
    op.create_index('idx_comments_survey_ts', 'comments', ['survey_id', 'ts'])
    
    # 3. Summary tables indexes
    op.create_index('idx_participation_org_survey', 'participation_summary', ['org_id', 'survey_id'])
    op.create_index('idx_participation_team_survey', 'participation_summary', ['team_id', 'survey_id'])
    op.create_index('idx_participation_org_created', 'participation_summary', ['org_id', 'created_at'])
    
    op.create_index('idx_driver_org_survey', 'driver_summary', ['org_id', 'survey_id'])
    op.create_index('idx_driver_team_survey', 'driver_summary', ['team_id', 'survey_id'])
    op.create_index('idx_driver_team_driver', 'driver_summary', ['team_id', 'driver_id'])
    op.create_index('idx_driver_org_created', 'driver_summary', ['org_id', 'created_at'])
    
    op.create_index('idx_sentiment_org_survey', 'sentiment_summary', ['org_id', 'survey_id'])
    op.create_index('idx_sentiment_team_survey', 'sentiment_summary', ['team_id', 'survey_id'])
    op.create_index('idx_sentiment_org_created', 'sentiment_summary', ['org_id', 'created_at'])
    
    # 4. Trends indexes
    op.create_index('idx_trends_team_driver_month', 'org_driver_trends', ['team_id', 'driver_id', 'period_month'])
    op.create_index('idx_trends_org_month', 'org_driver_trends', ['org_id', 'period_month'])
    
    # 5. Reports cache indexes
    op.create_index('idx_reports_org_scope_period', 'reports_cache', ['org_id', 'scope', 'period_start', 'period_end'])
    op.create_index('idx_reports_org_created', 'reports_cache', ['org_id', 'created_at'])
    
    # 6. Comment NLP indexes
    op.create_index('idx_comment_nlp_sentiment', 'comment_nlp', ['sentiment'])
    op.create_index('idx_comment_nlp_processed', 'comment_nlp', ['processed_at'])
    
    # 7. Alerts indexes
    op.create_index('idx_alerts_org_status_created', 'alerts', ['org_id', 'status', 'created_at'])
    op.create_index('idx_alerts_team_status_created', 'alerts', ['team_id', 'status', 'created_at'])
    op.create_index('idx_alerts_org_severity_created', 'alerts', ['org_id', 'severity', 'created_at'])
    
    # 8. Survey tokens indexes
    op.create_index('idx_survey_tokens_survey_used', 'survey_tokens', ['survey_id', 'used'])
    op.create_index('idx_survey_tokens_team_used', 'survey_tokens', ['team_id', 'used'])
    op.create_index('idx_survey_tokens_device_attempt', 'survey_tokens', ['device_fingerprint', 'last_attempt_at'])
    
    # 9. Audit logs indexes
    op.create_index('idx_audit_logs_org_action_timestamp', 'audit_logs', ['org_id', 'action_type', 'timestamp'])
    op.create_index('idx_audit_logs_user_timestamp', 'audit_logs', ['user_id', 'timestamp'])
    op.create_index('idx_audit_logs_resource_timestamp', 'audit_logs', ['resource_type', 'resource_id', 'timestamp'])
    
    # 10. Partial indexes for performance
    # Only index active surveys
    op.execute("""
        CREATE INDEX idx_surveys_active_created 
        ON surveys (creator_id, created_at) 
        WHERE status IN ('active', 'closed')
    """)
    
    # Only index unused tokens
    op.execute("""
        CREATE INDEX idx_survey_tokens_unused 
        ON survey_tokens (survey_id, token) 
        WHERE used = false
    """)
    
    # Only index open alerts
    op.execute("""
        CREATE INDEX idx_alerts_open_created 
        ON alerts (org_id, created_at) 
        WHERE status IN ('open', 'acknowledged')
    """)
    
    # 11. Covering indexes for common queries
    # KPIs query covering index
    op.execute("""
        CREATE INDEX idx_participation_kpis_covering 
        ON participation_summary (survey_id, team_id) 
        INCLUDE (respondents, team_size, participation_pct, delta_pct)
    """)
    
    # Driver summary covering index
    op.execute("""
        CREATE INDEX idx_driver_kpis_covering 
        ON driver_summary (survey_id, team_id, driver_id) 
        INCLUDE (avg_score, detractors_pct, passives_pct, promoters_pct, delta_vs_prev)
    """)
    
    # 12. Statistics for query planner
    op.execute("ANALYZE numeric_responses")
    op.execute("ANALYZE comments")
    op.execute("ANALYZE participation_summary")
    op.execute("ANALYZE driver_summary")
    op.execute("ANALYZE sentiment_summary")
    op.execute("ANALYZE alerts")
    op.execute("ANALYZE survey_tokens")

def downgrade():
    # Drop covering indexes
    op.drop_index('idx_driver_kpis_covering', table_name='driver_summary')
    op.drop_index('idx_participation_kpis_covering', table_name='participation_summary')
    
    # Drop partial indexes
    op.execute("DROP INDEX IF EXISTS idx_alerts_open_created")
    op.execute("DROP INDEX IF EXISTS idx_survey_tokens_unused")
    op.execute("DROP INDEX IF EXISTS idx_surveys_active_created")
    
    # Drop audit log indexes
    op.drop_index('idx_audit_logs_resource_timestamp', table_name='audit_logs')
    op.drop_index('idx_audit_logs_user_timestamp', table_name='audit_logs')
    op.drop_index('idx_audit_logs_org_action_timestamp', table_name='audit_logs')
    
    # Drop survey token indexes
    op.drop_index('idx_survey_tokens_device_attempt', table_name='survey_tokens')
    op.drop_index('idx_survey_tokens_team_used', table_name='survey_tokens')
    op.drop_index('idx_survey_tokens_survey_used', table_name='survey_tokens')
    
    # Drop alert indexes
    op.drop_index('idx_alerts_org_severity_created', table_name='alerts')
    op.drop_index('idx_alerts_team_status_created', table_name='alerts')
    op.drop_index('idx_alerts_org_status_created', table_name='alerts')
    
    # Drop comment NLP indexes
    op.drop_index('idx_comment_nlp_processed', table_name='comment_nlp')
    op.drop_index('idx_comment_nlp_sentiment', table_name='comment_nlp')
    
    # Drop reports cache indexes
    op.drop_index('idx_reports_org_created', table_name='reports_cache')
    op.drop_index('idx_reports_org_scope_period', table_name='reports_cache')
    
    # Drop trends indexes
    op.drop_index('idx_trends_org_month', table_name='org_driver_trends')
    op.drop_index('idx_trends_team_driver_month', table_name='org_driver_trends')
    
    # Drop sentiment summary indexes
    op.drop_index('idx_sentiment_org_created', table_name='sentiment_summary')
    op.drop_index('idx_sentiment_team_survey', table_name='sentiment_summary')
    op.drop_index('idx_sentiment_org_survey', table_name='sentiment_summary')
    
    # Drop driver summary indexes
    op.drop_index('idx_driver_org_created', table_name='driver_summary')
    op.drop_index('idx_driver_team_driver', table_name='driver_summary')
    op.drop_index('idx_driver_team_survey', table_name='driver_summary')
    op.drop_index('idx_driver_org_survey', table_name='driver_summary')
    
    # Drop participation summary indexes
    op.drop_index('idx_participation_org_created', table_name='participation_summary')
    op.drop_index('idx_participation_team_survey', table_name='participation_summary')
    op.drop_index('idx_participation_org_survey', table_name='participation_summary')
    
    # Drop comment indexes
    op.drop_index('idx_comments_survey_ts', table_name='comments')
    op.drop_index('idx_comments_team_driver_ts', table_name='comments')
    op.drop_index('idx_comments_survey_team_ts', table_name='comments')
    
    # Drop numeric response indexes
    op.drop_index('idx_numresp_survey_ts', table_name='numeric_responses')
    op.drop_index('idx_numresp_team_driver_ts', table_name='numeric_responses')
    op.drop_index('idx_numresp_survey_team_driver', table_name='numeric_responses')
