import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SystemStatus } from '@/components/infrastructure/SystemStatus';
import { MonitoringService } from '../../../infrastructure/monitoring';
import { LoadBalancer } from '../../../infrastructure/loadBalancer';
import { Cache } from '../../../infrastructure/cache';
import { RateLimiter } from '../../../infrastructure/rateLimiter';
import { InfrastructureConfig } from '../../../infrastructure/config';

const defaultConfig: InfrastructureConfig = {
  servers: [
    {
      host: 'localhost',
      port: 3000,
      weight: 1,
      healthCheck: {
        path: '/health',
        interval: 30000,
        timeout: 5000,
        unhealthyThreshold: 3,
      },
    },
    {
      host: 'localhost',
      port: 3001,
      weight: 1,
      healthCheck: {
        path: '/health',
        interval: 30000,
        timeout: 5000,
        unhealthyThreshold: 3,
      },
    },
  ],
  loadBalancer: {
    algorithm: 'round-robin',
  },
  cache: {
    maxSize: 100 * 1024 * 1024, // 100MB
    defaultTTL: 3600000, // 1 hour
  },
  rateLimiter: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    blockDuration: 300000, // 5 minutes
  },
};

export function SystemStatusPage() {
  const [status, setStatus] = useState<any>(null);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);

  useEffect(() => {
    // Initialize infrastructure components
    const loadBalancer = new LoadBalancer(defaultConfig);
    const cache = new Cache(defaultConfig.cache.maxSize, defaultConfig.cache.defaultTTL);
    const rateLimiter = new RateLimiter(defaultConfig.rateLimiter);
    const monitoringService = new MonitoringService(loadBalancer, cache, rateLimiter);

    // Update status and metrics every 5 seconds
    const interval = setInterval(() => {
      const currentStatus = monitoringService.getSystemStatus();
      const currentMetrics = monitoringService.getMetrics({
        start: Date.now() - 3600000, // Last hour
        end: Date.now(),
      });

      setStatus(currentStatus);
      setMetricsHistory(currentMetrics);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-muted-foreground">Loading system status...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">System Status</h1>
        <SystemStatus status={status} metricsHistory={metricsHistory} />
      </div>
    </DashboardLayout>
  );
} 