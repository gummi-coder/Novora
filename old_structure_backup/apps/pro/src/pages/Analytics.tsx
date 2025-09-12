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

const AnalyticsPage = () => {
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
    staleTime: 60000, // 1 minute stale time to reduce refetches
  });

  // Memoize handlers to prevent unnecessary re-renders
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Overview</h1>
            <p className="text-muted-foreground">Monitor key engagement metrics and trends</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <AdvancedFilters
              departments={departments}
              locations={locations}
              roles={roles}
              onFilterChange={handleFilterChange}
              className="mr-2"
            />
            
            <Tabs defaultValue="3m" className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="3m" onClick={() => setTimeRange("3m")}>3 Months</TabsTrigger>
                <TabsTrigger value="6m" onClick={() => setTimeRange("6m")}>6 Months</TabsTrigger>
                <TabsTrigger value="12m" onClick={() => setTimeRange("12m")}>12 Months</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ENPSCard />
          
          <MetricCard 
            title="Job Satisfaction" 
            value={`${data?.satisfaction.value}%`}
            change={data?.satisfaction.change}
            icon={TrendingUp}
            info="Based on recent survey responses"
            className="relative overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 w-full h-16 opacity-60">
              <MetricTrendChart 
                data={data?.satisfaction.trend} 
                gradientId="satisfaction"
              />
            </div>
            <Button 
              variant="link" 
              className="absolute bottom-1 left-6 px-0 text-xs"
              onClick={() => handleViewMetricDetails("satisfaction")}
            >
              View Details →
            </Button>
          </MetricCard>

          <MetricCard 
            title="Engagement Score" 
            value={`${data?.engagement.value}%`}
            change={data?.engagement.change}
            icon={LineChart}
            info="Aggregate from engagement questions"
            className="relative overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 w-full h-16 opacity-60">
              <MetricTrendChart 
                data={data?.engagement.trend} 
                gradientId="engagement"
              />
            </div>
            <Button 
              variant="link" 
              className="absolute bottom-1 left-6 px-0 text-xs"
              onClick={() => handleViewMetricDetails("engagement")}
            >
              View Details →
            </Button>
          </MetricCard>

          <MetricCard 
            title="Response Rate" 
            value={`${data?.responseRate.value}%`}
            change={data?.responseRate.change}
            icon={Users}
            info="Average across all surveys"
            className="relative overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 w-full h-16 opacity-60">
              <MetricTrendChart 
                data={data?.responseRate.trend} 
                gradientId="responseRate"
              />
            </div>
            <Button 
              variant="link" 
              className="absolute bottom-1 left-6 px-0 text-xs"
              onClick={() => handleViewMetricDetails("response-rate")}
            >
              View Details →
            </Button>
          </MetricCard>
        </div>

        {/* Simplified insights panel */}
        <div className="mt-8">
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInsights.map(insight => (
                  <Card key={insight.id} className="bg-card border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        {insight.type === "positive" ? (
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        )}
                        <h3 className={`font-medium ${insight.type === "positive" ? "text-emerald-600" : "text-orange-600"}`}>
                          {insight.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-muted-foreground text-sm">
                        {insight.description}
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-3 text-xs h-8" 
                        size="sm"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
