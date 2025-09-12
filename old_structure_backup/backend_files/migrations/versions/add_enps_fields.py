"""Add eNPS fields to team analytics

Revision ID: add_enps_fields
Revises: 4fc9be1678c6
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_enps_fields'
down_revision = '4fc9be1678c6'
branch_labels = None
depends_on = None


def upgrade():
    # Add eNPS-specific fields to team_analytics table
    op.add_column('team_analytics', sa.Column('enps_score', sa.Integer(), nullable=True))
    op.add_column('team_analytics', sa.Column('enps_promoter_pct', sa.Float(), nullable=True))
    op.add_column('team_analytics', sa.Column('enps_passive_pct', sa.Float(), nullable=True))
    op.add_column('team_analytics', sa.Column('enps_detractor_pct', sa.Float(), nullable=True))
    op.add_column('team_analytics', sa.Column('enps_response_count', sa.Integer(), nullable=True))
    
    # Add eNPS fields to dashboard_alerts table
    op.add_column('dashboard_alerts', sa.Column('enps_previous_score', sa.Integer(), nullable=True))
    op.add_column('dashboard_alerts', sa.Column('enps_change', sa.Integer(), nullable=True))


def downgrade():
    # Remove eNPS fields from team_analytics table
    op.drop_column('team_analytics', 'enps_detractor_pct')
    op.drop_column('team_analytics', 'enps_passive_pct')
    op.drop_column('team_analytics', 'enps_promoter_pct')
    op.drop_column('team_analytics', 'enps_score')
    op.drop_column('team_analytics', 'enps_response_count')
    
    # Remove eNPS fields from dashboard_alerts table
    op.drop_column('dashboard_alerts', 'enps_change')
    op.drop_column('dashboard_alerts', 'enps_previous_score')
