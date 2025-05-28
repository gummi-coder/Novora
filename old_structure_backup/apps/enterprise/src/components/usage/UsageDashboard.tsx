import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsage } from '@/hooks/useUsage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { UsageHistoryChart } from './UsageHistoryChart';
import { UpgradePrompt } from '../subscription/UpgradePrompt';
import { useUpgradePrompt } from '@/hooks/useUpgradePrompt';
import { Subscription } from '@/types/subscription';

interface UsageMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
}

interface UsageHistoryData {
  date: string;
  activeUsers: number;
  storage: number;
  apiCalls: number;
  customReports: number;
}

type MetricKey = keyof Omit<UsageHistoryData, 'date'>;

export const UsageDashboard: React.FC = () => {
  const { subscription } = useSubscription();
  const { usage, isLoading, error } = useUsage();
  const { upgradePrompt, handleUpgrade } = useUpgradePrompt();
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('activeUsers');

  // Mock data for the history chart - replace with real data from your API
  const mockHistoryData: UsageHistoryData[] = [
    { date: '2024-01-01', activeUsers: 10, storage: 5, apiCalls: 1000, customReports: 2 },
    { date: '2024-01-02', activeUsers: 12, storage: 6, apiCalls: 1200, customReports: 3 },
    { date: '2024-01-03', activeUsers: 15, storage: 7, apiCalls: 1500, customReports: 4 },
    { date: '2024-01-04', activeUsers: 18, storage: 8, apiCalls: 1800, customReports: 5 },
    { date: '2024-01-05', activeUsers: 20, storage: 9, apiCalls: 2000, customReports: 6 },
  ];

  const metrics: UsageMetric[] = [
    {
      name: 'Active Users',
      current: usage?.activeUsers || 0,
      limit: subscription?.limits.activeUsers || 0,
      unit: 'users'
    },
    {
      name: 'Storage',
      current: usage?.storage || 0,
      limit: subscription?.limits.storage || 0,
      unit: 'GB'
    },
    {
      name: 'API Calls',
      current: usage?.apiCalls || 0,
      limit: subscription?.limits.apiCalls || 0,
      unit: 'calls'
    },
    {
      name: 'Custom Reports',
      current: usage?.customReports || 0,
      limit: subscription?.limits.customReports || 0,
      unit: 'reports'
    }
  ];

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min(Math.round((current / limit) * 100), 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (isLoading) {
    return <div>Loading usage data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load usage data</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Usage Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          Current Plan: {subscription?.tier || 'Basic'}
        </div>
      </div>

      {upgradePrompt && subscription && (
        <UpgradePrompt
          currentTier={subscription.tier}
          triggerMetric={upgradePrompt.metric}
          currentUsage={upgradePrompt.currentUsage}
          limit={upgradePrompt.limit}
          onUpgrade={handleUpgrade}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {metrics.map((metric) => {
          const percentage = getUsagePercentage(metric.current, metric.limit);
          const color = getUsageColor(percentage);

          return (
            <Card key={metric.name}>
              <CardHeader>
                <CardTitle className="text-lg">{metric.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {metric.current} / {metric.limit} {metric.unit}
                    </span>
                    <span className={color}>{percentage}%</span>
                  </div>
                  <Progress value={percentage} className={color} />
                  {percentage >= 90 && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        You're approaching your {metric.name.toLowerCase()} limit
                      </AlertDescription>
                    </Alert>
                  )}
                  {percentage < 90 && percentage >= 75 && (
                    <Alert className="mt-4">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Notice</AlertTitle>
                      <AlertDescription>
                        You're using {percentage}% of your {metric.name.toLowerCase()} limit
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UsageHistoryChart
        data={mockHistoryData}
        metric={selectedMetric}
        onMetricChange={setSelectedMetric}
      />
    </div>
  );
}; 