import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UsageHistoryData {
  date: string;
  activeUsers: number;
  storage: number;
  apiCalls: number;
  customReports: number;
}

interface UsageHistoryChartProps {
  data: UsageHistoryData[];
  metric: keyof Omit<UsageHistoryData, 'date'>;
  onMetricChange: (metric: keyof Omit<UsageHistoryData, 'date'>) => void;
}

export const UsageHistoryChart: React.FC<UsageHistoryChartProps> = ({
  data,
  metric,
  onMetricChange,
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatValue = (value: number) => {
    if (metric === 'storage') {
      return `${value} GB`;
    }
    return value.toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Usage History</CardTitle>
        <Select
          value={metric}
          onValueChange={(value: keyof Omit<UsageHistoryData, 'date'>) =>
            onMetricChange(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activeUsers">Active Users</SelectItem>
            <SelectItem value="storage">Storage</SelectItem>
            <SelectItem value="apiCalls">API Calls</SelectItem>
            <SelectItem value="customReports">Custom Reports</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatValue}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [formatValue(value), metric]}
                labelFormatter={formatDate}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 