import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ENPSCard } from "@/components/dashboard/ENPSCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { AdvancedFilters } from "@/components/analytics/AdvancedFilters";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessMetrics } from "@/components/analytics/BusinessMetrics";
import { BusinessAnalytics } from "@/components/analytics/BusinessAnalytics";
import { BusinessMetricsDashboard } from "@/components/business/BusinessMetricsDashboard";
import { DataVisualization } from "@/components/business/DataVisualization";

// Mock data for filters
const departments = [
  { id: "eng", name: "Engineering" },
  { id: "sales", name: "Sales" },
  { id: "marketing", name: "Marketing" },
  { id: "product", name: "Product" },
  { id: "hr", name: "Human Resources" },
];

const locations = [
  { id: "sf", name: "San Francisco" },
  { id: "ny", name: "New York" },
  { id: "london", name: "London" },
  { id: "remote", name: "Remote" },
];

const roles = [
  { id: "ic", name: "Individual Contributor" },
  { id: "manager", name: "Manager" },
  { id: "director", name: "Director" },
];

// Mock insights data
const mockInsights = [
  {
    id: "insight-1",
    type: "warning" as const,
    title: "Potential Issue Identified",
    description: "Satisfaction scores in the Engineering department have dropped by 12% since last month. Consider scheduling focused discussions with team leads."
  },
  {
    id: "insight-2",
    type: "positive" as const,
    title: "Positive Trend",
    description: "Overall response rates have increased for 3 consecutive months, showing improved engagement with the feedback process."
  }
];

// Optimized mock data fetching function
const fetchAnalyticsData = async (timeRange: string, filters?: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    eNPS: {
      value: 8.2,
      change: 1.2,
      trend: [
        { date: "Jan", value: 6.5 },
        { date: "Feb", value: 7.0 },
        { date: "Mar", value: 7.2 },
        { date: "Apr", value: 7.8 },
        { date: "May", value: 8.2 },
      ]
    },
    satisfaction: {
      value: 76,
      change: 3,
      trend: [
        { date: "Jan", value: 70 },
        { date: "Feb", value: 71 },
        { date: "Mar", value: 73 },
        { date: "Apr", value: 74 },
        { date: "May", value: 76 },
      ]
    },
    engagement: {
      value: 82,
      change: -2,
      trend: [
        { date: "Jan", value: 85 },
        { date: "Feb", value: 86 },
        { date: "Mar", value: 84 },
        { date: "Apr", value: 83 },
        { date: "May", value: 82 },
      ]
    },
    responseRate: {
      value: 68,
      change: 5,
      trend: [
        { date: "Jan", value: 55 },
        { date: "Feb", value: 60 },
        { date: "Mar", value: 64 },
        { date: "Apr", value: 66 },
        { date: "May", value: 68 },
      ]
    }
  };
};

// Chart component to improve performance
interface MetricTrendChartProps {
  data: { date: string; value: number; }[];
  gradientId: string;
}

const MetricTrendChart = React.memo(({ data, gradientId }: MetricTrendChartProps) => {
  if (!data) return null;
  
  return (
    <ChartContainer config={{}} className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
  );
});

MetricTrendChart.displayName = "MetricTrendChart";

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("3m");
  const [filters, setFilters] = useState({
    departments: [],
    locations: [],
    roles: []
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', timeRange, JSON.stringify(filters)],
    queryFn: () => fetchAnalyticsData(timeRange, filters),
    staleTime: 60000,
  });

  const handleViewMetricDetails = useCallback((metric: string) => {
    navigate(`/analytics/${metric}`);
  }, [navigate]);
  
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    toast({
      title: "Filters Applied",
      description: "The analytics data has been filtered according to your selections.",
    });
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Monitor your business performance and insights</p>
          </div>
        </div>

        <Tabs defaultValue="business" className="w-full">
          <TabsList>
            <TabsTrigger value="business">Business Metrics</TabsTrigger>
            <TabsTrigger value="visualization">Data Visualization</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <BusinessMetricsDashboard />
          </TabsContent>

          <TabsContent value="visualization">
            <DataVisualization />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
