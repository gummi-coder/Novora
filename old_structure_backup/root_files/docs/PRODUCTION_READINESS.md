# Production Readiness Guide

This guide covers all aspects of deploying the Novora Survey Platform to production, including SSL/TLS configuration, monitoring, backup procedures, and system administration.

## Table of Contents

1. [SSL/TLS Configuration](#ssltls-configuration)
2. [Production Database Setup](#production-database-setup)
3. [Monitoring and Logging](#monitoring-and-logging)
4. [Backup and Recovery](#backup-and-recovery)
5. [Deployment Procedures](#deployment-procedures)
6. [Security Hardening](#security-hardening)
7. [Performance Optimization](#performance-optimization)
8. [Maintenance Procedures](#maintenance-procedures)
9. [Troubleshooting](#troubleshooting)

## SSL/TLS Configuration

### Overview

The Novora platform includes comprehensive SSL/TLS support for production security.

### Configuration Options

**Environment Variables:**
```bash
# Enable SSL
ENABLE_SSL=true

# Certificate paths
SSL_CERT_FILE=certs/cert.pem
SSL_KEY_FILE=certs/key.pem
SSL_CA_FILE=certs/ca.pem
```

### Certificate Management

**1. Self-Signed Certificates (Development/Testing):**
```bash
# Create self-signed certificate
python -c "
from app.core.ssl import ssl_config
success, message = ssl_config.create_self_signed_cert('your-domain.com')
print(message)
"
```

**2. Let's Encrypt Certificates (Production):**
```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/key.pem
```

**3. Commercial Certificates:**
```bash
# Place your certificate files
cp your-certificate.pem certs/cert.pem
cp your-private-key.pem certs/key.pem
cp your-ca-bundle.pem certs/ca.pem
```

### SSL Verification

**Check SSL Status:**
```bash
curl -X GET "http://localhost:8000/api/v1/production/ssl/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Verify Certificate:**
```bash
curl -X GET "http://localhost:8000/api/v1/production/ssl/verify-certificate" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Security Best Practices

- Use TLS 1.2 or higher
- Disable weak cipher suites
- Implement HSTS headers
- Regular certificate renewal
- Monitor certificate expiration

## Production Database Setup

### PostgreSQL Configuration

**1. Install PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**2. Create Database and User:**
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE novora;
CREATE USER novora_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE novora TO novora_user;
ALTER USER novora_user CREATEDB;
\q
```

**3. Configure Connection:**
```bash
# Environment variables
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=novora
export POSTGRES_USER=novora_user
export POSTGRES_PASSWORD=secure_password
```

### Database Optimization

**PostgreSQL Configuration (`postgresql.conf`):**
```ini
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connection settings
max_connections = 100
max_worker_processes = 8
max_parallel_workers_per_gather = 4

# Logging
log_statement = 'all'
log_duration = on
log_min_duration_statement = 1000

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
```

### Database Migration

**Run Migrations:**
```bash
cd Novora/backend
alembic upgrade head
```

**Verify Migration:**
```bash
alembic current
alembic history
```

## Monitoring and Logging

### System Monitoring

**1. Health Checks:**
```bash
# Basic health check
curl http://localhost:8000/health

# Detailed health check
curl -X GET "http://localhost:8000/api/v1/production/health/detailed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**2. System Metrics:**
```bash
# Get system metrics
curl -X GET "http://localhost:8000/api/v1/production/metrics/system" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Performance Metrics:**
```bash
# Get performance stats
curl -X GET "http://localhost:8000/api/v1/production/metrics/performance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Logging Configuration

**Log Levels:**
```bash
# Environment variables
export LOG_LEVEL=INFO
export LOG_FILE=logs/novora.log
export MAX_LOG_SIZE=10485760  # 10MB
export LOG_BACKUPS=5
```

**Log Rotation:**
```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/novora << EOF
/path/to/Novora/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 novora novora
    postrotate
        systemctl reload novora
    endscript
}
EOF
```

### Monitoring Setup

**1. Prometheus Configuration:**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'novora'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/api/v1/production/metrics/system'
```

**2. Grafana Dashboard:**
```json
{
  "dashboard": {
    "title": "Novora Platform Metrics",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "novora_response_time_seconds"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(novora_errors_total[5m])"
          }
        ]
      }
    ]
  }
}
```

## Backup and Recovery

### Backup Configuration

**Environment Variables:**
```bash
export MAX_BACKUPS=30
export BACKUP_RETENTION_DAYS=30
export ENABLE_BACKUP_COMPRESSION=true
export BACKUP_SCHEDULE=daily
```

### Backup Types

**1. Database Backup:**
```bash
# Manual database backup
curl -X POST "http://localhost:8000/api/v1/production/backup/database" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**2. File System Backup:**
```bash
# Manual file backup
curl -X POST "http://localhost:8000/api/v1/production/backup/files" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Full System Backup:**
```bash
# Manual full backup
curl -X POST "http://localhost:8000/api/v1/production/backup/full" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Automated Backups

**Cron Job Setup:**
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * cd /path/to/Novora/backend && python -c "
from app.core.backup import backup_manager
backup_manager.create_full_backup()
"

# Cleanup old backups weekly
0 3 * * 0 cd /path/to/Novora/backend && python -c "
from app.core.backup import backup_manager
backup_manager.cleanup_old_backups()
"
```

### Backup Management

**List Backups:**
```bash
curl -X GET "http://localhost:8000/api/v1/production/backup/list" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Verify Backup Integrity:**
```bash
curl -X GET "http://localhost:8000/api/v1/production/backup/verify/BACKUP_FILE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Restore from Backup:**
```bash
curl -X POST "http://localhost:8000/api/v1/production/backup/restore/BACKUP_FILE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Recovery Procedures

**1. Database Recovery:**
```bash
# Stop application
sudo systemctl stop novora

# Restore database
python -c "
from app.core.backup import backup_manager
success, message = backup_manager.restore_database_backup('backup_file.sql.gz')
print(message)
"

# Start application
sudo systemctl start novora
```

**2. Full System Recovery:**
```bash
# Stop all services
sudo systemctl stop novora
sudo systemctl stop postgresql
sudo systemctl stop redis

# Restore from full backup
tar -xzf full_backup.tar.gz -C /path/to/restore/

# Restart services
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl start novora
```

## Deployment Procedures

### Automated Deployment

**1. Prerequisites Check:**
```bash
cd Novora/backend
python scripts/deploy_production.py --check-only
```

**2. Full Deployment:**
```bash
# Deploy with SSL
python scripts/deploy_production.py --domain your-domain.com

# Deploy without SSL
python scripts/deploy_production.py --skip-ssl
```

**3. Deployment Verification:**
```bash
# Check system status
curl -X GET "http://localhost:8000/api/v1/production/system/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Manual Deployment Steps

**1. Environment Setup:**
```bash
# Set environment variables
export ENVIRONMENT=production
export DEBUG=false
export LOG_LEVEL=WARNING

# Database configuration
export DATABASE_URL=postgresql://novora_user:password@localhost:5432/novora

# Redis configuration
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=your_redis_password
```

**2. Application Deployment:**
```bash
# Install dependencies
pip install -r requirements/production.txt

# Run migrations
alembic upgrade head

# Seed database
python scripts/seed_database.py

# Start application
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**3. Service Configuration:**
```bash
# Create systemd service
sudo tee /etc/systemd/system/novora.service << EOF
[Unit]
Description=Novora Survey Platform
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=novora
Group=novora
WorkingDirectory=/path/to/Novora/backend
Environment=PATH=/path/to/Novora/backend/venv/bin
ExecStart=/path/to/Novora/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable novora
sudo systemctl start novora
```

### Nginx Configuration

**Reverse Proxy Setup:**
```nginx
# /etc/nginx/sites-available/novora
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certs/cert.pem;
    ssl_certificate_key /path/to/certs/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /path/to/Novora/backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Security Hardening

### Network Security

**1. Firewall Configuration:**
```bash
# UFW firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

**2. Rate Limiting:**
```python
# Add to FastAPI app
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def ratelimit_handler(request, exc):
    return _rate_limit_exceeded_handler(request, exc)
```

### Application Security

**1. Environment Variables:**
```bash
# Secure secrets
export SECRET_KEY="your-super-secret-key-change-this"
export ACCESS_TOKEN_EXPIRE_MINUTES=30
export REFRESH_TOKEN_EXPIRE_DAYS=7
export MAX_LOGIN_ATTEMPTS=5
```

**2. CORS Configuration:**
```python
# Production CORS
BACKEND_CORS_ORIGINS = [
    "https://your-domain.com",
    "https://www.your-domain.com",
]
```

**3. Input Validation:**
```python
# Add validation to all endpoints
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    email: str
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
```

## Performance Optimization

### Database Optimization

**1. Indexing:**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_surveys_company_id ON surveys(company_id);
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
```

**2. Query Optimization:**
```python
# Use select_from for complex queries
from sqlalchemy.orm import selectinload

surveys = db.query(Survey).options(
    selectinload(Survey.responses),
    selectinload(Survey.questions)
).filter(Survey.company_id == company_id).all()
```

### Caching Strategy

**1. Redis Caching:**
```python
from app.core.cache import cache

@cache(ttl=3600)
def get_survey_stats(survey_id: int):
    return db.query(Survey).filter(Survey.id == survey_id).first()
```

**2. Application Caching:**
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_question_bank():
    return db.query(Question).all()
```

### Load Balancing

**1. Multiple Workers:**
```bash
# Start multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**2. Nginx Load Balancing:**
```nginx
upstream novora_backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}

server {
    location / {
        proxy_pass http://novora_backend;
    }
}
```

## Maintenance Procedures

### Regular Maintenance

**1. Daily Tasks:**
```bash
# Check system health
curl -X POST "http://localhost:8000/api/v1/production/health/check"

# Review logs
tail -n 100 logs/novora.log | grep ERROR
```

**2. Weekly Tasks:**
```bash
# Clean up old backups
curl -X POST "http://localhost:8000/api/v1/production/backup/cleanup"

# Update system packages
sudo apt-get update && sudo apt-get upgrade
```

**3. Monthly Tasks:**
```bash
# Review performance metrics
curl -X GET "http://localhost:8000/api/v1/production/metrics/performance"

# Update SSL certificates
sudo certbot renew
```

### Monitoring Alerts

**1. Health Check Alerts:**
```bash
# Set up monitoring script
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ $response -ne 200 ]; then
    echo "Health check failed: $response" | mail -s "Novora Alert" admin@your-domain.com
fi
```

**2. Disk Space Alerts:**
```bash
# Monitor disk usage
df -h | awk '$5 > "80%" {print $0}' | mail -s "Disk Space Alert" admin@your-domain.com
```

## Troubleshooting

### Common Issues

**1. Database Connection Issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U novora_user -d novora -c "SELECT 1;"

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**2. SSL Certificate Issues:**
```bash
# Verify certificate
openssl x509 -in certs/cert.pem -text -noout

# Check certificate expiration
openssl x509 -in certs/cert.pem -noout -dates

# Test SSL connection
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

**3. Performance Issues:**
```bash
# Check system resources
htop
iostat -x 1
netstat -tulpn

# Check application logs
tail -f logs/novora.log | grep -E "(ERROR|WARNING|slow)"
```

### Emergency Procedures

**1. Application Crash:**
```bash
# Restart application
sudo systemctl restart novora

# Check logs
sudo journalctl -u novora -f

# Rollback if necessary
git checkout HEAD~1
sudo systemctl restart novora
```

**2. Database Issues:**
```bash
# Check database status
sudo systemctl status postgresql

# Restart database
sudo systemctl restart postgresql

# Restore from backup if needed
python -c "
from app.core.backup import backup_manager
backup_manager.restore_database_backup('latest_backup.sql.gz')
"
```

**3. SSL Certificate Expiration:**
```bash
# Renew certificate
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/key.pem

# Restart application
sudo systemctl restart novora
```

### Support and Documentation

**1. Log Analysis:**
```bash
# Get recent logs
curl -X GET "http://localhost:8000/api/v1/production/logs/recent?lines=100"

# Get error logs
curl -X GET "http://localhost:8000/api/v1/production/logs/errors?lines=50"
```

**2. System Information:**
```bash
# Get system info
curl -X GET "http://localhost:8000/api/v1/production/system/info"

# Get comprehensive status
curl -X GET "http://localhost:8000/api/v1/production/system/status"
```

**3. Backup Verification:**
```bash
# List all backups
curl -X GET "http://localhost:8000/api/v1/production/backup/list"

# Verify specific backup
curl -X GET "http://localhost:8000/api/v1/production/backup/verify/BACKUP_FILE"
```

## Conclusion

This production readiness guide provides comprehensive coverage of all aspects needed to deploy and maintain the Novora Survey Platform in a production environment. Regular review and updates of these procedures ensure optimal performance, security, and reliability.

For additional support or questions, refer to the API documentation at `/docs` or contact the development team.
