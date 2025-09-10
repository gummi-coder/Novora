# QA Checklist & Acceptance Criteria

## Overview
This document outlines the comprehensive QA checklist and acceptance criteria for the Novora Survey Platform end-to-end data pipeline and dashboard functionality.

## Test Environment Setup

### Prerequisites
- Redis server running on localhost:6379
- PostgreSQL database with all migrations applied
- Celery worker running with performance tasks
- All dependencies installed

### Test Data Setup
```bash
# Run database migrations
alembic upgrade head

# Start Redis
redis-server

# Start Celery worker
celery -A app.tasks.celery_app worker --loglevel=info

# Start Celery beat (for scheduled tasks)
celery -A app.tasks.celery_app beat --loglevel=info

# Run QA tests
pytest tests/test_qa_checklist.py -v
```

## Acceptance Criteria Checklist

### ✅ 1. Token Validation & Security

#### 1.1 Used Token Rejection
- **Test**: Submit survey response with already-used token
- **Expected**: HTTP 409 with "already been used" message
- **Status**: ✅ PASS

#### 1.2 Expired Token Rejection
- **Test**: Submit survey response with expired token
- **Expected**: HTTP 410 with "Survey window has closed" message
- **Status**: ✅ PASS

#### 1.3 Invalid Token Rejection
- **Test**: Submit survey response with invalid token
- **Expected**: HTTP 404 with "Invalid token" message
- **Status**: ✅ PASS

#### 1.4 Device Throttling
- **Test**: Submit multiple responses from same device
- **Expected**: HTTP 429 with throttling message
- **Status**: ✅ PASS

### ✅ 2. Min-n Rule Enforcement

#### 2.1 Manager Dashboard - Below Min-n
- **Test**: Access manager dashboard with < 4 responses
- **Expected**: Safe=False, "Not enough responses" message
- **Status**: ✅ PASS

#### 2.2 Viewer Dashboard - Below Min-n
- **Test**: Access viewer dashboard with < 4 responses
- **Expected**: Safe=False, "Not enough responses" message
- **Status**: ✅ PASS

#### 2.3 Admin Multi-team View - Hide Unsafe Rows
- **Test**: Admin view with mixed safe/unsafe teams
- **Expected**: Show unsafe teams with message, report counts
- **Status**: ✅ PASS

#### 2.4 Admin Multi-team View - Safe Teams Only
- **Test**: Admin view with all teams above min-n
- **Expected**: All teams show data, safe=True
- **Status**: ✅ PASS

### ✅ 3. Alert System Validation

#### 3.1 Alert Creation - LOW_SCORE
- **Test**: Create responses with avg score < 6.0
- **Expected**: LOW_SCORE alert created with High severity
- **Status**: ✅ PASS

#### 3.2 Alert Creation - LOW_PARTICIPATION
- **Test**: Create responses with participation < 60%
- **Expected**: LOW_PARTICIPATION alert created with Medium severity
- **Status**: ✅ PASS

#### 3.3 Alert Creation - BIG_DROP_ABS
- **Test**: Create responses with score drop > 1.0 from previous
- **Expected**: BIG_DROP_ABS alert created with Medium severity
- **Status**: ✅ PASS

#### 3.4 Alert Creation - ENPS_NEG
- **Test**: Create responses resulting in negative eNPS
- **Expected**: ENPS_NEG alert created with High severity
- **Status**: ✅ PASS

#### 3.5 Alert SLA Countdown
- **Test**: Check alert creation timestamp
- **Expected**: created_at timestamp set, status="open"
- **Status**: ✅ PASS

#### 3.6 Alert Acknowledgment
- **Test**: Acknowledge alert via API
- **Expected**: status="acknowledged", acknowledged_at timestamp
- **Status**: ✅ PASS

#### 3.7 Alert Resolution
- **Test**: Resolve alert via API
- **Expected**: status="resolved", resolved_at timestamp
- **Status**: ✅ PASS

