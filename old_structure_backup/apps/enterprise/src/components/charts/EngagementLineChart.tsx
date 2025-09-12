
import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for engagement metrics
const data = {
  '3mo': [
    { month: 'Mar', eNPS: 8, satisfaction: 7.2, engagement: 7.8 },
    { month: 'Apr', eNPS: 7, satisfaction: 7.0, engagement: 7.5 },
    { month: 'May', eNPS: 9, satisfaction: 7.4, engagement: 7.9 },
  ],
  '6mo': [
    { month: 'Dec', eNPS: 6, satisfaction: 6.8, engagement: 7.3 },
    { month: 'Jan', eNPS: 7, satisfaction: 6.9, engagement: 7.4 },
    { month: 'Feb', eNPS: 7, satisfaction: 7.0, engagement: 7.6 },
    { month: 'Mar', eNPS: 8, satisfaction: 7.2, engagement: 7.8 },
    { month: 'Apr', eNPS: 7, satisfaction: 7.0, engagement: 7.5 },
    { month: 'May', eNPS: 9, satisfaction: 7.4, engagement: 7.9 },
  ],
  '12mo': [
    { month: 'Jun', eNPS: 5, satisfaction: 6.5, engagement: 7.0 },
    { month: 'Jul', eNPS: 5, satisfaction: 6.7, engagement: 7.1 },
    { month: 'Aug', eNPS: 6, satisfaction: 6.8, engagement: 7.2 },
    { month: 'Sep', eNPS: 6, satisfaction: 6.7, engagement: 7.1 },
    { month: 'Oct', eNPS: 5, satisfaction: 6.6, engagement: 7.0 },
    { month: 'Nov', eNPS: 6, satisfaction: 6.7, engagement: 7.2 },
    { month: 'Dec', eNPS: 6, satisfaction: 6.8, engagement: 7.3 },
    { month: 'Jan', eNPS: 7, satisfaction: 6.9, engagement: 7.4 },
    { month: 'Feb', eNPS: 7, satisfaction: 7.0, engagement: 7.6 },
    { month: 'Mar', eNPS: 8, satisfaction: 7.2, engagement: 7.8 },
    { month: 'Apr', eNPS: 7, satisfaction: 7.0, engagement: 7.5 },
    { month: 'May', eNPS: 9, satisfaction: 7.4, engagement: 7.9 },
  ],
};

type TimeRange = '3mo' | '6mo' | '12mo';

export function EngagementLineChart() {
  const [activeRange, setActiveRange] = useState<TimeRange>('3mo');

  const handleRangeChange = (range: TimeRange) => {
    setActiveRange(range);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Engagement Trends</CardTitle>
        <div className="flex items-center space-x-1 text-sm">
          <Button 
            variant={activeRange === '3mo' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleRangeChange('3mo')}
          >
            3 Months
          </Button>
          <Button 
            variant={activeRange === '6mo' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleRangeChange('6mo')}
          >
            6 Months
          </Button>
          <Button 
            variant={activeRange === '12mo' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleRangeChange('12mo')}
          >
            12 Months
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data[activeRange]}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="eNPS" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#14b8a6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
