"""Question Bank Migration

Revision ID: 002
Revises: 001
Create Date: 2024-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create metrics table
    op.create_table(
        'metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('is_core', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('display_order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create question_bank table
    op.create_table(
        'question_bank',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('metric_id', sa.Integer(), nullable=False),
        sa.Column('question_text_en', sa.Text(), nullable=False),
        sa.Column('question_text_es', sa.Text(), nullable=True),
        sa.Column('question_text_is', sa.Text(), nullable=True),
        sa.Column('question_text_de', sa.Text(), nullable=True),
        sa.Column('question_text_fr', sa.Text(), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('variation_order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('sensitive', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('reverse_scored', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['metric_id'], ['metrics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create auto_pilot_plans table
    op.create_table(
        'auto_pilot_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('plan_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create auto_pilot_surveys table
    op.create_table(
        'auto_pilot_surveys',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plan_id', sa.Integer(), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=True),
        sa.Column('month', sa.Integer(), nullable=False),
        sa.Column('template', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('send_date', sa.DateTime(), nullable=False),
        sa.Column('first_reminder', sa.DateTime(), nullable=False),
        sa.Column('second_reminder', sa.DateTime(), nullable=False),
        sa.Column('close_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='scheduled'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['plan_id'], ['auto_pilot_plans.id'], ),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(op.f('ix_metrics_id'), 'metrics', ['id'], unique=False)
    op.create_index(op.f('ix_question_bank_id'), 'question_bank', ['id'], unique=False)
    op.create_index(op.f('ix_auto_pilot_plans_id'), 'auto_pilot_plans', ['id'], unique=False)
    op.create_index(op.f('ix_auto_pilot_surveys_id'), 'auto_pilot_surveys', ['id'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_auto_pilot_surveys_id'), table_name='auto_pilot_surveys')
    op.drop_index(op.f('ix_auto_pilot_plans_id'), table_name='auto_pilot_plans')
    op.drop_index(op.f('ix_question_bank_id'), table_name='question_bank')
    op.drop_index(op.f('ix_metrics_id'), table_name='metrics')
    
    op.drop_table('auto_pilot_surveys')
    op.drop_table('auto_pilot_plans')
    op.drop_table('question_bank')
    op.drop_table('metrics')
