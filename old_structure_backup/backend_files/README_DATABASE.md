# Database Setup Guide

This guide covers setting up the database infrastructure for both development and production environments.

## Overview

The Novora Survey Platform supports two database configurations:

- **Development**: SQLite (file-based, no setup required)
- **Production**: PostgreSQL with Redis caching

## Development Setup

### SQLite (Default)

SQLite is used by default for development. No additional setup is required.

```bash
# The application will automatically create novora.db in the backend directory
cd Novora/backend
python main.py
```

### Features
- ✅ Zero configuration
- ✅ File-based storage
- ✅ Perfect for development and testing
- ❌ Not suitable for production
- ❌ Limited concurrent connections

## Production Setup

### PostgreSQL + Redis

For production, we use PostgreSQL for the main database and Redis for caching and background tasks.

### 1. Using Docker Compose (Recommended)

The easiest way to set up production infrastructure:

```bash
# Copy production environment file
cp env.production.example .env

# Edit .env with your secure passwords
nano .env

# Start all services
docker-compose up -d

# Run database setup
python scripts/setup_production_db.py
```

### 2. Manual Setup

#### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database and user
createdb novora
createuser novora_user
```

**PostgreSQL Setup Commands:**
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE novora;
CREATE USER novora_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE novora TO novora_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO novora_user;

-- Exit
\q
```

#### Redis Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Add password (optional but recommended)
requirepass your_redis_password

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS:**
```bash
# Using Homebrew
brew install redis
brew services start redis

# Configure password (optional)
echo "requirepass your_redis_password" >> /usr/local/etc/redis.conf
brew services restart redis
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Copy example file
cp env.production.example .env

# Edit with your actual values
nano .env
```

**Required Environment Variables:**
```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=novora
POSTGRES_USER=novora_user
POSTGRES_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Security
SECRET_KEY=your-super-secret-production-key
ENVIRONMENT=production
```

### 4. Database Migration

Run migrations to set up the database schema:

```bash
# Activate virtual environment
source venv/bin/activate

# Run migrations
alembic -c migrations/alembic.ini upgrade head

# Initialize database
python -c "from app.core.database import init_db; init_db()"
```

### 5. Seed Initial Data

Populate the database with initial data:

```bash
# Seed question bank
python scripts/seed_question_bank.py

# Run full setup script
python scripts/setup_production_db.py
```

## Database Architecture

### Tables

**Core Tables:**
- `users` - User accounts and authentication
- `surveys` - Survey definitions
- `questions` - Survey questions
- `responses` - Survey responses
- `answers` - Individual question answers

**Advanced Tables:**
- `auto_pilot_plans` - Automated survey plans
- `auto_pilot_surveys` - Scheduled surveys
- `metrics` - Performance metrics
- `question_bank` - Question library
- `departments` - Organizational departments
- `teams` - Team definitions

### Indexes

The following indexes are automatically created for performance:

```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);

-- Survey indexes
CREATE INDEX idx_surveys_company_id ON surveys(company_id);
CREATE INDEX idx_surveys_status ON surveys(status);

-- Response indexes
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);

-- Auto-pilot indexes
CREATE INDEX idx_auto_pilot_plans_company_id ON auto_pilot_plans(company_id);
CREATE INDEX idx_auto_pilot_plans_is_active ON auto_pilot_plans(is_active);
CREATE INDEX idx_auto_pilot_surveys_plan_id ON auto_pilot_surveys(plan_id);
CREATE INDEX idx_auto_pilot_surveys_status ON auto_pilot_surveys(status);
CREATE INDEX idx_auto_pilot_surveys_scheduled_date ON auto_pilot_surveys(scheduled_date);
```

## Caching Strategy

### Redis Usage

Redis is used for:

1. **Session Storage** - User sessions and authentication tokens
2. **API Response Caching** - Frequently accessed data
3. **Background Task Queue** - Celery broker and result backend
4. **Rate Limiting** - API rate limiting and throttling

### Cache Keys

Cache keys follow this pattern:
```
novora:{category}:{identifier}
```

Examples:
- `novora:user:123` - User data
- `novora:survey:456` - Survey data
- `novora:metrics:company:789` - Company metrics

### Cache TTL

- **User data**: 1 hour
- **Survey data**: 30 minutes
- **Metrics**: 15 minutes
- **Sessions**: 24 hours

## Performance Optimization

### PostgreSQL

1. **Connection Pooling** - Configured with 20-50 connections
2. **Query Optimization** - Use indexes and proper WHERE clauses
3. **Regular Maintenance** - VACUUM and ANALYZE tables
4. **Monitoring** - Use pg_stat_statements for query analysis

### Redis

1. **Memory Management** - Set maxmemory and eviction policy
2. **Persistence** - Enable AOF for data durability
3. **Monitoring** - Monitor memory usage and hit rates
4. **Clustering** - Use Redis Cluster for high availability

## Backup Strategy

### PostgreSQL Backups

```bash
# Create backup
pg_dump -h localhost -U novora_user -d novora > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U novora_user -d novora < backup_file.sql
```

### Redis Backups

```bash
# Redis automatically creates snapshots
# Manual backup
redis-cli BGSAVE

# Copy RDB file
cp /var/lib/redis/dump.rdb backup_$(date +%Y%m%d_%H%M%S).rdb
```

## Monitoring

### Health Checks

The application includes health check endpoints:

```bash
# Database health
curl http://localhost:8000/api/v1/health

# Redis health
curl http://localhost:8000/api/v1/health/redis
```

### Metrics

Monitor these key metrics:

- **Database**: Connection count, query performance, disk usage
- **Redis**: Memory usage, hit rate, connection count
- **Application**: Response times, error rates, throughput

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if PostgreSQL/Redis is running
   - Verify port and host configuration
   - Check firewall settings

2. **Authentication Failed**
   - Verify username/password in .env
   - Check PostgreSQL user permissions
   - Ensure Redis password is correct

3. **Migration Errors**
   - Check database connection
   - Verify Alembic configuration
   - Review migration files

4. **Performance Issues**
   - Check database indexes
   - Monitor query performance
   - Review Redis memory usage

### Logs

Check logs for debugging:

```bash
# Application logs
tail -f logs/novora.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

## Security Considerations

1. **Strong Passwords** - Use secure passwords for all services
2. **Network Security** - Restrict database access to application servers
3. **SSL/TLS** - Enable SSL for database connections in production
4. **Regular Updates** - Keep PostgreSQL and Redis updated
5. **Backup Encryption** - Encrypt database backups
6. **Access Control** - Use least privilege principle for database users

## Migration from Development to Production

1. **Export Development Data** (if needed):
   ```bash
   sqlite3 novora.db .dump > development_data.sql
   ```

2. **Set up Production Environment**:
   ```bash
   # Follow production setup steps above
   ```

3. **Import Data** (if needed):
   ```bash
   # Convert SQLite dump to PostgreSQL format
   # Import using psql
   ```

4. **Verify Setup**:
   ```bash
   python scripts/setup_production_db.py
   ```

## Support

For database-related issues:

1. Check the logs for error messages
2. Verify configuration in .env file
3. Test database connections manually
4. Review this documentation
5. Check PostgreSQL and Redis documentation
