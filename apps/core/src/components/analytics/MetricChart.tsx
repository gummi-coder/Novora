
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartLegendContent 
} from "@/components/ui/chart";

export interface DataPoint {
  date: string;
  value: number;
  benchmark?: number;
}

export interface MetricChartProps {
  data: DataPoint[];
  chartType: string;
  primaryColor: string;
}

// Optimized chart component to reduce re-renders
const MetricChart = React.memo(({ data, chartType, primaryColor }: MetricChartProps) => {
  if (!data) return null;
  
  return (
    <ChartContainer
      config={{
        metric: { color: primaryColor },
        benchmark: { color: "#94a3b8" }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "line" ? (
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis domain={['auto', 'auto']} />
            <ChartTooltip />
            <ChartLegendContent />
            <Line
              type="monotone"
              dataKey="value"
              stroke={primaryColor}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              name="metric"
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#94a3b8"
              strokeDasharray="5 5"
              strokeWidth={2}
              name="benchmark"
            />
          </LineChart>
        ) : chartType === "area" ? (
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis domain={['auto', 'auto']} />
            <ChartTooltip />
            <ChartLegendContent />
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={primaryColor}
              fill="url(#colorValue)"
              name="metric"
            />
            <Area
              type="monotone"
              dataKey="benchmark"
              stroke="#94a3b8"
              fill="#94a3b850"
              strokeDasharray="5 5"
              name="benchmark"
            />
          </AreaChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis domain={['auto', 'auto']} />
            <ChartTooltip />
            <ChartLegendContent />
            <Bar dataKey="value" fill={primaryColor} name="metric" />
            <Bar dataKey="benchmark" fill="#94a3b8" name="benchmark" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
});

MetricChart.displayName = "MetricChart";

export default MetricChart;
