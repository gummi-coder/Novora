import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportData } from './ExportData';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Mock data for business metrics
const revenueData = [
  { month: 'Jan', revenue: 120000, profit: 45000 },
  { month: 'Feb', revenue: 150000, profit: 55000 },
  { month: 'Mar', revenue: 180000, profit: 65000 },
  { month: 'Apr', revenue: 160000, profit: 60000 },
  { month: 'May', revenue: 200000, profit: 75000 },
  { month: 'Jun', revenue: 220000, profit: 85000 },
];

const customerSegments = [
  { name: 'Enterprise', value: 35 },
  { name: 'Mid-Market', value: 25 },
  { name: 'Small Business', value: 20 },
  { name: 'Startup', value: 20 },
];

const growthMetrics = [
  { month: 'Jan', growth: 12, acquisition: 45, retention: 92 },
  { month: 'Feb', growth: 15, acquisition: 50, retention: 94 },
  { month: 'Mar', growth: 18, acquisition: 55, retention: 95 },
  { month: 'Apr', growth: 14, acquisition: 48, retention: 93 },
  { month: 'May', growth: 20, acquisition: 60, retention: 96 },
  { month: 'Jun', growth: 22, acquisition: 65, retention: 97 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function BusinessMetricsDashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1.03M</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                <div className="h-[80px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,345</div>
                <p className="text-xs text-muted-foreground">+12.3% from last month</p>
                <div className="h-[80px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthMetrics}>
                      <Line type="monotone" dataKey="acquisition" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.5%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                <div className="h-[80px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthMetrics}>
                      <Line type="monotone" dataKey="retention" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5%</div>
                <p className="text-xs text-muted-foreground">+3.2% from last month</p>
                <div className="h-[80px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthMetrics}>
                      <Line type="monotone" dataKey="growth" stroke="#ff8042" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <ExportData 
            data={revenueData} 
            title="Export Overview Data" 
            filename="business-overview"
          />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Profit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                    <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ExportData 
            data={revenueData} 
            title="Export Revenue Data" 
            filename="revenue-analysis"
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ExportData 
            data={customerSegments} 
            title="Export Customer Data" 
            filename="customer-segments"
          />
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="growth" stroke="#8884d8" name="Growth Rate" />
                    <Line type="monotone" dataKey="acquisition" stroke="#82ca9d" name="Customer Acquisition" />
                    <Line type="monotone" dataKey="retention" stroke="#ffc658" name="Customer Retention" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ExportData 
            data={growthMetrics} 
            title="Export Growth Data" 
            filename="growth-metrics"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 