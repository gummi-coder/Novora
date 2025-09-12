"""merge multiple heads

Revision ID: a2c99d022590
Revises: add_enps_fields, feedback_distribution_001, add_settings_tables
Create Date: 2025-08-21 23:27:24.356118

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a2c99d022590'
down_revision = ('add_enps_fields', 'feedback_distribution_001', 'add_settings_tables')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass 