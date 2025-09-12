import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureGuard } from '@/components/common/FeatureGuard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, BarChart2, LineChart, PieChart } from 'lucide-react';

interface AnalyticsData {
  responseRates: {
    date: string;
    rate: number;
  }[];
  engagementMetrics: {
    date: string;
    score: number;
  }[];
  usageStats: {
    totalSurveys: number;
    totalResponses: number;
    activeUsers: number;
    completionRate: number;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate fetching data
    const mockData: AnalyticsData = {
      responseRates: [
        { date: '2024-01', rate: 75 },
        { date: '2024-02', rate: 82 },
        { date: '2024-03', rate: 78 },
      ],
      engagementMetrics: [
        { date: '2024-01', score: 4.2 },
        { date: '2024-02', score: 4.5 },
        { date: '2024-03', score: 4.3 },
      ],
      usageStats: {
        totalSurveys: 150,
        totalResponses: 1200,
        activeUsers: 85,
        completionRate: 92,
      },
    };

    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <div>Loading analytics data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <FeatureGuard featureId="data-export">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </FeatureGuard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.usageStats.totalSurveys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.usageStats.totalResponses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.usageStats.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.usageStats.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="response-rates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="response-rates">Response Rates</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Metrics</TabsTrigger>
          <FeatureGuard featureId="advanced-analytics" requiredTier="enterprise">
            <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
          </FeatureGuard>
        </TabsList>

        <TabsContent value="response-rates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Rate Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.responseRates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="rate" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.engagementMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <FeatureGuard featureId="advanced-analytics" requiredTier="enterprise">
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Predictive Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Forecast future engagement trends and response rates based on historical data.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Custom Segments</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and analyze custom segments of your workforce for targeted insights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </FeatureGuard>
      </Tabs>
    </div>
  );
}; 