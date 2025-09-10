-- PostgreSQL initialization script for Novora Survey Platform
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'UTC';

-- Create additional databases for different environments (optional)
-- CREATE DATABASE novora_test;
-- CREATE DATABASE novora_staging;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE novora TO novora_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO novora_user;

-- Create custom functions for JSON operations (if needed)
CREATE OR REPLACE FUNCTION jsonb_merge(a jsonb, b jsonb)
RETURNS jsonb AS $$
BEGIN
    RETURN a || b;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create indexes for better performance (these will be created by SQLAlchemy, but good to have)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surveys_company_id ON surveys(company_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);

-- Set up connection limits and other PostgreSQL settings
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reload configuration
SELECT pg_reload_conf();
