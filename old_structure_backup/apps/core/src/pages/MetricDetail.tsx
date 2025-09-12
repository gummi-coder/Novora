import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileSpreadsheet,
  FileText,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  BarChart3,
  Grid2X2
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AnalyticsDateRangePicker } from "@/components/analytics/AnalyticsDateRangePicker";
import { useToast } from "@/hooks/use-toast";
import { HeatmapView } from "@/components/analytics/HeatmapView";
import { AdvancedFilters } from "@/components/analytics/AdvancedFilters";
import MetricChart from "@/components/analytics/MetricChart";

// Mock data fetch function - optimized by reducing data points
const fetchMetricData = async (metricId: string, dateRange: { from: Date, to: Date }) => {
  console.log(`Fetching data for ${metricId} from ${dateRange.from} to ${dateRange.to}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data for different metrics
  switch (metricId) {
    case "satisfaction":
      return {
        name: "Job Satisfaction",
        description: "Overall satisfaction with work environment, role, and company",
        currentScore: 76,
        change: 3,
        benchmarkScore: 72,
        benchmarkLabel: "Industry Average",
        primaryColor: "#4f46e5",
        data: generateOptimizedTimeSeriesData(76, dateRange, 3),
      };
    case "engagement":
      return {
        name: "Employee Engagement",
        description: "Measure of employee enthusiasm, dedication and connection to company",
        currentScore: 82,
        change: -2,
        benchmarkScore: 78,
        benchmarkLabel: "Industry Average",
        primaryColor: "#06b6d4",
        data: generateOptimizedTimeSeriesData(82, dateRange, -2),
      };
    case "response-rate":
      return {
        name: "Survey Response Rate",
        description: "Percentage of employees completing surveys",
        currentScore: 68,
        change: 5,
        benchmarkScore: 62,
        benchmarkLabel: "Industry Average",
        primaryColor: "#14b8a6",
        data: generateOptimizedTimeSeriesData(68, dateRange, 5),
      };
    default:
      // eNPS data
      return {
        name: "Employee Net Promoter Score",
        description: "Likelihood that employees would recommend company as a place to work",
        currentScore: 8.2,
        change: 1.2,
        benchmarkScore: 7.6,
        benchmarkLabel: "Industry Average",
        primaryColor: "#6366f1",
        data: generateOptimizedTimeSeriesData(8.2, dateRange, 1.2, 0, 10),
      };
  }
};

// Optimized function to generate fewer data points based on date range size
function generateOptimizedTimeSeriesData(
  currentValue: number, 
  dateRange: { from: Date, to: Date }, 
  trend: number, 
  min = 0, 
  max = 100
) {
  const data = [];
  const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
  
  // Adjust the interval based on the date range to limit data points
  // For long ranges, generate fewer points to improve performance
  const interval = Math.max(1, Math.floor(days / (days > 180 ? 15 : 30)));
  
  let value = currentValue - trend;
  
  // Generate no more than ~30 data points regardless of range
  const maxPoints = 30;
  const targetInterval = Math.max(interval, Math.floor(days / maxPoints));
  
  for (let i = 0; i < days; i += targetInterval) {
    const date = new Date(dateRange.from.getTime() + i * (1000 * 60 * 60 * 24));
    
    // Add some noise to the data
    const noise = (Math.random() - 0.5) * 5;
    let newValue = value + noise;
    
    // Add trend over time
    const trendFactor = trend * (i / days);
    newValue += trendFactor;
    
    // Keep within bounds
    newValue = Math.max(min, Math.min(max, newValue));
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Number(newValue.toFixed(1)),
      benchmark: Number((currentValue - trend - (trend * 0.5) + (Math.random() - 0.5) * 3).toFixed(1))
    });
  }
  
  return data;
};

// Mock departments, locations, and roles data
const departments = [
  { id: "eng", name: "Engineering" },
  { id: "sales", name: "Sales" },
  { id: "marketing", name: "Marketing" },
  { id: "product", name: "Product" },
  { id: "design", name: "Design" },
  { id: "hr", name: "Human Resources" },
  { id: "customer", name: "Customer Support" }
];

const locations = [
  { id: "sf", name: "San Francisco" },
  { id: "ny", name: "New York" },
  { id: "london", name: "London" },
  { id: "singapore", name: "Singapore" },
  { id: "remote", name: "Remote" }
];

const roles = [
  { id: "ic", name: "Individual Contributor" },
  { id: "manager", name: "Manager" },
  { id: "director", name: "Director" },
  { id: "executive", name: "Executive" },
  { id: "intern", name: "Intern" }
];

// Simplified metric detail page with performance optimizations
const MetricDetail = () => {
  const { metricId = "enps" } = useParams();
  const { toast } = useToast();
  
  // Local state for filters and options
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    to: new Date()
  });
  const [filters, setFilters] = useState({
    departments: [],
    locations: [],
    roles: []
  });
  const [selectedView, setSelectedView] = useState("timeSeries");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['metricDetail', metricId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: () => fetchMetricData(metricId, dateRange),
    staleTime: 60000, // Keep data fresh for 1 minute
  });
  
  // Memoize handlers to prevent re-renders
  const handleDownloadCSV = useCallback(() => {
    toast({
      title: "Downloaded CSV",
      description: `${data?.name} data has been downloaded as CSV.`
    });
  }, [data?.name, toast]);
  
  const handleDownloadPDF = useCallback(() => {
    toast({
      title: "Downloaded PDF Report",
      description: `${data?.name} report has been downloaded as PDF.`
    });
  }, [data?.name, toast]);
  
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    toast({
      title: "Filters Applied",
      description: "The data has been filtered according to your selections.",
    });
  }, [toast]);
  
  // Calculate summary statistics with memoization 
  const summaryStats = useMemo(() => {
    if (!data?.data || !data.data.length) {
      return {
        highest: "—",
        lowest: "—",
        average: "—",
        stdDev: "—"
      };
    }
    
    const values = data.data.map(d => d.value);
    const highest = Math.max(...values).toFixed(1);
    const lowest = Math.min(...values).toFixed(1);
    const average = (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1);
    
    // Fake standard deviation for demo
    const stdDev = (Math.random() * 5 + 2).toFixed(1);
    
    return { highest, lowest, average, stdDev };
  }, [data?.data]);

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full max-w-lg" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 md:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-xl font-semibold text-red-500">Error loading metric data</h2>
          <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with title and description */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{data?.name}</h1>
              <p className="text-muted-foreground">{data?.description}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadCSV}
                className="gap-1.5"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadPDF}
                className="gap-1.5"
              >
                <FileText className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
        
        {/* Filters and controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <AdvancedFilters 
                  departments={departments}
                  locations={locations}
                  roles={roles}
                  onFilterChange={handleFilterChange}
                />
                
                <Tabs value={selectedView} onValueChange={setSelectedView} className="hidden sm:block">
                  <TabsList>
                    <TabsTrigger value="timeSeries" className="text-xs">
                      <LineChartIcon className="h-4 w-4 mr-1.5" />
                      Time Series
                    </TabsTrigger>
                    <TabsTrigger value="heatmap" className="text-xs">
                      <Grid2X2 className="h-4 w-4 mr-1.5" />
                      Heatmap
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {selectedView === "timeSeries" && (
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">
                        <div className="flex items-center">
                          <LineChartIcon className="h-4 w-4 mr-1.5" />
                          Line Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="area">
                        <div className="flex items-center">
                          <AreaChartIcon className="h-4 w-4 mr-1.5" />
                          Area Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="bar">
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1.5" />
                          Bar Chart
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <AnalyticsDateRangePicker
                dateRange={dateRange}
                onUpdate={setDateRange}
                className="w-full sm:w-auto"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Main content area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {selectedView === "timeSeries" ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>
                    {data?.name} Trends
                    {filters.departments.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {filters.departments.length} department filter{filters.departments.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {filters.locations.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {filters.locations.length} location filter{filters.locations.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {filters.roles.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {filters.roles.length} role filter{filters.roles.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {data && data.data && (
                      <MetricChart 
                        data={data.data} 
                        chartType={chartType}
                        primaryColor={data.primaryColor}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <HeatmapView 
                metricType={metricId}
                departments={filters.departments.length > 0 ? departments
                  .filter(dept => filters.departments.includes(dept.id))
                  .map(dept => dept.name) : undefined}
                dateRange={dateRange}
              />
            )}
            
            {/* Benchmark Panel */}
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle>Benchmark Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 p-4 border rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-1">Your Score</div>
                    <div className="text-4xl font-bold">{data?.currentScore}</div>
                    {data?.change && (
                      <div className={`text-sm mt-2 ${data.change > 0 ? 'text-emerald-600' : data.change < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                        {data.change > 0 ? '↑' : data.change < 0 ? '↓' : '–'} {Math.abs(data.change)}% vs last period
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 p-4 border border-dashed rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-1">{data?.benchmarkLabel}</div>
                    <div className="text-4xl font-bold text-muted-foreground">{data?.benchmarkScore}</div>
                    <div className={`text-sm mt-2 ${(data?.currentScore || 0) >= (data?.benchmarkScore || 0) ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {(data?.currentScore || 0) >= (data?.benchmarkScore || 0) ? '↑' : '↓'} {Math.abs(((data?.currentScore || 0) - (data?.benchmarkScore || 0)) / (data?.benchmarkScore || 1) * 100).toFixed(1)}% vs benchmark
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            {/* Summary Statistics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Summary Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Highest value</span>
                  <span className="font-medium">{summaryStats.highest}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Lowest value</span>
                  <span className="font-medium">{summaryStats.lowest}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Average</span>
                  <span className="font-medium">{summaryStats.average}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Standard deviation</span>
                  <span className="font-medium">±{summaryStats.stdDev}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Simplified insights panel */}
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 text-xs">i</span>
                    </div>
                    <span>
                      {data?.change && data.change > 0 
                        ? `Showing an upward trend of ${data.change}% since last period` 
                        : `Changed by ${data?.change || 0}% since last period`}
                    </span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 text-xs">i</span>
                    </div>
                    <span>
                      {(data?.currentScore || 0) > (data?.benchmarkScore || 0)
                        ? `Performing above industry benchmark by ${((data?.currentScore || 0) - (data?.benchmarkScore || 0)).toFixed(1)} points`
                        : `Currently ${((data?.benchmarkScore || 0) - (data?.currentScore || 0)).toFixed(1)} points below industry benchmark`}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MetricDetail;
