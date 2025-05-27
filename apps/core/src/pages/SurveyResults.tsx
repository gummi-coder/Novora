
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Copy, X } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { toast } from "@/components/ui/sonner";

// Mock data for the survey
const mockSurvey = {
  id: "1",
  title: "Q2 Employee Satisfaction",
  status: "Live",
  description: "Quarterly survey to assess employee engagement and satisfaction.",
  created: "2025-04-12",
  scheduled: "2025-04-15",
  totalInvites: 125,
  responses: 85,
  responseRate: 68,
  enps: 42,
  avgSatisfaction: 7.8,
  avgCompletionTime: "3m 42s",
};

// Mock response data for charts
const mockResponseTrend = [
  { date: 'Apr 15', responses: 12 },
  { date: 'Apr 16', responses: 28 },
  { date: 'Apr 17', responses: 45 },
  { date: 'Apr 18', responses: 56 },
  { date: 'Apr 19', responses: 68 },
  { date: 'Apr 20', responses: 76 },
  { date: 'Apr 21', responses: 85 },
];

const mockDepartmentData = [
  { name: 'Engineering', satisfaction: 8.2, responses: 24 },
  { name: 'Marketing', satisfaction: 7.4, responses: 18 },
  { name: 'Sales', satisfaction: 7.9, responses: 16 },
  { name: 'HR', satisfaction: 8.5, responses: 8 },
  { name: 'Finance', satisfaction: 7.2, responses: 12 },
  { name: 'Operations', satisfaction: 7.8, responses: 7 },
];

// Mock question results
const mockQuestionResults = [
  {
    id: 1,
    question: "How satisfied are you with your work environment?",
    type: "rating",
    average: 7.6,
    distribution: [
      { value: 1, count: 2 },
      { value: 2, count: 3 },
      { value: 3, count: 5 },
      { value: 4, count: 8 },
      { value: 5, count: 12 },
      { value: 6, count: 14 },
      { value: 7, count: 12 },
      { value: 8, count: 15 },
      { value: 9, count: 8 },
      { value: 10, count: 6 },
    ]
  },
  {
    id: 2,
    question: "How likely are you to recommend our company as a place to work?",
    type: "nps",
    average: 8.2,
    distribution: [
      { value: 0, count: 1 },
      { value: 1, count: 1 },
      { value: 2, count: 2 },
      { value: 3, count: 3 },
      { value: 4, count: 3 },
      { value: 5, count: 5 },
      { value: 6, count: 6 },
      { value: 7, count: 10 },
      { value: 8, count: 18 },
      { value: 9, count: 20 },
      { value: 10, count: 16 },
    ]
  },
];

// Mock feedback comments
const mockFeedback = [
  {
    id: 1,
    comment: "I really enjoy the flexibility and work-life balance at our company. The recent improvements to our benefits package have been appreciated.",
    sentiment: "positive",
  },
  {
    id: 2,
    comment: "Communication between departments could be improved. Often feel like we're working in silos.",
    sentiment: "negative",
  },
  {
    id: 3,
    comment: "The new office layout is much better than before, but meeting rooms are still often fully booked.",
    sentiment: "mixed",
  },
];

const SurveyResults = () => {
  const { id } = useParams();
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      case "mixed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleExport = (format: string) => {
    toast.success(`Survey results exported as ${format.toUpperCase()}`);
  };
  
  const handleDuplicate = () => {
    toast.success("Survey duplicated successfully");
  };
  
  const handleCloseSurvey = () => {
    toast.success("Survey closed successfully");
  };

  return (
    <DashboardLayout>
      <div className="py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/surveys">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold">{mockSurvey.title}</h1>
            <Badge className={mockSurvey.status === 'Live' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
              {mockSurvey.status}
            </Badge>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            {mockSurvey.status === 'Live' && (
              <Button variant="destructive" onClick={handleCloseSurvey}>
                <X className="mr-2 h-4 w-4" />
                Close Survey
              </Button>
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-baseline">
                <div className="text-3xl font-bold">{mockSurvey.responseRate}%</div>
                <div className="text-sm text-muted-foreground">
                  {mockSurvey.responses} of {mockSurvey.totalInvites} responded
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">eNPS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockSurvey.enps}</div>
              <div className="text-sm text-muted-foreground">Employee Net Promoter Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Avg. Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockSurvey.avgSatisfaction}/10</div>
              <div className="text-sm text-muted-foreground">
                Avg. completion time: {mockSurvey.avgCompletionTime}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Trend Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Response Trend</CardTitle>
            <CardDescription>Daily responses since the survey was sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockResponseTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="responses" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
            <CardDescription>Average satisfaction score by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDepartmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="satisfaction" name="Satisfaction Score" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Question Results */}
        <h2 className="text-xl font-semibold mb-4">Question Results</h2>
        {mockQuestionResults.map((question) => (
          <Card key={question.id} className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{question.question}</CardTitle>
              <CardDescription>
                Average: {question.average}/10 ({question.type === 'nps' ? 'NPS Question' : 'Rating Question'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={question.distribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="value" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Responses" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Open Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Open Feedback</CardTitle>
            <CardDescription>Comments and suggestions from respondents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockFeedback.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 border rounded-md ${getSentimentColor(item.sentiment)}`}
                >
                  <div className="flex justify-between mb-1">
                    <Badge variant="outline" className="capitalize">
                      {item.sentiment}
                    </Badge>
                  </div>
                  <p>{item.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SurveyResults;
