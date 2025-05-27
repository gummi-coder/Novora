import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportData } from './ExportData';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis
} from 'recharts';

// Mock data for visualization
const salesData = [
  { month: 'Jan', sales: 120, marketing: 45, customers: 150 },
  { month: 'Feb', sales: 150, marketing: 55, customers: 180 },
  { month: 'Mar', sales: 180, marketing: 65, customers: 210 },
  { month: 'Apr', sales: 160, marketing: 60, customers: 190 },
  { month: 'May', sales: 200, marketing: 75, customers: 230 },
  { month: 'Jun', sales: 220, marketing: 85, customers: 250 },
];

const correlationData = [
  { marketing: 45, sales: 120, size: 150 },
  { marketing: 55, sales: 150, size: 180 },
  { marketing: 65, sales: 180, size: 210 },
  { marketing: 60, sales: 160, size: 190 },
  { marketing: 75, sales: 200, size: 230 },
  { marketing: 85, sales: 220, size: 250 },
];

const timeSeriesData = [
  { date: '2024-01', value: 100, forecast: 105 },
  { date: '2024-02', value: 120, forecast: 125 },
  { date: '2024-03', value: 115, forecast: 130 },
  { date: '2024-04', value: 130, forecast: 135 },
  { date: '2024-05', value: 140, forecast: 140 },
  { date: '2024-06', value: 150, forecast: 145 },
];

export function DataVisualization() {
  const [chartType, setChartType] = useState('area');
  const [timeRange, setTimeRange] = useState('6m');

  const getCurrentData = () => {
    switch (chartType) {
      case 'area':
      case 'bar':
        return salesData;
      case 'scatter':
        return correlationData;
      case 'line':
        return timeSeriesData;
      default:
        return salesData;
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="sales" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="marketing" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
              <Bar dataKey="marketing" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="marketing" name="Marketing Spend" unit="$" />
              <YAxis dataKey="sales" name="Sales" unit="$" />
              <ZAxis dataKey="size" name="Customers" range={[50, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Sales vs Marketing" data={correlationData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="Actual" />
              <Line type="monotone" dataKey="forecast" stroke="#82ca9d" name="Forecast" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Visualization</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Last Month</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      <ExportData 
        data={getCurrentData()} 
        title="Export Visualization Data" 
        filename={`visualization-${chartType}-${timeRange}`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>Sales growth is positively correlated with marketing spend</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Customer acquisition cost is decreasing over time</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Seasonal patterns are evident in the data</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Increase marketing spend during peak seasons</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span>Focus on customer retention strategies</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-500" />
                <span>Optimize pricing based on market trends</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 