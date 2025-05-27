# Deployment Guide

This guide covers the deployment process for all environments (development, staging, and production) and includes monitoring, logging, and maintenance procedures.

## Environment Setup

### 1. Prerequisites

- Kubernetes cluster (v1.20+)
- Helm (v3.0+)
- kubectl configured
- Docker registry access
- Cloud provider credentials

### 2. Environment Variables

Create environment-specific `.env` files:

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-secret
```

### 3. Secrets Management

1. **Create Kubernetes Secrets**
   ```bash
   kubectl create secret generic app-secrets \
     --from-literal=database-url=$DATABASE_URL \
     --from-literal=jwt-secret=$JWT_SECRET \
     --from-literal=redis-url=$REDIS_URL
   ```

2. **Using Helm Secrets**
   ```bash
   helm secrets upgrade --install my-app ./helm \
     --set secrets.databaseUrl=$DATABASE_URL \
     --set secrets.jwtSecret=$JWT_SECRET
   ```

## Deployment Procedures

### 1. Development Environment

```bash
# Deploy to development
helm upgrade --install my-app-dev ./helm \
  --namespace development \
  --values ./helm/values-dev.yaml

# Verify deployment
kubectl get pods -n development
kubectl get services -n development
```

### 2. Staging Environment

```bash
# Deploy to staging
helm upgrade --install my-app-staging ./helm \
  --namespace staging \
  --values ./helm/values-staging.yaml

# Run smoke tests
npm run test:smoke
```

### 3. Production Environment

```bash
# Deploy to production
helm upgrade --install my-app-prod ./helm \
  --namespace production \
  --values ./helm/values-prod.yaml

# Verify deployment
kubectl get pods -n production
kubectl get services -n production
```

## Monitoring and Logging

### 1. Prometheus Setup

```yaml
# prometheus-values.yaml
server:
  global:
    scrape_interval: 15s
  rule_files:
    - /etc/prometheus/rules/*.yaml
  scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
        - role: pod
```

### 2. Grafana Dashboards

- Service health dashboard
- Resource utilization dashboard
- Business metrics dashboard
- Error rate dashboard

### 3. Logging Configuration

```yaml
# logging-values.yaml
elasticsearch:
  enabled: true
  persistence:
    enabled: true
kibana:
  enabled: true
filebeat:
  enabled: true
```

## Backup and Recovery

### 1. Database Backups

```bash
# Create backup
pg_dump -U user -d database > backup.sql

# Schedule backups
kubectl create cronjob db-backup \
  --image=postgres:13 \
  --schedule="0 0 * * *" \
  -- /bin/sh -c "pg_dump -U user -d database > /backup/backup-$(date +%Y%m%d).sql"
```

### 2. Configuration Backups

```bash
# Backup Kubernetes resources
kubectl get all -n production -o yaml > k8s-backup.yaml

# Backup Helm values
helm get values my-app-prod > helm-values-backup.yaml
```

## Scaling and Performance

### 1. Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. Resource Limits

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

## Security

### 1. Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: my-app-network-policy
spec:
  podSelector:
    matchLabels:
      app: my-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend
```

### 2. Security Context

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  capabilities:
    drop:
    - ALL
```

## Maintenance

### 1. Regular Updates

```bash
# Update dependencies
npm update

# Update container images
kubectl set image deployment/my-app my-app=my-app:new-version

# Update Helm chart
helm upgrade my-app ./helm
```

### 2. Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 15
  periodSeconds: 20
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

## Troubleshooting

### 1. Common Issues

1. **Pod CrashLoopBackOff**
   ```bash
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

2. **Service Unavailable**
   ```bash
   kubectl get endpoints
   kubectl describe service <service-name>
   ```

3. **Database Connection Issues**
   ```bash
   kubectl exec -it <pod-name> -- psql -U user -d database
   ```

### 2. Debugging Tools

```bash
# Get pod logs
kubectl logs -f <pod-name>

# Port forward
kubectl port-forward <pod-name> 3000:3000

# Exec into pod
kubectl exec -it <pod-name> -- /bin/sh
```

## Rollback Procedures

### 1. Helm Rollback

```bash
# List releases
helm list

# Rollback to previous version
helm rollback my-app 1

# Rollback to specific version
helm rollback my-app 2
```

### 2. Database Rollback

```bash
# Restore from backup
psql -U user -d database < backup.sql

# Point-in-time recovery
pg_restore -U user -d database -t table_name backup.dump
```

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/) 