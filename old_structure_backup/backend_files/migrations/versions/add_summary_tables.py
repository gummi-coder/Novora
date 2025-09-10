"""Add pre-aggregated summary tables for fast dashboard loads

Revision ID: add_summary_tables
Revises: add_critical_indexes
Create Date: 2025-01-27 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_summary_tables'
down_revision = 'add_critical_indexes'
branch_labels = None
depends_on = None

def upgrade():
    # Create numeric_responses table
    op.create_table('numeric_responses',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('survey_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('team_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('driver_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('ts', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create comments table
    op.create_table('comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('survey_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('team_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('driver_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('ts', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create participation_summary table with composite primary key
    op.create_table('participation_summary',
        sa.Column('survey_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('team_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('respondents', sa.Integer(), nullable=False),
        sa.Column('team_size', sa.Integer(), nullable=False),
        sa.Column('participation_pct', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('delta_pct', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.ForeignKeyConstraint(['org_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('survey_id', 'team_id')
    )
    
    # Create driver_summary table with composite primary key
    op.create_table('driver_summary',
        sa.Column('survey_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('team_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('driver_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('avg_score', sa.Numeric(precision=4, scale=2), nullable=False),
        sa.Column('detractors_pct', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('passives_pct', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('promoters_pct', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('delta_vs_prev', sa.Numeric(precision=4, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.ForeignKeyConstraint(['org_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('survey_id', 'team_id', 'driver_id')
    )
    
    # Create sentiment_summary table with composite primary key
    op.create_table('sentiment_summary',
        sa.Column('survey_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('team_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pos_pct', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('neu_pct', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('neg_pct', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('delta_vs_prev', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.ForeignKeyConstraint(['org_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('survey_id', 'team_id')
    )
    
    # Create org_driver_trends table with composite primary key
    op.create_table('org_driver_trends',
        sa.Column('team_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('driver_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('period_month', sa.Date(), nullable=False),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('avg_score', sa.Numeric(precision=4, scale=2), nullable=False),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.ForeignKeyConstraint(['org_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('team_id', 'driver_id', 'period_month')
    )
    
    # Create reports_cache table with composite primary key
    op.create_table('reports_cache',
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('scope', sa.String(length=50), nullable=False),
        sa.Column('period_start', sa.Date(), nullable=False),
        sa.Column('period_end', sa.Date(), nullable=False),
        sa.Column('payload_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('org_id', 'scope', 'period_start', 'period_end')
    )
    
    # Create comment_nlp table
    op.create_table('comment_nlp',
        sa.Column('comment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sentiment', sa.String(length=1), nullable=False),
        sa.Column('themes', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('pii_masked', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('processed_at', sa.DateTime(), nullable=False),
        sa.CheckConstraint("sentiment IN ('+','0','-')"),
        sa.PrimaryKeyConstraint('comment_id')
    )

def downgrade():
    # Drop tables in reverse order
    op.drop_table('comment_nlp')
    op.drop_table('reports_cache')
    op.drop_table('org_driver_trends')
    op.drop_table('sentiment_summary')
    op.drop_table('driver_summary')
    op.drop_table('participation_summary')
    op.drop_table('comments')
    op.drop_table('numeric_responses')
