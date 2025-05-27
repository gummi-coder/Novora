# Monitoring and Logging System

This directory contains a comprehensive monitoring and logging system for your full-stack application. The system provides:

- Structured logging with multiple transports
- Audit logging for security and compliance
- Performance monitoring with Prometheus and StatsD
- User analytics with Segment.io and Google Analytics

## Structure

- `types.ts` - Shared types and Zod schemas
- `logger.ts` - Application logging system
- `audit.ts` - Audit logging system
- `performance.ts` - Performance monitoring
- `analytics.ts` - User analytics tracking

## Logging

### Application Logs

```typescript
import { logger } from '@your-org/shared/monitoring';

// Log levels
logger.error('Error message', { context: 'value' }, error);
logger.warn('Warning message', { context: 'value' });
logger.info('Info message', { context: 'value' });
logger.debug('Debug message', { context: 'value' });
```

### Audit Logs

```typescript
import { auditLogger } from '@your-org/shared/monitoring';

// Log important actions
await auditLogger.log({
  level: 'info',
  message: 'User logged in',
  action: 'login',
  resource: 'user',
  resourceId: 'user-123',
  actor: {
    id: 'user-123',
    type: 'user',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0...',
  },
});
```

## Performance Monitoring

```typescript
import { performanceMonitor } from '@your-org/monitoring';

// Record custom metrics
await performanceMonitor.recordMetric(
  'custom_metric',
  42,
  'count',
  { tag: 'value' }
);

// Record common metrics
await performanceMonitor.recordResponseTime(
  '/api/users',
  'GET',
  150,
  200
);

await performanceMonitor.recordDatabaseQueryTime(
  'SELECT * FROM users',
  50,
  true
);

await performanceMonitor.recordMemoryUsage(1024 * 1024);
await performanceMonitor.recordCPUUsage(75);
```

## Analytics

```typescript
import { analytics } from '@your-org/shared/monitoring';

// Track events
await analytics.track('button_click', {
  buttonId: 'submit',
  page: 'checkout',
});

// Identify users
await analytics.identify('user-123', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Track common events
await analytics.trackPageView('/dashboard');
await analytics.trackButtonClick('save');
await analytics.trackFormSubmit('signup', true);
```

## Configuration

### Logging

Configure logging transports in your environment:

```env
# Logging
LOG_LEVEL=info
LOG_DIR=logs
LOG_FORMAT=json
```

### Performance Monitoring

Configure monitoring endpoints:

```env
# Prometheus
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# StatsD
STATSD_HOST=localhost
STATSD_PORT=8125
```

### Analytics

Configure analytics providers:

```env
# Segment.io
SEGMENT_WRITE_KEY=your-write-key

# Google Analytics
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

## Best Practices

### Logging

1. Use appropriate log levels:
   - ERROR: Application errors that need immediate attention
   - WARN: Unexpected but handled situations
   - INFO: Important business events
   - DEBUG: Detailed information for debugging

2. Include context in logs:
   - Request ID for request tracing
   - User ID for user-related events
   - Relevant business data
   - Stack traces for errors

3. Structure your logs:
   - Use JSON format for machine readability
   - Include timestamps in ISO format
   - Add consistent metadata fields

### Audit Logging

1. Log all security-relevant events:
   - Authentication attempts
   - Authorization changes
   - Data access
   - Configuration changes

2. Include detailed context:
   - Who performed the action
   - What was changed
   - When it happened
   - From where it was performed

3. Store audit logs securely:
   - Use a separate database
   - Implement retention policies
   - Enable tamper detection

### Performance Monitoring

1. Monitor key metrics:
   - Response times
   - Error rates
   - Resource usage
   - Business metrics

2. Set up alerts:
   - Define thresholds
   - Configure notifications
   - Create runbooks

3. Use appropriate tools:
   - Prometheus for metrics collection
   - Grafana for visualization
   - AlertManager for notifications

### Analytics

1. Track meaningful events:
   - User journeys
   - Feature usage
   - Conversion points
   - Error patterns

2. Respect user privacy:
   - Implement consent management
   - Anonymize sensitive data
   - Follow data retention policies

3. Use analytics data:
   - Improve user experience
   - Guide product decisions
   - Measure business impact 