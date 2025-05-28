import { useState, useEffect } from "react";
import { Users, Activity, TrendingUp, Clock, BarChart3, LineChart as LucideLineChart, PieChart, Filter, Download, AlertCircle, Calendar, Target, Zap, Bell, Settings2, Share2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { engagementService, type EngagementMetric, type FeatureUsage, type CohortData, type UserActivity } from "@/services/engagement";

interface GoalProgress {
  name: string;
  current: number;
  target: number;
  unit: string;
}

interface FeatureAdoptionData {
  date: string;
  dashboard: number;
  reports: number;
  analytics: number;
  settings: number;
}

interface CohortAnalysisData {
  week: string;
  "Jan 2024": number;
  "Feb 2024": number;
  "Mar 2024": number;
}

const EngagementPage = () => {
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [showRealTime, setShowRealTime] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<EngagementMetric[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsData, featureUsageData, cohortData, activityData] = await Promise.all([
        engagementService.getMetrics(timeRange),
        engagementService.getFeatureUsage(),
        engagementService.getCohortAnalysis(),
        engagementService.getRecentActivity(),
      ]);

      setMetrics(metricsData);
      setFeatureUsage(featureUsageData);
      setCohorts(cohortData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch engagement data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  useEffect(() => {
    if (showRealTime) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [showRealTime]);

  const [goals] = useState<GoalProgress[]>([
    {
      name: "Monthly Active Users",
      current: 5678,
      target: 10000,
      unit: "users",
    },
    {
      name: "Feature Adoption",
      current: 65,
      target: 80,
      unit: "%",
    },
    {
      name: "User Retention",
      current: 75,
      target: 85,
      unit: "%",
    },
  ]);

  const [featureAdoptionData] = useState<FeatureAdoptionData[]>([
    { date: "Week 1", dashboard: 65, reports: 45, analytics: 30, settings: 20 },
    { date: "Week 2", dashboard: 70, reports: 50, analytics: 35, settings: 25 },
    { date: "Week 3", dashboard: 75, reports: 55, analytics: 40, settings: 28 },
    { date: "Week 4", dashboard: 80, reports: 60, analytics: 45, settings: 30 },
    { date: "Week 5", dashboard: 85, reports: 65, analytics: 50, settings: 32 },
    { date: "Week 6", dashboard: 88, reports: 68, analytics: 52, settings: 35 },
    { date: "Week 7", dashboard: 90, reports: 70, analytics: 55, settings: 38 },
  ]);

  const [cohortAnalysisData] = useState<CohortAnalysisData[]>([
    { week: "Week 1", "Jan 2024": 100, "Feb 2024": 100, "Mar 2024": 100 },
    { week: "Week 2", "Jan 2024": 85, "Feb 2024": 90, "Mar 2024": 95 },
    { week: "Week 3", "Jan 2024": 75, "Feb 2024": 85, "Mar 2024": 90 },
    { week: "Week 4", "Jan 2024": 65, "Feb 2024": 80, "Mar 2024": 85 },
    { week: "Week 5", "Jan 2024": 60, "Feb 2024": 75, "Mar 2024": 80 },
    { week: "Week 6", "Jan 2024": 55, "Feb 2024": 70, "Mar 2024": 75 },
    { week: "Week 7", "Jan 2024": 50, "Feb 2024": 65, "Mar 2024": 70 },
  ]);

  const getTrendIcon = (trend: EngagementMetric["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
      case "stable":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Engagement</h1>
          <p className="text-muted-foreground">
            Track user engagement and activity metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchData}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            <Label htmlFor="realtime">Real-time</Label>
            <Switch
              id="realtime"
              checked={showRealTime}
              onCheckedChange={setShowRealTime}
              disabled={loading}
            />
          </div>
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Cohorts
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <TabsContent value="overview" className="space-y-4">
              {/* Goals Progress */}
              <div className="grid gap-4 md:grid-cols-3">
                {goals.map((goal) => (
                  <Card key={goal.name} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {goal.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{goal.current.toLocaleString()}{goal.unit}</span>
                          <span className="text-muted-foreground">{goal.target.toLocaleString()}{goal.unit}</span>
                        </div>
                        <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {((goal.current / goal.target) * 100).toFixed(1)}% of target
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Engagement Summary & Health */}
              <div className="grid gap-4 md:grid-cols-4">
                {metrics.map((metric) => (
                  <Card key={metric.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {metric.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(metric.trend)}
                        <span
                          className={
                            metric.trend === "up"
                              ? "text-success"
                              : metric.trend === "down"
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }
                        >
                          {metric.change > 0 ? "+" : ""}
                          {metric.change}%
                        </span>
                        <span className="text-muted-foreground">vs last period</span>
                      </div>
                      {metric.sparkline && (
                        <div className="mt-2 h-8 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metric.sparkline.map((value, index) => ({ value, index }))}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={metric.trend === "up" ? "#16a34a" : metric.trend === "down" ? "#dc2626" : "#6b7280"}
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Feature Usage & Cohort Retention */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Usage</CardTitle>
                    <CardDescription>Track feature adoption and usage patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={featureUsage}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="usage" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cohort Retention</CardTitle>
                    <CardDescription>User retention by cohort</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={cohortAnalysisData}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="Jan 2024"
                            stackId="1"
                            stroke="#2563eb"
                            fill="#2563eb"
                            fillOpacity={0.2}
                          />
                          <Area
                            type="monotone"
                            dataKey="Feb 2024"
                            stackId="1"
                            stroke="#16a34a"
                            fill="#16a34a"
                            fillOpacity={0.2}
                          />
                          <Area
                            type="monotone"
                            dataKey="Mar 2024"
                            stackId="1"
                            stroke="#ca8a04"
                            fill="#ca8a04"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>User journey and conversion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Sign Up", value: 1000, percentage: 100 },
                          { name: "Profile Completion", value: 800, percentage: 80 },
                          { name: "First Action", value: 600, percentage: 60 },
                          { name: "Regular Usage", value: 400, percentage: 40 },
                        ]}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Adoption Trends</CardTitle>
                  <CardDescription>Track how users adopt new features over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={featureAdoptionData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="dashboard"
                          stackId="1"
                          stroke="#2563eb"
                          fill="#2563eb"
                          fillOpacity={0.2}
                        />
                        <Area
                          type="monotone"
                          dataKey="reports"
                          stackId="1"
                          stroke="#16a34a"
                          fill="#16a34a"
                          fillOpacity={0.2}
                        />
                        <Area
                          type="monotone"
                          dataKey="analytics"
                          stackId="1"
                          stroke="#ca8a04"
                          fill="#ca8a04"
                          fillOpacity={0.2}
                        />
                        <Area
                          type="monotone"
                          dataKey="settings"
                          stackId="1"
                          stroke="#dc2626"
                          fill="#dc2626"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Usage Distribution</CardTitle>
                    <CardDescription>Current feature usage breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={featureUsage}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="usage" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Growth Rate</CardTitle>
                    <CardDescription>Feature usage growth over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={featureAdoptionData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="dashboard"
                            stroke="#2563eb"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="reports"
                            stroke="#16a34a"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="analytics"
                            stroke="#ca8a04"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="settings"
                            stroke="#dc2626"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cohorts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Analysis</CardTitle>
                  <CardDescription>Detailed cohort behavior and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={cohortAnalysisData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="Jan 2024"
                          stackId="1"
                          stroke="#2563eb"
                          fill="#2563eb"
                          fillOpacity={0.2}
                        />
                        <Area
                          type="monotone"
                          dataKey="Feb 2024"
                          stackId="1"
                          stroke="#16a34a"
                          fill="#16a34a"
                          fillOpacity={0.2}
                        />
                        <Area
                          type="monotone"
                          dataKey="Mar 2024"
                          stackId="1"
                          stroke="#ca8a04"
                          fill="#ca8a04"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Cohort Retention Heatmap</CardTitle>
                    <CardDescription>Visual representation of cohort retention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={cohortAnalysisData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="Jan 2024" fill="#2563eb" />
                          <Bar dataKey="Feb 2024" fill="#16a34a" />
                          <Bar dataKey="Mar 2024" fill="#ca8a04" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cohort Comparison</CardTitle>
                    <CardDescription>Compare cohort performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={cohortAnalysisData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="Jan 2024"
                            stroke="#2563eb"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="Feb 2024"
                            stroke="#16a34a"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="Mar 2024"
                            stroke="#ca8a04"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              {/* Settings content */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Alerts & Thresholds</CardTitle>
                    <CardDescription>Configure engagement alerts and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>DAU Drop Alert</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify if DAU drops by more than 10%
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Session Length Alert</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify if average session length decreases
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Feature Usage Alert</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify if key feature usage drops
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Export & Integrations</CardTitle>
                    <CardDescription>Configure data exports and third-party integrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Export Data
                        </Button>
                        <Select>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Export Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="sql">SQL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator />
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Looker</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" size="sm" className="w-full">
                              Connect
                            </Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Tableau</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" size="sm" className="w-full">
                              Connect
                            </Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Snowflake</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" size="sm" className="w-full">
                              Connect
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest user interactions and events</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.user}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{activity.action}</Badge>
                    </TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell>
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementPage;
