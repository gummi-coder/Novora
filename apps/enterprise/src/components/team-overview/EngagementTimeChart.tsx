
import React from 'react';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface EngagementTimeChartProps {
  timeRange: string;
  teamId: number;
}

// Mock data for team engagement over time
const mockChartData: Record<string, Record<string, { month: string; engagement: number }[]>> = {
  '1': {
    '3m': [
      { month: 'Jan', engagement: 7.8 },
      { month: 'Feb', engagement: 8.0 },
      { month: 'Mar', engagement: 8.2 },
    ],
    '6m': [
      { month: 'Oct', engagement: 7.5 },
      { month: 'Nov', engagement: 7.6 },
      { month: 'Dec', engagement: 7.7 },
      { month: 'Jan', engagement: 7.8 },
      { month: 'Feb', engagement: 8.0 },
      { month: 'Mar', engagement: 8.2 },
    ],
    '12m': [
      { month: 'Apr', engagement: 7.0 },
      { month: 'May', engagement: 7.2 },
      { month: 'Jun', engagement: 7.3 },
      { month: 'Jul', engagement: 7.4 },
      { month: 'Aug', engagement: 7.4 },
      { month: 'Sep', engagement: 7.5 },
      { month: 'Oct', engagement: 7.5 },
      { month: 'Nov', engagement: 7.6 },
      { month: 'Dec', engagement: 7.7 },
      { month: 'Jan', engagement: 7.8 },
      { month: 'Feb', engagement: 8.0 },
      { month: 'Mar', engagement: 8.2 },
    ],
  },
  '2': {
    '3m': [
      { month: 'Jan', engagement: 7.9 },
      { month: 'Feb', engagement: 7.2 },
      { month: 'Mar', engagement: 6.7 },
    ],
    '6m': [
      { month: 'Oct', engagement: 7.8 },
      { month: 'Nov', engagement: 7.9 },
      { month: 'Dec', engagement: 8.0 },
      { month: 'Jan', engagement: 7.9 },
      { month: 'Feb', engagement: 7.2 },
      { month: 'Mar', engagement: 6.7 },
    ],
    '12m': [
      { month: 'Apr', engagement: 7.0 },
      { month: 'May', engagement: 7.2 },
      { month: 'Jun', engagement: 7.4 },
      { month: 'Jul', engagement: 7.6 },
      { month: 'Aug', engagement: 7.7 },
      { month: 'Sep', engagement: 7.8 },
      { month: 'Oct', engagement: 7.8 },
      { month: 'Nov', engagement: 7.9 },
      { month: 'Dec', engagement: 8.0 },
      { month: 'Jan', engagement: 7.9 },
      { month: 'Feb', engagement: 7.2 },
      { month: 'Mar', engagement: 6.7 },
    ],
  },
};

// Make sure we have data for all team IDs 3-6
for (let i = 3; i <= 6; i++) {
  mockChartData[i.toString()] = mockChartData['1'];
}

export const EngagementTimeChart = ({ timeRange, teamId }: EngagementTimeChartProps) => {
  // Convert teamId to string to use as a key
  const teamIdKey = teamId.toString();
  
  // Default to showing 3-month data if the selected timeRange is not available
  const teamData = mockChartData[teamIdKey] || mockChartData['1'];
  const data = teamData[timeRange as keyof typeof teamData] || teamData['3m'];

  // Chart configuration
  const chartConfig = {
    engagement: {
      label: 'Engagement Score',
      color: '#3b82f6',
    }
  };

  return (
    <ChartContainer 
      config={chartConfig}
      className="h-full w-full"
    >
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#6b7280" 
          fontSize={12}
          domain={[0, 10]}
          tickLine={false}
          ticks={[0, 2, 4, 6, 8, 10]}
        />
        <ChartTooltip 
          content={<ChartTooltipContent labelKey="month" />}
        />
        <Line
          type="monotone"
          dataKey="engagement"
          stroke="var(--color-engagement)"
          strokeWidth={2}
          dot={{ fill: "var(--color-engagement)", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </LineChart>
    </ChartContainer>
  );
};
