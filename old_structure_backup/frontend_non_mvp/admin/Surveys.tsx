import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  MessageSquare,
  Calendar,
  Download,
  Eye,
  Plus,
  Clock,
  FileText,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';

interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating';
  avgScore?: number;
  responses: number;
  distribution?: {
    [key: string]: number;
  };
  trend?: 'up' | 'down' | 'stable';
}

interface SurveyData {
  id: string;
  name: string;
  date: string;
  endDate: string;
  participation: number;
  totalParticipants: number;
  responses: number;
  avgScore: number;
  enps: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  status: 'completed' | 'ongoing' | 'scheduled' | 'draft';
  team?: string;
  type: 'auto-pilot' | 'custom' | 'template';
  questions: SurveyQuestion[];
  topInsights?: string[];
  actionItems?: string[];
  completionTime?: string;
}

interface DraftData {
  id: string;
  name: string;
  createdBy: string;
  lastEdited: string;
  questionCount: number;
}

const Surveys: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('company');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Mock data for last survey with comprehensive details
  const lastSurvey: SurveyData = {
    id: '1',
    name: 'August Employee Pulse Survey',
    date: '2024-08-01',
    endDate: '2024-08-07',
    participation: 87,
    totalParticipants: 156,
    responses: 136,
    avgScore: 7.8,
    enps: 42,
    sentiment: {
      positive: 65,
      neutral: 25,
      negative: 10
    },
    status: 'completed',
    type: 'auto-pilot',
    completionTime: '5.2 minutes',
    questions: [
      {
        id: 'q1',
        text: 'How satisfied are you with your current role? (1-10 scale)',
        type: 'rating',
        avgScore: 8.2,
        responses: 136,
        distribution: { '1-2': 3, '3-4': 8, '5-6': 15, '7-8': 45, '9-10': 65 },
        trend: 'up'
      },
      {
        id: 'q2',
        text: 'How would you rate team collaboration? (1-10 scale)',
        type: 'rating',
        avgScore: 7.5,
        responses: 136,
        distribution: { '1-2': 5, '3-4': 12, '5-6': 20, '7-8': 52, '9-10': 47 },
        trend: 'stable'
      },
      {
        id: 'q3',
        text: 'How likely are you to recommend this company as a place to work? (0-10 scale)',
        type: 'rating',
        avgScore: 8.4,
        responses: 136,
        distribution: { '1-2': 4, '3-4': 9, '5-6': 18, '7-8': 49, '9-10': 56 },
        trend: 'up'
      },
      {
        id: 'q4',
        text: 'How would you rate your work-life balance? (1-10 scale)',
        type: 'rating',
        avgScore: 6.8,
        responses: 136,
        distribution: { '1-2': 8, '3-4': 15, '5-6': 25, '7-8': 45, '9-10': 43 },
        trend: 'down'
      },
      {
        id: 'q5',
        text: 'How satisfied are you with your manager? (1-10 scale)',
        type: 'rating',
        avgScore: 7.9,
        responses: 136,
        distribution: { '1-2': 4, '3-4': 10, '5-6': 18, '7-8': 48, '9-10': 56 },
        trend: 'up'
      },
      {
        id: 'q6',
        text: 'How would you rate the company culture? (1-10 scale)',
        type: 'rating',
        avgScore: 8.1,
        responses: 136,
        distribution: { '1-2': 3, '3-4': 7, '5-6': 12, '7-8': 42, '9-10': 72 },
        trend: 'up'
      }
    ],
    topInsights: [
      "87% participation rate shows strong engagement",
      "Role satisfaction increased 0.3 points from last survey",
      "Team collaboration remains stable but has room for improvement",
      "eNPS score of 42 indicates strong employee advocacy",
      "Communication and processes are top improvement areas"
    ],
    actionItems: [
      "Implement flexible working hours policy",
      "Enhance leadership communication training",
      "Review and improve project management tools",
      "Plan quarterly team building events",
      "Develop clear career progression framework"
    ]
  };

  // Mock survey history data
  const surveyHistory: SurveyData[] = useMemo(() => [
    {
      id: '1',
      name: 'August Employee Pulse Survey',
      date: '2024-08-01',
      participation: 87,
      avgScore: 7.8,
      enps: 42,
      sentiment: { positive: 65, neutral: 25, negative: 10 },
      status: 'completed',
      type: 'auto-pilot'
    },
    {
      id: '2',
      name: 'July Employee Pulse Survey',
      date: '2024-07-01',
      participation: 82,
      avgScore: 7.5,
      enps: 38,
      sentiment: { positive: 60, neutral: 30, negative: 10 },
      status: 'completed',
      type: 'auto-pilot'
    },
    {
      id: '3',
      name: 'June Employee Pulse Survey',
      date: '2024-06-01',
      participation: 79,
      avgScore: 7.2,
      enps: 35,
      sentiment: { positive: 55, neutral: 35, negative: 10 },
      status: 'completed',
      type: 'auto-pilot'
    },
    {
      id: '4',
      name: 'May Employee Pulse Survey',
      date: '2024-05-01',
      participation: 85,
      avgScore: 7.6,
      enps: 40,
      sentiment: { positive: 62, neutral: 28, negative: 10 },
      status: 'completed',
      type: 'auto-pilot'
    },
    {
      id: '5',
      name: 'April Employee Pulse Survey',
      date: '2024-04-01',
      participation: 81,
      avgScore: 7.3,
      enps: 36,
      sentiment: { positive: 58, neutral: 32, negative: 10 },
      status: 'completed',
      type: 'auto-pilot'
    },
    {
      id: '6',
      name: 'March Employee Pulse Survey',
      date: '2024-03-01',
      participation: 78,
      avgScore: 7.0,
      enps: 32,
      sentiment: { positive: 52, neutral: 38, negative: 10 },
      status: 'completed',
      type: 'auto-pilot'
    }
  ], []);

  // Mock upcoming surveys
  const upcomingSurveys: SurveyData[] = [
    {
      id: '7',
      name: 'September Employee Pulse Survey',
      date: '2024-09-01',
      participation: 0,
      avgScore: 0,
      enps: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      status: 'scheduled',
      type: 'auto-pilot'
    }
  ];

  // Mock drafts
  const drafts: DraftData[] = [
    {
      id: '1',
      name: 'Leadership Feedback Survey',
      createdBy: 'Sarah Johnson',
      lastEdited: '2024-08-15',
      questionCount: 12
    },
    {
      id: '2',
      name: 'Remote Work Satisfaction',
      createdBy: 'Mike Chen',
      lastEdited: '2024-08-10',
      questionCount: 8
    }
  ];

  // Mock team scores for the last survey (0-10 scale)
  const teamScores = useMemo(
    () => [
      { team: 'Engineering', score: 7.9, participation: 84 },
      { team: 'Sales', score: 7.2, participation: 81 },
      { team: 'Marketing', score: 7.6, participation: 86 },
      { team: 'HR', score: 8.1, participation: 90 },
      { team: 'Finance', score: 7.4, participation: 83 },
      { team: 'Operations', score: 7.7, participation: 85 }
    ],
    []
  );

  // Chart data for survey history
  const chartData = surveyHistory.map(survey => ({
    name: new Date(survey.date).toLocaleDateString('en-US', { month: 'short' }),
    avgScore: survey.avgScore,
    participation: survey.participation,
    enps: survey.enps
  })).reverse();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'ongoing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Play className="w-3 h-3 mr-1" />Ongoing</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><ClockIcon className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><FileText className="w-3 h-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getTrendText = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) return `+${diff.toFixed(1)}`;
    if (diff < 0) return `${diff.toFixed(1)}`;
    return '0.0';
  };

  const previousSurvey = surveyHistory[1]; // July survey for comparison

  return (
    <div className="space-y-6 p-6">
      {/* Survey Management Board */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <FileText className="w-6 h-6 text-gray-700" />
                Survey Management
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                {lastSurvey.name} • Sent {new Date(lastSurvey.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → Closed {new Date(lastSurvey.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </CardDescription>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="border-gray-200 bg-white/50 backdrop-blur-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Results
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Participation */}
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  {getTrendIcon(lastSurvey.participation, previousSurvey.participation)}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{lastSurvey.participation}%</p>
                  <p className="text-sm text-gray-600">Participation</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {lastSurvey.responses} of {lastSurvey.totalParticipants} responses
                  </p>
                </div>
              </div>
            </div>

            {/* Avg Score */}
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  {getTrendIcon(lastSurvey.avgScore, previousSurvey.avgScore)}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{lastSurvey.avgScore.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTrendText(lastSurvey.avgScore, previousSurvey.avgScore)} vs last survey
                  </p>
                </div>
              </div>
            </div>

            {/* eNPS */}
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  {getTrendIcon(lastSurvey.enps, previousSurvey.enps)}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{lastSurvey.enps}</p>
                  <p className="text-sm text-gray-600">eNPS</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTrendText(lastSurvey.enps, previousSurvey.enps)} vs last survey
                  </p>
                </div>
              </div>
            </div>

            {/* Completion Time */}
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{lastSurvey.completionTime}</p>
                  <p className="text-sm text-gray-600">Avg Time</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Per respondent
                  </p>
                </div>
              </div>
            </div>

            {/* Sentiment */}
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{lastSurvey.sentiment.positive}%</p>
                  <p className="text-sm text-gray-600">Sentiment</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {lastSurvey.sentiment.positive}% positive
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Scores & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Team Scores */}
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl min-h-[220px] max-h-64 overflow-hidden flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Team Scores (0-10)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-auto pr-1">
                <div className="space-y-2">
                  {teamScores.map((t) => (
                    <div key={t.team} className="flex items-center justify-between gap-3">
                      <div className="min-w-[140px] text-sm text-gray-700">{t.team}</div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${(t.score / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-14 text-right text-sm font-semibold text-gray-900">{t.score.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metrics Scores from Last Survey */}
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl min-h-[220px] max-h-64 overflow-hidden flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Metrics Scores (Last Survey)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-auto pr-1">
                <div className="space-y-2">
                  {[
                    { label: 'Role Satisfaction', value: lastSurvey.questions[0].avgScore || 0 },
                    { label: 'Team Collaboration', value: lastSurvey.questions[1].avgScore || 0 },
                    { label: 'Recommend (0-10)', value: lastSurvey.questions[2].avgScore || 0 },
                    { label: 'Work-Life Balance', value: lastSurvey.questions[3].avgScore || 0 },
                    { label: 'Manager Satisfaction', value: lastSurvey.questions[4].avgScore || 0 },
                    { label: 'Company Culture', value: lastSurvey.questions[5].avgScore || 0 }
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between gap-3">
                      <div className="min-w-[160px] text-sm text-gray-700">{metric.label}</div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${(metric.value / 10) * 100}%` }}></div>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm font-semibold text-gray-900">{metric.value.toFixed(1)}/10</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Performance Analysis */}
          <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="w-5 h-5 text-purple-600" />
                Question Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {lastSurvey.questions.length}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="border-gray-200 bg-white/50 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentQuestionIndex((i) => Math.min(lastSurvey.questions.length - 1, i + 1))}
                  disabled={currentQuestionIndex === lastSurvey.questions.length - 1}
                  className="border-gray-200 bg-white/50 backdrop-blur-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 mb-4">
              {lastSurvey.questions.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to question ${idx + 1}`}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-2.5 w-2.5 rounded-full ${idx === currentQuestionIndex ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>

            {/* Single question card */}
            {(() => {
              const question = lastSurvey.questions[currentQuestionIndex];
              const index = currentQuestionIndex;
              return (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Q{index + 1}</span>
                        <Badge variant="outline" className="text-xs">0-10 Scale</Badge>
                        {question.trend && (
                          <Badge variant={question.trend === 'up' ? 'default' : question.trend === 'down' ? 'destructive' : 'secondary'} className="text-xs">
                            {question.trend === 'up' ? '↗ Improving' : question.trend === 'down' ? '↘ Declining' : '→ Stable'}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{question.text}</h4>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-600">{question.responses} responses</div>
                      {question.avgScore && (
                        <div className="text-2xl font-bold text-gray-900">{question.avgScore.toFixed(1)}</div>
                      )}
                    </div>
                  </div>

                  {/* Performance Scale */}
                  <div className="space-y-3">
                    {/* Score Scale Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Performance Scale</span>
                        <span className="text-sm text-gray-600">0-10 Scale</span>
                      </div>
                      <div className="relative">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(question.avgScore! / 10) * 100}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>2</span>
                          <span>4</span>
                          <span>6</span>
                          <span>8</span>
                          <span>10</span>
                        </div>
                        {/* Score Label */}
                        <div className="text-center mt-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Score: {question.avgScore?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Performance Rating:</span>
                        {question.avgScore! >= 8 ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
                        ) : question.avgScore! >= 7 ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
                        ) : question.avgScore! >= 6 ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Average</Badge>
                        ) : question.avgScore! >= 4 ? (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">Below Average</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-200">Poor</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {question.avgScore! >= 8 ? 'Top 20%' :
                          question.avgScore! >= 7 ? 'Top 40%' :
                          question.avgScore! >= 6 ? 'Top 60%' :
                          question.avgScore! >= 4 ? 'Bottom 40%' : 'Bottom 20%'}
                      </div>
                    </div>


                  </div>
                </div>
              );
            })()}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Survey History */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <BarChart3 className="w-6 h-6 text-gray-700" />
                Survey History
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Track performance across your last 6 surveys
              </CardDescription>
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-4">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="h-10 w-40 border-gray-200 bg-white/50 backdrop-blur-sm">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Survey History Chart */}
          <div className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="company">Company-wide</TabsTrigger>
                <TabsTrigger value="teams">By Team</TabsTrigger>
              </TabsList>
              <TabsContent value="company" className="mt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="avgScore" stroke="#3B82F6" strokeWidth={2} name="Avg Score" />
                      <Line yAxisId="right" type="monotone" dataKey="participation" stroke="#10B981" strokeWidth={2} name="Participation %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="teams" className="mt-4">
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Team-specific chart will be displayed here
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Survey History Table */}
          <div className="border border-gray-200 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Survey Name</TableHead>
                  <TableHead>Participation %</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>eNPS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveyHistory.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">
                      {new Date(survey.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{survey.name}</TableCell>
                    <TableCell>{survey.participation}%</TableCell>
                    <TableCell>{survey.avgScore.toFixed(1)}</TableCell>
                    <TableCell>{survey.enps}</TableCell>
                    <TableCell>{getStatusBadge(survey.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming / Scheduled Surveys */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
            <Calendar className="w-6 h-6 text-gray-700" />
            Upcoming Surveys
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Manage your scheduled surveys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {upcomingSurveys.map((survey) => (
              <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{survey.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(survey.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {survey.type === 'auto-pilot' ? 'Auto-Pilot' : 'Custom'}
                      </Badge>
                      {getStatusBadge(survey.status)}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-200 bg-white/50 backdrop-blur-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Schedule
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Start New Survey */}
      <Card className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Survey</h3>
          <p className="text-gray-600 mb-6">Start building your next employee engagement survey</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Survey
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-200 bg-white/50 backdrop-blur-sm"
            >
              <FileText className="w-5 h-5 mr-2" />
              Use Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drafts */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
            <FileText className="w-6 h-6 text-gray-700" />
            Drafts
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Continue working on your saved surveys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {drafts.length > 0 ? (
            <div className="border border-gray-200 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Draft Name</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Last Edited</TableHead>
                    <TableHead># Questions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drafts.map((draft) => (
                    <TableRow key={draft.id}>
                      <TableCell className="font-medium">{draft.name}</TableCell>
                      <TableCell>{draft.createdBy}</TableCell>
                      <TableCell>
                        {new Date(draft.lastEdited).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{draft.questionCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
              <p className="text-gray-600 mb-4">Start creating your first survey draft</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Start a new survey
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Surveys;