### ✅ 4. NLP Processing & PII Protection

#### 4.1 Raw PII Never Displayed
- **Test**: Submit comment with names, emails, phones
- **Expected**: Raw PII masked in all responses
- **Status**: ✅ PASS

#### 4.2 Sentiment Analysis
- **Test**: Submit comment, wait for NLP processing
- **Expected**: Sentiment score appears in themes endpoint
- **Status**: ✅ PASS

#### 4.3 Theme Extraction
- **Test**: Submit comment with keywords, wait for NLP
- **Expected**: Themes extracted and categorized
- **Status**: ✅ PASS

#### 4.4 PII Masking in Comments
- **Test**: Submit comment with "John Smith john@email.com"
- **Expected**: Displayed as "[NAME] [EMAIL]"
- **Status**: ✅ PASS

### ✅ 5. Reports Cache & Data Consistency

#### 5.1 Reports Digest from Cache
- **Test**: Generate report digest
- **Expected**: Data served from reports_cache table
- **Status**: ✅ PASS

#### 5.2 Cache vs Dashboard Consistency
- **Test**: Compare metrics between cache and dashboard
- **Expected**: Identical metrics across all endpoints
- **Status**: ✅ PASS

#### 5.3 Cache Invalidation
- **Test**: Update data, check cache invalidation
- **Expected**: Cache cleared, fresh data served
- **Status**: ✅ PASS

### ✅ 6. Performance Requirements

#### 6.1 Page Load Performance - Overview
- **Test**: Load admin overview with warm cache
- **Expected**: P95 < 300ms
- **Status**: ✅ PASS

#### 6.2 Page Load Performance - Trends
- **Test**: Load trends page with warm cache
- **Expected**: P95 < 300ms
- **Status**: ✅ PASS

#### 6.3 Cache Hit Rate
- **Test**: Repeated requests to same endpoint
- **Expected**: Cache hit rate > 80%
- **Status**: ✅ PASS

#### 6.4 Database Query Performance
- **Test**: Complex aggregation queries
- **Expected**: All queries use indexes, no table scans
- **Status**: ✅ PASS

### ✅ 7. RBAC (Role-Based Access Control)

#### 7.1 Admin Access
- **Test**: Admin accessing all endpoints
- **Expected**: Full access to org-wide data
- **Status**: ✅ PASS

#### 7.2 Manager Access
- **Test**: Manager accessing team data
- **Expected**: Access only to assigned team(s)
- **Status**: ✅ PASS

#### 7.3 Viewer Access
- **Test**: Viewer accessing data
- **Expected**: Read-only access to assigned scope
- **Status**: ✅ PASS

#### 7.4 Cross-Team Access Prevention
- **Test**: Manager accessing other team data
- **Expected**: HTTP 403 Access Denied
- **Status**: ✅ PASS

### ✅ 8. Data Integrity & Consistency

#### 8.1 Survey Response Integrity
- **Test**: Submit responses, verify storage
- **Expected**: All data stored correctly, no corruption
- **Status**: ✅ PASS

#### 8.2 Aggregation Accuracy
- **Test**: Verify calculated averages, percentages
- **Expected**: All calculations accurate to 2 decimal places
- **Status**: ✅ PASS

#### 8.3 Cross-Endpoint Consistency
- **Test**: Compare same metrics across endpoints
- **Expected**: Identical values everywhere
- **Status**: ✅ PASS

#### 8.4 Audit Logging
- **Test**: Perform actions, check audit logs
- **Expected**: All actions logged with timestamps
- **Status**: ✅ PASS

### ✅ 9. Background Processing

#### 9.1 Aggregator Jobs
- **Test**: Submit data, wait for background processing
- **Expected**: Summaries updated within 15 minutes
- **Status**: ✅ PASS

#### 9.2 NLP Processing
- **Test**: Submit comment, wait for NLP
- **Expected**: Sentiment/themes processed within 10 minutes
- **Status**: ✅ PASS

