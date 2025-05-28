"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-03-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('password_hash', sa.String(length=256), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='core'),
        sa.Column('company_name', sa.String(length=120), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('is_email_verified', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('failed_login_attempts', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('last_failed_login', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create email_verification_tokens table
    op.create_table(
        'email_verification_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('is_used', sa.Boolean(), nullable=True, server_default='false'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )

    # Create password_reset_tokens table
    op.create_table(
        'password_reset_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('is_used', sa.Boolean(), nullable=True, server_default='false'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )

    # Create user_sessions table
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('refresh_token', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('is_revoked', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=200), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('refresh_token')
    )

    # Create surveys table
    op.create_table(
        'surveys',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='draft'),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_anonymous', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('allow_comments', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('reminder_frequency', sa.String(length=20), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True, server_default='general'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create questions table
    op.create_table(
        'questions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('required', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('options', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('allow_comments', sa.Boolean(), nullable=True, server_default='false'),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create survey_templates table
    op.create_table(
        'survey_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('questions', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True, server_default='general'),
        sa.Column('is_public', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create responses table
    op.create_table(
        'responses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=True, server_default='true'),
        sa.ForeignKeyConstraint(['survey_id'], ['surveys.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create answers table
    op.create_table(
        'answers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('response_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ),
        sa.ForeignKeyConstraint(['response_id'], ['responses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(op.f('ix_surveys_id'), 'surveys', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('answers')
    op.drop_table('responses')
    op.drop_table('survey_templates')
    op.drop_table('questions')
    op.drop_table('surveys')
    op.drop_table('user_sessions')
    op.drop_table('password_reset_tokens')
    op.drop_table('email_verification_tokens')
    op.drop_table('users') 