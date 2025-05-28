
import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface TeamMetricsChartProps {
  teamId: number;
}

// Mock data for team metrics
const mockMetricsData: Record<string, { name: string; value: number }[]> = {
  '1': [
    { name: 'eNPS', value: 15 },
    { name: 'Job Satisfaction', value: 8.4 },
    { name: 'Happiness Index', value: 8.3 },
    { name: 'Mgmt Relations', value: 8.1 },
    { name: 'Peer Relations', value: 8.6 },
    { name: 'Recognition', value: 7.8 },
  ],
  '2': [
    { name: 'eNPS', value: -5 },
    { name: 'Job Satisfaction', value: 6.2 },
    { name: 'Happiness Index', value: 6.4 },
    { name: 'Mgmt Relations', value: 5.8 },
    { name: 'Peer Relations', value: 7.4 },
    { name: 'Recognition', value: 6.1 },
  ],
};

// Fill in mock data for teams 3-6
for (let i = 3; i <= 6; i++) {
  mockMetricsData[i.toString()] = mockMetricsData['1'].map(item => ({
    ...item,
    value: item.value + Math.random() * 2 - 1 // Add some variation
  }));
}

export const TeamMetricsChart = ({ teamId }: TeamMetricsChartProps) => {
  const teamIdKey = teamId.toString();
  const data = mockMetricsData[teamIdKey] || mockMetricsData['1'];

  // Adjust the eNPS scale for visualization
  // eNPS is typically -100 to 100, but we want to show it on a 0-10 scale like other metrics
  const adjustedData = data.map(item => {
    if (item.name === 'eNPS') {
      // Convert eNPS to a 0-10 scale
      const adjustedValue = (item.value + 100) / 20;
      return { ...item, value: adjustedValue, originalValue: item.value };
    }
    return item;
  });

  // Chart configuration
  const chartConfig = {
    value: {
      label: 'Score',
      color: '#3b82f6', 
    },
  };
  
  // Custom tooltip to show correct eNPS values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const value = data.name === 'eNPS' ? data.originalValue : data.value;
    
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="font-medium text-sm">{data.name}</p>
        <p className="text-sm">{`Score: ${value}`}</p>
      </div>
    );
  };

  return (
    <ChartContainer 
      config={chartConfig}
      className="h-full w-full"
    >
      <BarChart
        data={adjustedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280" 
          fontSize={12}
          tickLine={false}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke="#6b7280" 
          fontSize={12}
          domain={[0, 10]}
          tickLine={false}
          ticks={[0, 2, 4, 6, 8, 10]}
        />
        <ChartTooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
};
