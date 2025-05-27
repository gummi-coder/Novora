import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SystemStatusProps {
  status: {
    status: 'healthy' | 'degraded';
    metrics: {
      cpu: { usage: number; load: number[] };
      memory: { total: number; used: number; free: number };
      network: { bytesIn: number; bytesOut: number; connections: number };
    };
    alerts: Array<{
      id: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      timestamp: number;
    }>;
    components: {
      loadBalancer: {
        status: 'healthy' | 'degraded';
        stats: Array<{
          host: string;
          port: number;
          connections: number;
          healthy: boolean;
        }>;
      };
      cache: {
        status: 'healthy' | 'warning';
        stats: {
          size: number;
          maxSize: number;
          itemCount: number;
          utilization: number;
        };
      };
      rateLimiter: {
        status: 'healthy' | 'warning';
        stats: {
          totalTracked: number;
          activeTracked: number;
          blockedCount: number;
        };
      };
    };
  };
  metricsHistory: Array<{
    timestamp: number;
    cpu: { usage: number };
    memory: { used: number; total: number };
    network: { connections: number };
  }>;
}

export function SystemStatus({ status, metricsHistory }: SystemStatusProps) {
  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'degraded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getStatusIcon(status.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getStatusColor(status.status)}>
                {status.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {status.alerts.length} active alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(status.metrics.cpu.usage)}
            </div>
            <p className="text-xs text-muted-foreground">
              Load: {status.metrics.cpu.load.map(l => l.toFixed(2)).join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage((status.metrics.memory.used / status.metrics.memory.total) * 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(status.metrics.memory.used)} / {formatBytes(status.metrics.memory.total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status.metrics.network.connections}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(status.metrics.network.bytesIn)} in / {formatBytes(status.metrics.network.bytesOut)} out
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [value.toFixed(1), '']}
                />
                <Line
                  type="monotone"
                  dataKey="cpu.usage"
                  stroke="#8884d8"
                  name="CPU Usage"
                />
                <Line
                  type="monotone"
                  dataKey="memory.used"
                  stroke="#82ca9d"
                  name="Memory Used"
                />
                <Line
                  type="monotone"
                  dataKey="network.connections"
                  stroke="#ffc658"
                  name="Network Connections"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {status.alerts.map((alert) => (
                <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                  {getStatusIcon(alert.type)}
                  <AlertTitle>{alert.type.toUpperCase()}</AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
              {status.alerts.length === 0 && (
                <p className="text-sm text-muted-foreground">No active alerts</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Load Balancer</h4>
                <div className="mt-2 space-y-2">
                  {status.components.loadBalancer.stats.map((server) => (
                    <div key={`${server.host}:${server.port}`} className="flex items-center justify-between">
                      <span className="text-sm">
                        {server.host}:{server.port}
                      </span>
                      <Badge variant={server.healthy ? 'default' : 'destructive'}>
                        {server.connections} connections
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium">Cache</h4>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Utilization</span>
                    <Badge variant={status.components.cache.status === 'healthy' ? 'default' : 'destructive'}>
                      {formatPercentage(status.components.cache.stats.utilization)}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {formatBytes(status.components.cache.stats.size)} / {formatBytes(status.components.cache.stats.maxSize)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium">Rate Limiter</h4>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blocked Requests</span>
                    <Badge variant={status.components.rateLimiter.status === 'healthy' ? 'default' : 'destructive'}>
                      {status.components.rateLimiter.stats.blockedCount}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {status.components.rateLimiter.stats.activeTracked} active / {status.components.rateLimiter.stats.totalTracked} total
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 