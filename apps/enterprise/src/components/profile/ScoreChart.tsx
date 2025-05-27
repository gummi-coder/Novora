
import React from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ScoreChartProps {
  data: {
    date: string;
    satisfaction: number;
    wellbeing: number;
    relationships: number;
  }[];
}

export function ScoreChart({ data }: ScoreChartProps) {
  const chartConfig = {
    satisfaction: {
      label: "Job Satisfaction",
      theme: {
        light: "#f97316",
        dark: "#f97316",
      },
    },
    wellbeing: {
      label: "Well-being",
      theme: {
        light: "#10b981",
        dark: "#10b981",
      },
    },
    relationships: {
      label: "Team Relationships",
      theme: {
        light: "#8b5cf6",
        dark: "#8b5cf6",
      },
    },
  };

  return (
    <div className="w-full aspect-[4/3] sm:aspect-[16/9]">
      <ChartContainer
        config={chartConfig}
        className="w-full h-full"
      >
        {/* Wrap the children in a React Fragment to fix the type error */}
        <>
          <LineChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Line
              type="monotone"
              dataKey="satisfaction"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="wellbeing"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="relationships"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
          <ChartLegend
            content={
              <ChartLegendContent
                className="flex justify-center mt-4"
              />
            }
          />
        </>
      </ChartContainer>
    </div>
  );
}
