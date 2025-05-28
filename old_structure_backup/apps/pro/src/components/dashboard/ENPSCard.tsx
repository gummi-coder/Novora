
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  Tooltip
} from "recharts";

const sparklineData = [
  { month: 'Jan', score: 6 },
  { month: 'Feb', score: 7 },
  { month: 'Mar', score: 8 },
  { month: 'Apr', score: 7 },
  { month: 'May', score: 9 },
];

export function ENPSCard() {
  // Logic to determine eNPS rating
  const currentScore = sparklineData[sparklineData.length - 1].score;
  
  let rating = "";
  let ratingColor = "";
  
  if (currentScore >= 9) {
    rating = "Excellent";
    ratingColor = "bg-green-100 text-green-800";
  } else if (currentScore >= 7) {
    rating = "Good";
    ratingColor = "bg-blue-100 text-blue-800";
  } else if (currentScore >= 4) {
    rating = "Average";
    ratingColor = "bg-yellow-100 text-yellow-800";
  } else if (currentScore >= 0) {
    rating = "Needs Improvement";
    ratingColor = "bg-orange-100 text-orange-800";
  } else {
    rating = "Critical";
    ratingColor = "bg-red-100 text-red-800";
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">eNPS Score</CardTitle>
            <CardDescription>Employee Net Promoter Score</CardDescription>
          </div>
          <Badge className={ratingColor}>{rating}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-blue-700">{currentScore}</div>
          <div className="w-32 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Tooltip 
                  formatter={(value) => [`Score: ${value}`, 'eNPS']}
                  labelFormatter={(label) => sparklineData[label].month}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="text-teal-600 font-medium">+2 points</span> increase since last quarter
        </div>
      </CardContent>
    </Card>
  );
}
