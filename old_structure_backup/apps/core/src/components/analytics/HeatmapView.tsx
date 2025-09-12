
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  ChartContainer, 
  ChartTooltip 
} from "@/components/ui/chart";
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ScatterChart, 
  Scatter, 
  Legend,
  Cell
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface HeatmapViewProps {
  metricType: string;
  departments?: string[];
  dateRange: { from: Date; to: Date };
}

interface HeatmapDataPoint {
  department: string;
  month: string;
  score: number;
  monthIndex: number;
}

// Mock data fetching function
const fetchHeatmapData = async (metricType: string, dateRange: { from: Date; to: Date }, departments?: string[]) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const depts = departments?.length ? departments : ['Engineering', 'Marketing', 'Sales', 'Product', 'Customer Support', 'HR'];
  
  // Generate months between from and to dates
  const months: string[] = [];
  const startDate = new Date(dateRange.from);
  const endDate = new Date(dateRange.to);
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    months.push(new Date(currentDate).toLocaleString('default', { month: 'short', year: '2-digit' }));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  // Generate mock heatmap data
  return depts.flatMap(dept => 
    months.map((month, i) => {
      // Create somewhat realistic patterns
      const baseValue = dept === 'HR' ? 85 : 
                       dept === 'Engineering' ? 75 : 
                       dept === 'Customer Support' ? 65 : 
                       dept === 'Sales' ? 80 : 
                       dept === 'Marketing' ? 78 : 70;
                       
      // Add some variability but keep trends
      const trend = Math.sin(i / 2) * 10;
      const random = Math.random() * 15 - 7.5;
      let score = baseValue + trend + random;
      
      // Ensure score is within reasonable range
      score = Math.max(40, Math.min(95, score));
      
      return {
        department: dept,
        month,
        score: Math.round(score),
        monthIndex: i
      };
    })
  );
};

// Helper function to determine color based on score
const getColorForScore = (score: number) => {
  if (score >= 85) return "#15803d"; // Dark green
  if (score >= 75) return "#22c55e"; // Green
  if (score >= 65) return "#eab308"; // Yellow
  if (score >= 55) return "#f97316"; // Orange
  return "#ef4444"; // Red
};

interface CellProps {
  index: number;
  dataItem: HeatmapDataPoint;
  width: number;
  height: number;
}

// Create a custom cell component for the scatter chart
const CustomCell = React.memo(({ index, dataItem, width, height }: CellProps) => {
  if (!dataItem) return null;
  
  return (
    <rect
      key={`cell-${index}`}
      x={0}
      y={0}
      width={width}
      height={height}
      fill={getColorForScore(dataItem.score)}
      style={{ opacity: 0.9 }}
    />
  );
});

CustomCell.displayName = "CustomCell";

export function HeatmapView({ metricType, departments, dateRange }: HeatmapViewProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['heatmapData', metricType, dateRange, departments],
    queryFn: () => fetchHeatmapData(metricType, dateRange, departments),
  });
  
  const uniqueDepartments = React.useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map(item => item.department)));
  }, [data]);
  
  const uniqueMonths = React.useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map(item => item.month)));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department × Time Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Department × Time Sentiment Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] mt-4">
          <ChartContainer config={{}} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 100, left: 120 }}
              >
                <XAxis 
                  dataKey="monthIndex" 
                  type="number" 
                  name="Month" 
                  tick={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  dataKey="department" 
                  type="category"
                  tick={{ fontSize: 12 }} 
                  width={100}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HeatmapDataPoint;
                      return (
                        <div className="p-2 bg-background border rounded shadow-md">
                          <p className="font-medium">{data.department}</p>
                          <p className="text-sm">{data.month}</p>
                          <p className="text-sm font-semibold mt-1">Score: {data.score}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={data}>
                  {data?.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={getColorForScore(entry.score)}
                    />
                  ))}
                </Scatter>
                <Legend 
                  content={() => (
                    <div className="flex justify-center mt-4">
                      {uniqueMonths.map((month, index) => (
                        <div key={month} style={{ position: 'absolute', left: `${(index / uniqueMonths.length * 80) + 10}%`, bottom: '-50px' }}>
                          <p className="text-xs transform -rotate-45">{month}</p>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
