import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface BusinessMetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: { date: string; value: number; }[];
  gradientId: string;
}

const BusinessMetricCard: React.FC<BusinessMetricCardProps> = ({
  title,
  value,
  change,
  icon,
  trend,
  gradientId
}) => {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}% from last period
        </div>
        <div className="h-[60px] mt-4">
          <ChartContainer config={{}} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <ChartTooltip />
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fill={`url(#${gradientId})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const BusinessMetrics: React.FC = () => {
  // Mock data - replace with real data from your API
  const metrics = {
    revenue: {
      title: "Total Revenue",
      value: "$124,563",
      change: 12.5,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      trend: [
        { date: "Jan", value: 85000 },
        { date: "Feb", value: 95000 },
        { date: "Mar", value: 110000 },
        { date: "Apr", value: 115000 },
        { date: "May", value: 124563 },
      ]
    },
    customers: {
      title: "Active Customers",
      value: "2,345",
      change: 8.2,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      trend: [
        { date: "Jan", value: 1800 },
        { date: "Feb", value: 1950 },
        { date: "Mar", value: 2100 },
        { date: "Apr", value: 2200 },
        { date: "May", value: 2345 },
      ]
    },
    growth: {
      title: "Growth Rate",
      value: "23.4%",
      change: 4.1,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      trend: [
        { date: "Jan", value: 15 },
        { date: "Feb", value: 17 },
        { date: "Mar", value: 19 },
        { date: "Apr", value: 21 },
        { date: "May", value: 23.4 },
      ]
    },
    engagement: {
      title: "Customer Engagement",
      value: "89%",
      change: -2.1,
      icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
      trend: [
        { date: "Jan", value: 85 },
        { date: "Feb", value: 87 },
        { date: "Mar", value: 90 },
        { date: "Apr", value: 91 },
        { date: "May", value: 89 },
      ]
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <BusinessMetricCard
        {...metrics.revenue}
        gradientId="revenue-gradient"
      />
      <BusinessMetricCard
        {...metrics.customers}
        gradientId="customers-gradient"
      />
      <BusinessMetricCard
        {...metrics.growth}
        gradientId="growth-gradient"
      />
      <BusinessMetricCard
        {...metrics.engagement}
        gradientId="engagement-gradient"
      />
    </div>
  );
}; 