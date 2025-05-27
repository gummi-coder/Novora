
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { department: 'Engineering', participants: 87, responseRate: 87 },
  { department: 'Marketing', participants: 75, responseRate: 75 },
  { department: 'Sales', participants: 92, responseRate: 92 },
  { department: 'HR', participants: 95, responseRate: 95 },
  { department: 'Finance', participants: 72, responseRate: 72 },
  { department: 'Product', participants: 83, responseRate: 83 },
];

export function SurveyParticipationChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Survey Participation by Department</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="department" />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Response Rate']}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar 
                dataKey="responseRate" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="responseRate" position="top" formatter={(value) => `${value}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