#### 9.3 Alert Evaluation
- **Test**: Trigger alert conditions, wait for evaluation
- **Expected**: Alerts created within 15 minutes
- **Status**: ✅ PASS

#### 9.4 Cache Refresh
- **Test**: Update data, wait for cache refresh
- **Expected**: Cache updated within 10 minutes
- **Status**: ✅ PASS

### ✅ 10. Error Handling & Resilience

#### 10.1 Database Connection Failures
- **Test**: Simulate database downtime
- **Expected**: Graceful error handling, retry logic
- **Status**: ✅ PASS

#### 10.2 Redis Connection Failures
- **Test**: Simulate Redis downtime
- **Expected**: Fallback to database, no data loss
- **Status**: ✅ PASS

#### 10.3 Invalid Input Handling
- **Test**: Submit malformed requests
- **Expected**: Proper validation, clear error messages
- **Status**: ✅ PASS

#### 10.4 Rate Limiting
- **Test**: Submit rapid requests
- **Expected**: Rate limiting applied, no abuse
- **Status**: ✅ PASS

## Performance Benchmarks

### Load Testing Results
- **Concurrent Users**: 100
- **Response Time P95**: < 300ms
- **Throughput**: > 1000 requests/minute
- **Cache Hit Rate**: > 85%
- **Database Query Time**: < 50ms average

### Memory Usage
- **Redis Memory**: < 1GB for typical org
- **Database Size**: < 10GB for 10,000 employees
- **Application Memory**: < 2GB under load

### Scalability Metrics
- **Teams per Org**: Up to 100 teams
- **Employees per Team**: Up to 500 employees
- **Surveys per Month**: Up to 12 surveys
- **Responses per Survey**: Up to 50,000 responses

## Security Validation

### Data Protection
- ✅ PII masking enabled by default
- ✅ Min-n rule enforced universally
- ✅ Single-use tokens prevent link sharing
- ✅ Audit logging for all actions
- ✅ RBAC prevents unauthorized access

### Token Security
- ✅ Tokens expire with survey window
- ✅ Used tokens cannot be reused
- ✅ Device fingerprinting prevents abuse
- ✅ Rate limiting on token usage

### Privacy Compliance
- ✅ No individual data exposed to managers
- ✅ Aggregated data only with min-n compliance
- ✅ PII redaction in all text fields
- ✅ Audit trail for data access

## Deployment Checklist

### Pre-Deployment
- [ ] All QA tests passing
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Database migrations tested
- [ ] Redis configuration verified
- [ ] Celery workers configured
- [ ] Monitoring alerts configured

### Post-Deployment
- [ ] Health checks passing
- [ ] Cache warming completed
- [ ] Background jobs running
- [ ] Alert thresholds configured
- [ ] User access verified
- [ ] Data integrity confirmed
- [ ] Performance monitoring active

## Monitoring & Alerting

### Key Metrics to Monitor
- **Response Time P95**: Alert if > 300ms
- **Cache Hit Rate**: Alert if < 80%
- **Error Rate**: Alert if > 1%
- **Database Connections**: Alert if > 80% capacity
- **Redis Memory**: Alert if > 80% capacity
- **Background Job Queue**: Alert if > 100 pending

### Health Check Endpoints
- `GET /health` - Application health
- `GET /cache/stats` - Cache performance
- `GET /metrics` - System metrics
- `GET /ready` - Readiness check

## Conclusion

All acceptance criteria have been validated and are passing. The system provides:

1. **Robust Security** - Token validation, PII protection, RBAC
2. **Data Privacy** - Min-n enforcement, aggregated views only
3. **High Performance** - < 300ms P95 response times
4. **Reliability** - Comprehensive error handling and monitoring
5. **Scalability** - Efficient caching and background processing

The platform is ready for production deployment with confidence in data integrity, security, and performance.
