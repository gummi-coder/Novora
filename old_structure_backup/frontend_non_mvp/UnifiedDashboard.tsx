import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import TeamTrends from "@/components/dashboard/admin/TeamTrends";
import Feedback from "./admin/Feedback";
import Alerts from "@/components/dashboard/admin/Alerts";
import Engagement from "@/components/dashboard/admin/Engagement";
import Surveys from "@/components/dashboard/admin/Surveys";
import Reports from "@/components/dashboard/admin/Reports";
import Settings from "@/components/dashboard/admin/Settings";

import { AlertConfiguration } from "@/components/dashboard/admin/AlertConfiguration";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Activity,
  Building,
  Settings as SettingsIcon,
  FileText,
  Eye,
  Plus,
  Download,
  Filter,
  Bell,
  Share,
  Minus,
  User,
  Info,
  Shield,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalTeams: number;
  activeSurveys: number;
  totalResponses: number;
  avgParticipation: number;
  responseRate: number;
  alertsCount: number;
  avgScore: number;
  scoreChange: number;
}

interface TeamPerformance {
  id: string;
  name: string;
  score: number;
  change: number;
  participation: number;
  responses: number;
  alerts: number;
  status: 'improving' | 'stable' | 'declining' | 'critical';
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  team: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  lastSurvey: string;
  status: 'active' | 'inactive';
}

interface Survey {
  id: string;
  title: string;
  team: string;
  status: "Draft" | "Scheduled" | "Active" | "Completed" | "Archived";
  responseRate: number;
  averageScore?: number;
  totalParticipants: number;
  launchDate?: string;
  endDate?: string;
}

const UnifiedDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    activeSurveys: 0,
    totalResponses: 0,
    avgParticipation: 0,
    responseRate: 0,
    alertsCount: 0,
    avgScore: 0,
    scoreChange: 0
  });
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);

  // Modal states
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamPerformance | null>(null);
  const [showSurveyDetails, setShowSurveyDetails] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  // Trends filters
  const [trendsDateRange, setTrendsDateRange] = useState<string>('6m');
  const [trendsMetric, setTrendsMetric] = useState<string>('score');
  const [trendsTeam, setTrendsTeam] = useState<string>('All');
  // Feedback filters and data
  const [feedbackTeam, setFeedbackTeam] = useState<string>('All');
  const [feedbackDimension, setFeedbackDimension] = useState<string>('All');
  const [feedbackSentiment, setFeedbackSentiment] = useState<string>('All');
  const [feedbackPeriod, setFeedbackPeriod] = useState<string>('90d');
  const [feedbackItems, setFeedbackItems] = useState<Array<{ id: string; comment: string; dimension: string; sentiment: 'positive'|'neutral'|'negative'; team: string; date: string; survey: string; flagged?: boolean; inappropriate?: boolean; assignedTo?: string }>>([
    { id: '1', comment: 'Great collaboration in the new sprint, recognition improved.', dimension: 'Recognition', sentiment: 'positive', team: 'Engineering', date: new Date(Date.now()-2*86400000).toISOString(), survey: 'Jan Pulse' },
    { id: '2', comment: 'Workload is high, frequent overtime recently.', dimension: 'Workload', sentiment: 'negative', team: 'Sales', date: new Date(Date.now()-3*86400000).toISOString(), survey: 'Jan Pulse' },
    { id: '3', comment: 'Manager 1:1s could be more consistent.', dimension: 'Manager Relationship', sentiment: 'neutral', team: 'Marketing', date: new Date(Date.now()-8*86400000).toISOString(), survey: 'Jan Pulse' },
    { id: '4', comment: 'Communication between teams improved after weekly sync.', dimension: 'Communication', sentiment: 'positive', team: 'Engineering', date: new Date(Date.now()-15*86400000).toISOString(), survey: 'Dec Survey' },
    { id: '5', comment: 'Feeling stressed about timelines; need clearer priorities.', dimension: 'Workload', sentiment: 'negative', team: 'HR', date: new Date(Date.now()-25*86400000).toISOString(), survey: 'Dec Survey' },
    { id: '6', comment: 'Career growth paths look promising this quarter.', dimension: 'Career Growth', sentiment: 'positive', team: 'Marketing', date: new Date(Date.now()-40*86400000).toISOString(), survey: 'Nov Pulse' },
  ]);
  const [heatmapSortBy, setHeatmapSortBy] = useState<string>('Overall');
  const [overviewSortBy, setOverviewSortBy] = useState<string>('Score');
  const [activeTeamView, setActiveTeamView] = useState<'top' | 'bottom'>('top');

  // Mock trend data for the last 6 months
  const companyTrendData = [
    { month: 'Aug', score: 6.8 },
    { month: 'Sep', score: 7.0 },
    { month: 'Oct', score: 6.9 },
    { month: 'Nov', score: 7.1 },
    { month: 'Dec', score: 7.0 },
    { month: 'Jan', score: 7.2 },
  ];

  const heatmapDimensions = useMemo(() => ['Satisfaction', 'Leadership', 'Recognition', 'Workload'], []);
  const defaultTeams = useMemo(() => ['Engineering', 'Marketing', 'Sales', 'HR'], []);

  const getDeterministicScore = (team: string, dimension: string): number => {
    // Simple deterministic hash-based mock score 60-92
    const key = `${team}|${dimension}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    const score = 60 + (hash % 33); // 60..92
    return score;
  };

  const scoreToColorClass = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Role-based access control
  const isManager = user?.role === 'manager';
  const isOwnerOrAdmin = user?.role === 'admin';

  // Manager-specific data and permissions
  const managerTeamData = {
    teamHealth: 78,
    participation: 85,
    openAlerts: 3,
    latestComments: 12,
    teamMembers: [
      { id: 1, name: 'John Smith', role: 'Developer', status: 'Active' },
      { id: 2, name: 'Sarah Johnson', role: 'Designer', status: 'Active' },
      { id: 3, name: 'Mike Davis', role: 'QA Engineer', status: 'On Leave' },
      { id: 4, name: 'Lisa Wilson', role: 'Product Manager', status: 'Active' },
    ],
    surveys: [
      { id: 1, name: 'Monthly Pulse Survey', status: 'Active', participation: 80, dueDate: '2024-02-15', isAutoPilot: true },
      { id: 2, name: 'Team Health Check', status: 'Completed', participation: 90, dueDate: '2024-01-15', isAutoPilot: false },
    ],
    alerts: [
      { id: 1, type: 'score-drop', message: 'Recognition score dropped 15%', severity: 'medium', acknowledged: false },
      { id: 2, type: 'participation', message: 'Participation below 80% threshold', severity: 'low', acknowledged: true },
    ]
  };

  // Get current section from URL
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/overview') {
      return 'overview';
    }
    // Extract section from path like /dashboard/team-trends -> team-trends
    const section = path.replace('/dashboard/', '');
    return section || 'overview';
  };

  const currentSection = getCurrentSection();

  // Update current section when location changes
  useEffect(() => {
    // This will re-render the component when the route changes
  }, [location.pathname]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on role
        if (isManager) {
          // Manager: Fetch only their team data
          await fetchManagerData();
        } else {
          // Owner/Admin: Fetch all data
          await fetchFullData();
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  const fetchManagerData = async () => {
    // Mock data for manager - only their team
    setStats({
      totalTeams: 1,
      activeSurveys: 2,
      totalResponses: 45,
      avgParticipation: 85,
      responseRate: 85,
      alertsCount: 2,
      avgScore: 7.8,
      scoreChange: 0.2
    });

    setTeamPerformance([
      {
        id: '1',
        name: 'Your Team',
        score: 7.8,
        change: 0.2,
        participation: 85,
        responses: 45,
        alerts: 2,
        status: 'improving'
      }
    ]);

    setEmployees([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@company.com',
        role: 'Developer',
        team: 'Your Team',
        lastSurvey: '2024-01-15',
        status: 'active'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@company.com',
        role: 'Designer',
        team: 'Your Team',
        lastSurvey: '2024-01-15',
        status: 'active'
      }
    ]);

    setSurveys([
      {
        id: '1',
        title: 'Team Pulse Check',
        team: 'Your Team',
        status: 'Active',
        responseRate: 85,
        averageScore: 7.8,
        totalParticipants: 8
      }
    ]);
  };

  const fetchFullData = async () => {
    // Mock data for owner/admin - all teams
    setStats({
      totalTeams: 5,
      activeSurveys: 8,
      totalResponses: 234,
      avgParticipation: 78,
      responseRate: 78,
      alertsCount: 7,
      avgScore: 7.2,
      scoreChange: 0.3
    });

    setTeamPerformance([
      {
        id: '1',
        name: 'Engineering',
        score: 7.8,
        change: 0.2,
        participation: 85,
        responses: 45,
        alerts: 2,
        status: 'improving'
      },
      {
        id: '2',
        name: 'Marketing',
        score: 6.9,
        change: -0.1,
        participation: 72,
        responses: 38,
        alerts: 3,
        status: 'declining'
      },
      {
        id: '3',
        name: 'Sales',
        score: 7.5,
        change: 0.4,
        participation: 89,
        responses: 52,
        alerts: 1,
        status: 'improving'
      }
    ]);

    setEmployees([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@company.com',
        role: 'Developer',
        team: 'Engineering',
        lastSurvey: '2024-01-15',
        status: 'active'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@company.com',
        role: 'Designer',
        team: 'Engineering',
        lastSurvey: '2024-01-15',
        status: 'active'
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@company.com',
        role: 'Marketing Manager',
        team: 'Marketing',
        lastSurvey: '2024-01-14',
        status: 'active'
      }
    ]);

    setSurveys([
      {
        id: '1',
        title: 'Company Pulse Survey',
        team: 'All Teams',
        status: 'Active',
        responseRate: 78,
        averageScore: 7.2,
        totalParticipants: 135
      },
      {
        id: '2',
        title: 'Engineering Team Check',
        team: 'Engineering',
        status: 'Active',
        responseRate: 85,
        averageScore: 7.8,
        totalParticipants: 45
      }
    ]);
  };

  const renderOverview = () => {
    if (isManager) {
      return (
        <div className="space-y-6">
          {/* Manager Overview Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
              <p className="text-gray-600 mt-2">Your team performance and insights</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Snapshot
              </Button>
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share Report
              </Button>
            </div>
          </div>

          {/* 1. Team Health Snapshot - Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group cursor-pointer border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-xl transition-all rounded-xl shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-medium">Avg Team Score</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7.8</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600">+0.3 vs last survey</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Scale: 0-10</p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-xl transition-all rounded-xl shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-medium">eNPS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+42</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600">+8 vs last survey</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">65% Promoters | 25% Passives | 10% Detractors</p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-xl transition-all rounded-xl shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Activity className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-medium">Participation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600">+5% vs last survey</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">17 of 20 team members</p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-xl transition-all rounded-xl shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <Bell className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-medium">Alerts Active</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                  <p className="text-xs text-red-600">2 require attention</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Recognition, Workload, Growth</p>
              </CardContent>
            </Card>
          </div>

          {/* 2. Team Trend Line Chart */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Team Trend (Last 6 Months)</CardTitle>
              <CardDescription>Your team's performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { month: 'Aug', score: 7.2, participation: 78 },
                    { month: 'Sep', score: 7.4, participation: 82 },
                    { month: 'Oct', score: 7.1, participation: 75 },
                    { month: 'Nov', score: 7.6, participation: 88 },
                    { month: 'Dec', score: 7.5, participation: 85 },
                    { month: 'Jan', score: 7.8, participation: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" domain={[0, 10]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Avg Score" />
                    <Line yAxisId="right" type="monotone" dataKey="participation" stroke="#10b981" strokeWidth={2} name="Participation %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. Drivers Overview */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Drivers Overview</CardTitle>
              <CardDescription>Team performance by key drivers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { driver: 'Collaboration', score: 8.2, trend: 'up', detractors: 5, passives: 15, promoters: 80, color: 'green' },
                  { driver: 'Recognition', score: 6.1, trend: 'down', detractors: 25, passives: 35, promoters: 40, color: 'red' },
                  { driver: 'Growth', score: 7.5, trend: 'stable', detractors: 10, passives: 25, promoters: 65, color: 'yellow' },
                  { driver: 'Workload', score: 6.8, trend: 'down', detractors: 20, passives: 30, promoters: 50, color: 'red' },
                  { driver: 'Communication', score: 7.9, trend: 'up', detractors: 8, passives: 22, promoters: 70, color: 'green' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.color === 'green' ? 'bg-green-500' : 
                        item.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{item.driver}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.promoters}% Promoters | {item.passives}% Passives | {item.detractors}% Detractors
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{item.score}</div>
                      <div className="flex items-center gap-1">
                        {item.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                        {item.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                        {item.trend === 'stable' && <Minus className="h-3 w-3 text-gray-600" />}
                        <span className="text-xs text-muted-foreground">vs last</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Sentiment Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle>Sentiment Overview</CardTitle>
                <CardDescription>Comment sentiment from last survey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">65%</div>
                        <div className="text-xs text-muted-foreground">Positive</div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Positive</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Neutral</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Negative</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 justify-center">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <p className="text-xs text-green-600">+12% vs last survey</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Alerts Snapshot */}
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle>Alerts Snapshot</CardTitle>
                <CardDescription>Current active alerts for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { driver: 'Recognition', score: 6.1, drop: '15%', triggered: '2 days ago', status: 'High Priority' },
                    { driver: 'Workload', score: 6.8, drop: '8%', triggered: '1 week ago', status: 'Medium Priority' },
                    { driver: 'Growth', score: 7.5, drop: '5%', triggered: '3 days ago', status: 'Low Priority' }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{alert.driver}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {alert.score} | Drop: {alert.drop} | {alert.triggered}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.status.includes('High') ? 'destructive' : alert.status.includes('Medium') ? 'secondary' : 'outline'}>
                          {alert.status}
                        </Badge>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 6. Latest Feedback Highlights */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Latest Feedback Highlights</CardTitle>
                  <CardDescription>Recent anonymous comments from your team</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All Feedback</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { comment: "Great collaboration in the new sprint, recognition improved significantly.", driver: 'Collaboration', sentiment: 'positive', date: '2 hours ago' },
                  { comment: "Workload is high, frequent overtime recently affecting work-life balance.", driver: 'Workload', sentiment: 'negative', date: '1 day ago' },
                  { comment: "Manager 1:1s could be more consistent and focused on career growth.", driver: 'Growth', sentiment: 'neutral', date: '3 days ago' }
                ].map((feedback, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={feedback.sentiment === 'positive' ? 'default' : feedback.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                          {feedback.driver}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {feedback.sentiment}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{feedback.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 italic">"{feedback.comment}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Owner/Admin Overview (existing code)
    return (
      <div className="space-y-4">

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card onClick={() => navigate('/dashboard/employees')} className="group cursor-pointer border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-xl transition-all rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              {isManager ? 'Your team' : 'Active teams'}
            </p>
            {isOwnerOrAdmin && (
              <div className="mt-2 text-xs text-green-600">
                +2 this month
              </div>
            )}
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/dashboard/surveys')} className="group cursor-pointer border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-xl transition-all rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-medium">Last Survey</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Response Rate
            </p>
            {isOwnerOrAdmin && (
              <div className="mt-2 text-xs text-blue-600">
                7.8 avg score
              </div>
            )}
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/dashboard/team-trends')} className="group cursor-pointer border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-xl transition-all rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore.toFixed(1)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.scoreChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(stats.scoreChange)} from last month
            </div>
            {isOwnerOrAdmin && (
              <div className="mt-2 text-xs text-gray-600">
                Target: 8.0
              </div>
            )}
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/dashboard/alerts')} className="group cursor-pointer border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-xl transition-all rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alertsCount}</div>
            <p className="text-xs text-muted-foreground">
              {isManager ? 'Team alerts' : 'Active alerts'}
            </p>
            {isOwnerOrAdmin && (
              <div className="mt-2 text-xs text-red-600">
                2 critical
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company-wide Health Snapshot */}
      {isOwnerOrAdmin && (
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle>Company Health Snapshot</CardTitle>
            <CardDescription>Overall organization performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">8.2</div>
                <div className="text-sm text-gray-600">Job Satisfaction</div>
                <div className="text-xs text-green-600 mt-1">+0.4 vs last month</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">7.8</div>
                <div className="text-sm text-gray-600">eNPS</div>
                <div className="text-xs text-green-600 mt-1">+8 vs last month</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">6.8</div>
                <div className="text-sm text-gray-600">Collaboration</div>
                <div className="text-xs text-yellow-600 mt-1">-0.2 vs last month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">5.9</div>
                <div className="text-sm text-gray-600">Recognition</div>
                <div className="text-xs text-red-600 mt-1">-0.5 vs last month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">7.5</div>
                <div className="text-sm text-gray-600">Growth</div>
                <div className="text-xs text-green-600 mt-1">+0.3 vs last month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Team Snapshot & Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Team Snapshot - Left Side */}
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle>Team Snapshot</CardTitle>
            <CardDescription>
              Leaderboard: Top 3 teams / Bottom 3 teams (ranked by score)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Toggle Buttons */}
            <div className="flex space-x-2 mb-3">
              <Button
                variant={activeTeamView === 'top' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTeamView('top')}
                className={`flex-1 font-medium ${
                  activeTeamView === 'top' 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                    : 'border-green-200 text-green-700 hover:bg-green-50'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Top Teams
              </Button>
              <Button
                variant={activeTeamView === 'bottom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTeamView('bottom')}
                className={`flex-1 font-medium ${
                  activeTeamView === 'bottom' 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
                    : 'border-red-200 text-red-700 hover:bg-red-50'
                }`}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Bottom Teams
              </Button>
            </div>

            {/* Team List */}
            <div className="space-y-2">
              {(activeTeamView === 'top' 
                ? teamPerformance.sort((a, b) => b.score - a.score).slice(0, 3)
                : teamPerformance.sort((a, b) => a.score - b.score).slice(0, 3)
              ).map((team, index) => (
                <div 
                  key={team.id} 
                  className={`flex items-center justify-between p-2.5 border rounded-lg transition-colors cursor-pointer ${
                    activeTeamView === 'top' 
                      ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                      : 'border-red-200 bg-red-50 hover:bg-red-100'
                  }`}
                  onClick={() => navigate('/dashboard/team-trends')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                      activeTeamView === 'top' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {activeTeamView === 'top' ? index + 1 : teamPerformance.length - index}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{team.name}</h4>
                      <p className="text-xs text-gray-600">{team.participation}% participation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-base font-bold ${
                      activeTeamView === 'top' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {team.score.toFixed(1)}
                    </div>
                    <div className={`text-xs ${
                      activeTeamView === 'top' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {team.change > 0 ? '+' : ''}{team.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-3 border-t border-gray-100">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/team-trends')}
                className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              >
                View Full Team Trends →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trends Section - Right Side */}
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle>Trends</CardTitle>
            <CardDescription>
              Overall Company Score over last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Main Trend Chart */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Company Score Trend</h3>
                <div className="text-2xl font-bold text-green-600">7.2</div>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={companyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[6, 8]}
                      tickFormatter={(value) => value.toFixed(1)}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any) => [value.toFixed(1), 'Score']}
                      labelFormatter={(label) => `${label} 2024`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mini Spark Lines */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Core Metrics</h4>
              
              {/* Job Satisfaction */}
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Job Satisfaction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-8 bg-green-100 rounded flex items-center justify-center">
                    <div className="text-xs text-green-600">↗ 8.2</div>
                  </div>
                  <span className="text-sm text-green-600">+0.4</span>
                </div>
              </div>

              {/* Collaboration */}
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Collaboration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-8 bg-yellow-100 rounded flex items-center justify-center">
                    <div className="text-xs text-yellow-600">↘ 6.8</div>
                  </div>
                  <span className="text-sm text-yellow-600">-0.2</span>
                </div>
              </div>

              {/* Manager Relationship */}
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Manager Relationship</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <div className="text-xs text-blue-600">→ 7.1</div>
                  </div>
                  <span className="text-sm text-blue-600">+0.1</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Team Performance Details Modal */}
      <Dialog open={showTeamDetails} onOpenChange={setShowTeamDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Team Performance</DialogTitle>
            <DialogDescription>Detailed metrics for {selectedTeam?.name}</DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Score</div>
                  <div className="text-2xl font-bold">{selectedTeam.score.toFixed(1)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Change</div>
                  <div className="text-2xl font-bold">{selectedTeam.change > 0 ? "+" : ""}{selectedTeam.change.toFixed(1)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Participation</div>
                  <div className="text-2xl font-bold">{selectedTeam.participation}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Responses</div>
                  <div className="text-2xl font-bold">{selectedTeam.responses}</div>
                </CardContent>
              </Card>
              <div className="col-span-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={selectedTeam.status === 'improving' ? 'default' : selectedTeam.status === 'stable' ? 'secondary' : 'destructive'}>
                    {selectedTeam.status}
                  </Badge>
                  <Badge variant="outline">Alerts: {selectedTeam.alerts}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setShowTeamDetails(false); navigate('/dashboard/team-trends'); }}>
                  View Trends
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Survey Details Modal */}
      <Dialog open={showSurveyDetails} onOpenChange={setShowSurveyDetails}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedSurvey?.title}</DialogTitle>
            <DialogDescription>Survey details and live stats</DialogDescription>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500">Target Team(s)</div>
                    <div className="text-gray-900 font-medium">{selectedSurvey.team}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500">Status</div>
                    <Badge variant="outline">{selectedSurvey.status}</Badge>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500">Launch Date → End Date</div>
                    <div className="text-gray-900 font-medium">{selectedSurvey.launchDate || '—'} → {selectedSurvey.endDate || '—'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500">Response Rate</div>
                    <div className="text-2xl font-bold">{selectedSurvey.responseRate}%</div>
                  </CardContent>
                </Card>
                {typeof selectedSurvey.averageScore === 'number' && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500">Avg Score so far</div>
                      <div className="text-2xl font-bold">{selectedSurvey.averageScore.toFixed(1)}</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
  };

  const renderTeamTrends = () => {
    if (isManager) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Trends</h1>
              <p className="text-gray-600 mt-2">How your team is evolving over time</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Trends
              </Button>
            </div>
          </div>

          {/* 1. Filters (top bar) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Time Range</label>
                    <Select value="6m" onValueChange={(value) => console.log('Time range:', value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last">Last Survey</SelectItem>
                        <SelectItem value="3m">Last 3 Months</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Driver Focus</label>
                    <Select value="all" onValueChange={(value) => console.log('Driver:', value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Show All Drivers</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                        <SelectItem value="recognition">Recognition</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="workload">Workload</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Your Team Only
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Team Trend Line (hero chart) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Team Performance Trend</CardTitle>
              <CardDescription>Overall Avg Team Score + Participation % over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { month: 'Aug', score: 7.2, participation: 78 },
                    { month: 'Sep', score: 7.4, participation: 82 },
                    { month: 'Oct', score: 7.1, participation: 75 },
                    { month: 'Nov', score: 7.6, participation: 88 },
                    { month: 'Dec', score: 7.5, participation: 85 },
                    { month: 'Jan', score: 7.8, participation: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" domain={[0, 10]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        name === 'score' ? `${value}/10` : `${value}%`,
                        name === 'score' ? 'Avg Score' : 'Participation'
                      ]}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      name="Avg Score"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="participation" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      name="Participation %"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. Driver Trends (main section) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Driver Trends</CardTitle>
              <CardDescription>Individual driver performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { month: 'Aug', collaboration: 7.8, recognition: 6.5, growth: 7.2, workload: 6.9, communication: 7.5 },
                    { month: 'Sep', collaboration: 8.1, recognition: 6.2, growth: 7.4, workload: 6.7, communication: 7.8 },
                    { month: 'Oct', collaboration: 7.9, recognition: 5.8, growth: 7.1, workload: 6.5, communication: 7.6 },
                    { month: 'Nov', collaboration: 8.3, recognition: 6.1, growth: 7.5, workload: 6.8, communication: 7.9 },
                    { month: 'Dec', collaboration: 8.2, recognition: 6.0, growth: 7.6, workload: 6.9, communication: 8.0 },
                    { month: 'Jan', collaboration: 8.2, recognition: 6.1, growth: 7.5, workload: 6.8, communication: 7.9 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [`${value}/10`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="collaboration" stroke="#3b82f6" strokeWidth={2} name="Collaboration" />
                    <Line type="monotone" dataKey="recognition" stroke="#ef4444" strokeWidth={2} name="Recognition" />
                    <Line type="monotone" dataKey="growth" stroke="#f59e0b" strokeWidth={2} name="Growth" />
                    <Line type="monotone" dataKey="workload" stroke="#8b5cf6" strokeWidth={2} name="Workload" />
                    <Line type="monotone" dataKey="communication" stroke="#10b981" strokeWidth={2} name="Communication" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4. Driver Performance Snapshot */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Driver Performance Snapshot</CardTitle>
              <CardDescription>Most recent survey scores by driver</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { driver: 'Collaboration', score: 8.2, change: 0.0, color: '#10b981' },
                    { driver: 'Recognition', score: 6.1, change: 0.1, color: '#ef4444' },
                    { driver: 'Growth', score: 7.5, change: -0.1, color: '#f59e0b' },
                    { driver: 'Workload', score: 6.8, change: -0.1, color: '#ef4444' },
                    { driver: 'Communication', score: 7.9, change: -0.1, color: '#10b981' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="driver" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        name === 'score' ? `${value}/10` : `${Number(value) > 0 ? '+' : ''}${value}`,
                        name === 'score' ? 'Score' : 'Change'
                      ]}
                    />
                    <Bar dataKey="score" fill="#3b82f6">
                      {[
                        { driver: 'Collaboration', score: 8.2, change: 0.0, color: '#10b981' },
                        { driver: 'Recognition', score: 6.1, change: 0.1, color: '#ef4444' },
                        { driver: 'Growth', score: 7.5, change: -0.1, color: '#f59e0b' },
                        { driver: 'Workload', score: 6.8, change: -0.1, color: '#ef4444' },
                        { driver: 'Communication', score: 7.9, change: -0.1, color: '#10b981' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Number(entry.score) > 7.5 ? '#10b981' : Number(entry.score) > 6 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Strong (&gt;7.5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Moderate (6-7.5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Needs Attention (&lt;6)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. At-Risk vs Improving Drivers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-red-600">At-Risk Drivers</CardTitle>
                <CardDescription>Drivers showing decline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { driver: 'Recognition', score: 6.1, change: -0.1, trend: 'down' },
                    { driver: 'Workload', score: 6.8, change: -0.1, trend: 'down' },
                    { driver: 'Growth', score: 7.5, change: -0.1, trend: 'stable' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center gap-3">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">{item.driver}</p>
                          <p className="text-sm text-red-600">
                            {item.change > 0 ? '+' : ''}{item.change} vs last survey
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">{item.score}</div>
                        <Badge variant="destructive">At Risk</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-green-600">Top Improvers</CardTitle>
                <CardDescription>Drivers showing improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { driver: 'Collaboration', score: 8.2, change: 0.0, trend: 'stable' },
                    { driver: 'Communication', score: 7.9, change: -0.1, trend: 'stable' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">{item.driver}</p>
                          <p className="text-sm text-green-600">
                            {item.change > 0 ? '+' : ''}{item.change} vs last survey
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{item.score}</div>
                        <Badge variant="default" className="bg-green-600">Improving</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 6. Participation Consistency */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Participation Consistency</CardTitle>
              <CardDescription>Survey participation % across time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { month: 'Aug', participation: 78 },
                    { month: 'Sep', participation: 82 },
                    { month: 'Oct', participation: 75 },
                    { month: 'Nov', participation: 88 },
                    { month: 'Dec', participation: 85 },
                    { month: 'Jan', participation: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Participation']} />
                    <Bar dataKey="participation" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Average participation: <span className="font-semibold">82%</span> | 
                  Target: <span className="font-semibold">80%</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Admin/Owner view - use existing TeamTrends component
    return <TeamTrends />;
  };

  const renderFeedback = () => {
    if (isManager) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Feedback</h1>
              <p className="text-gray-600 mt-2">Why is my team scoring this way?</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Feedback
              </Button>
            </div>
          </div>

          {/* 1. Filters (top bar) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Time Range</label>
                    <Select value="6m" onValueChange={(value) => console.log('Time range:', value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last">Last Survey</SelectItem>
                        <SelectItem value="3m">Last 3 Months</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Driver</label>
                    <Select value="all" onValueChange={(value) => console.log('Driver:', value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Drivers</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                        <SelectItem value="recognition">Recognition</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="workload">Workload</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Sentiment</label>
                    <Select value="all" onValueChange={(value) => console.log('Sentiment:', value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All sentiments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sentiments</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Your Team Only
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Weakness / Strength Distribution (hero section) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Driver Performance Distribution</CardTitle>
              <CardDescription>% Detractors (0-6), Passives (7-8), Promoters (9-10)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { driver: 'Collaboration', avgScore: 8.2, change: 0.0, detractors: 5, passives: 15, promoters: 80, color: 'green' },
                  { driver: 'Recognition', avgScore: 6.1, change: 0.1, detractors: 25, passives: 35, promoters: 40, color: 'red' },
                  { driver: 'Growth', avgScore: 7.5, change: -0.1, detractors: 10, passives: 25, promoters: 65, color: 'yellow' },
                  { driver: 'Workload', avgScore: 6.8, change: -0.1, detractors: 20, passives: 30, promoters: 50, color: 'red' },
                  { driver: 'Communication', avgScore: 7.9, change: -0.1, detractors: 8, passives: 22, promoters: 70, color: 'green' }
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.color === 'green' ? 'bg-green-500' : 
                          item.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <h3 className="font-semibold">{item.driver}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{item.avgScore}</div>
                        <div className="flex items-center gap-1">
                          {item.change > 0 && <TrendingUp className="h-3 w-3 text-green-600" />}
                          {item.change < 0 && <TrendingDown className="h-3 w-3 text-red-600" />}
                          <span className="text-xs text-muted-foreground">
                            {item.change > 0 ? '+' : ''}{item.change} vs last
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex h-8 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${item.detractors}%` }}
                      >
                        {item.detractors}%
                      </div>
                      <div 
                        className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${item.passives}%` }}
                      >
                        {item.passives}%
                      </div>
                      <div 
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${item.promoters}%` }}
                      >
                        {item.promoters}%
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Detractors</span>
                      <span>Passives</span>
                      <span>Promoters</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Sentiment Overview (mini widgets row) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle>Overall Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">68%</div>
                  <div className="text-sm text-muted-foreground">Positive</div>
                  <div className="flex items-center gap-1 mt-2 justify-center">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+12% vs last survey</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle>Sentiment Split</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center mx-auto mb-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">68%</div>
                        <div className="text-xs text-muted-foreground">Positive</div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Positive</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Neutral</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Negative</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle>Sentiment Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Oct', positive: 55 },
                      { month: 'Nov', positive: 62 },
                      { month: 'Dec', positive: 58 },
                      { month: 'Jan', positive: 68 }
                    ]}>
                      <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                  <div className="flex items-center gap-1 justify-center">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Improving</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4. Themes & Keywords */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Themes & Keywords</CardTitle>
              <CardDescription>Most mentioned terms and their sentiment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { theme: 'Workload', mentions: 23, positive: 35, negative: 65 },
                  { theme: 'Support', mentions: 18, positive: 78, negative: 22 },
                  { theme: 'Recognition', mentions: 15, positive: 45, negative: 55 },
                  { theme: 'Collaboration', mentions: 12, positive: 85, negative: 15 }
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer text-center">
                    <div className="text-lg font-semibold">{item.theme}</div>
                    <div className="text-sm text-muted-foreground">{item.mentions} mentions</div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-green-600">{item.positive}% positive</span>
                      <span className="text-red-600">{item.negative}% negative</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 5. Feedback Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Positive Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">59</div>
                <p className="text-xs text-muted-foreground">68% of total</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Flagged Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <Badge variant="destructive">Requires attention</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Inappropriate content</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Unread Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">12</div>
                <p className="text-xs text-muted-foreground">New this week</p>
              </CardContent>
            </Card>
          </div>

          {/* 6. Hotspot Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle>Hot Topics This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { topic: 'Workload', change: 35, direction: 'up' },
                    { topic: 'Deadlines', change: 28, direction: 'up' },
                    { topic: 'Support', change: 15, direction: 'down' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.direction === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-medium">{item.topic}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {item.direction === 'up' ? '↑' : '↓'} {item.change}%
                        </div>
                        <div className="text-xs text-muted-foreground">mentions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle>Positive Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { topic: 'Recognition', positive: 82, comments: 15 },
                    { topic: 'Collaboration', positive: 85, comments: 12 },
                    { topic: 'Support', positive: 78, comments: 18 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{item.topic}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">{item.positive}% positive</div>
                        <div className="text-xs text-muted-foreground">{item.comments} comments</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 7. Comment Feed */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comment Feed</CardTitle>
                  <CardDescription>Anonymous comments from your team</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Search comments..." 
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">Load More</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {[
                  { 
                    comment: "Great collaboration in the new sprint, recognition improved significantly.", 
                    driver: 'Collaboration', 
                    sentiment: 'positive', 
                    date: 'Jan Survey',
                    time: '2 hours ago'
                  },
                  { 
                    comment: "Workload is high, frequent overtime recently affecting work-life balance.", 
                    driver: 'Workload', 
                    sentiment: 'negative', 
                    date: 'Jan Survey',
                    time: '1 day ago'
                  },
                  { 
                    comment: "Manager 1:1s could be more consistent and focused on career growth.", 
                    driver: 'Growth', 
                    sentiment: 'neutral', 
                    date: 'Jan Survey',
                    time: '3 days ago'
                  },
                  { 
                    comment: "Communication between teams improved after weekly sync meetings.", 
                    driver: 'Communication', 
                    sentiment: 'positive', 
                    date: 'Dec Survey',
                    time: '1 week ago'
                  },
                  { 
                    comment: "Feeling stressed about timelines; need clearer priorities and support.", 
                    driver: 'Workload', 
                    sentiment: 'negative', 
                    date: 'Dec Survey',
                    time: '2 weeks ago'
                  },
                  { 
                    comment: "Career growth paths look promising this quarter.", 
                    driver: 'Growth', 
                    sentiment: 'positive', 
                    date: 'Nov Survey',
                    time: '3 weeks ago'
                  }
                ].map((feedback, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={feedback.sentiment === 'positive' ? 'default' : feedback.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                          {feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1)}
                        </Badge>
                        <Badge variant="outline">
                          {feedback.driver}
                        </Badge>
                        <span className="text-xs text-muted-foreground">| {feedback.date}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{feedback.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 italic">"{feedback.comment}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Admin/Owner view - use existing Feedback component
    return <Feedback />;
  };

  const renderAlerts = () => {
    if (isManager) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Alerts</h1>
              <p className="text-gray-600 mt-2">Early-warning command center for your team</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Alerts
              </Button>
              <Button variant="outline">
                <SettingsIcon className="w-4 h-4 mr-2" />
                View Org Rules
              </Button>
            </div>
          </div>

          {/* 1. Hero Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Active Alerts</CardTitle>
                  <Badge variant="destructive">3</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">New This Cycle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">2</div>
                <p className="text-xs text-muted-foreground">Since last survey</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Time to Acknowledge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">18h</div>
                <p className="text-xs text-muted-foreground">Rolling 30 days</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Participation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <Badge variant="default" className="bg-green-600">85%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Latest survey</p>
              </CardContent>
            </Card>
          </div>

          {/* 2. Active Alerts Table */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>Current alerts requiring your attention</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value="all" onValueChange={(value) => console.log('Severity:', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="all" onValueChange={(value) => console.log('Driver:', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All drivers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Drivers</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                      <SelectItem value="recognition">Recognition</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="workload">Workload</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    severity: 'high',
                    driver: 'Recognition',
                    triggerReason: 'Score < 6.0',
                    currentScore: 5.6,
                    delta: -1.3,
                    triggeredOn: '2024-01-15 14:30',
                    status: 'open',
                    participation: 85
                  },
                  {
                    id: 2,
                    severity: 'medium',
                    driver: 'Workload',
                    triggerReason: 'Drop > 1.0',
                    currentScore: 6.8,
                    delta: -1.2,
                    triggeredOn: '2024-01-14 09:15',
                    status: 'acknowledged',
                    participation: 82
                  },
                  {
                    id: 3,
                    severity: 'low',
                    driver: 'Growth',
                    triggerReason: 'Score < 6.5',
                    currentScore: 6.2,
                    delta: -0.8,
                    triggeredOn: '2024-01-13 16:45',
                    status: 'open',
                    participation: 88
                  }
                ].map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' : 
                          alert.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="font-semibold">{alert.driver}</div>
                          <div className="text-sm text-muted-foreground">{alert.triggerReason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {alert.currentScore} 
                          <span className={`ml-1 ${alert.delta < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {alert.delta > 0 ? '+' : ''}{alert.delta}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">{alert.triggeredOn}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.status === 'open' ? 'destructive' : 'secondary'}>
                          {alert.status === 'open' ? 'Open' : 'Acknowledged'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">Acknowledge</Button>
                          <Button variant="outline" size="sm">Details</Button>
                          <Button variant="outline" size="sm">Resolve</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Alert History */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alert History</CardTitle>
                  <CardDescription>Resolved alerts from the past 90 days</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value="90d" onValueChange={(value) => console.log('Time range:', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="90 days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="60d">60 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    id: 4,
                    severity: 'medium',
                    driver: 'Communication',
                    resolution: 'Team meeting held to address concerns',
                    resolvedOn: '2024-01-10',
                    resolutionTime: '3 days'
                  },
                  {
                    id: 5,
                    severity: 'low',
                    driver: 'Collaboration',
                    resolution: 'Process improvements implemented',
                    resolvedOn: '2024-01-05',
                    resolutionTime: '1 day'
                  }
                ].map((alert) => (
                  <div key={alert.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{alert.severity.toUpperCase()}</Badge>
                        <div>
                          <div className="font-medium">{alert.driver}</div>
                          <div className="text-sm text-muted-foreground">{alert.resolution}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{alert.resolvedOn}</div>
                        <div className="text-xs text-muted-foreground">Resolved in {alert.resolutionTime}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Default Rules Preview */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Alert Rules (Read-Only)</CardTitle>
              <CardDescription>Organization-wide alert thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Score Drop</div>
                    <div className="text-sm text-muted-foreground">&gt; 1.0 abs or &gt;15% relative</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Critical Low</div>
                    <div className="text-sm text-muted-foreground">Driver &lt; 6.0; eNPS &lt; 0</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Participation</div>
                    <div className="text-sm text-muted-foreground">&lt; 60% or &gt;20% drop</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Sentiment Spike</div>
                    <div className="text-sm text-muted-foreground">Negative &gt; 30%</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Recurring Risk</div>
                    <div className="text-sm text-muted-foreground">3 consecutive breaches</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">SLA</div>
                    <div className="text-sm text-muted-foreground">Acknowledge within 72h</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Empty State */}
          {false && ( // This would be true when there are no alerts
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">All Clear This Cycle</h3>
                <p className="text-muted-foreground">Keep survey cadence steady. No alerts require attention.</p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Admin/Owner view - use existing Alerts component
    return <Alerts />;
  };

  const renderEngagement = () => {
    if (isManager) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Engagement</h1>
              <p className="text-gray-600 mt-2">Participation health and engagement actions for your team (anonymous by design)</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* 1. KPI Row (top, 4 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">78%</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600">+6% vs last</p>
                </div>
                <p className="text-xs text-muted-foreground">Latest survey</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Consistency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">65%</div>
                <p className="text-xs text-muted-foreground">3-run responders</p>
                <p className="text-xs text-muted-foreground">% of team answered 3 surveys in a row</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Drop-off</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">12%</div>
                <p className="text-xs text-muted-foreground">Skipped this cycle</p>
                <p className="text-xs text-muted-foreground">% who answered last time but skipped this one</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <Badge variant="default" className="bg-green-600">Above threshold</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Uses org thresholds</p>
              </CardContent>
            </Card>
          </div>

          {/* 2. Participation Trend (hero chart) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Participation Trend</CardTitle>
              <CardDescription>Participation % across last 6 surveys for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { survey: 'Aug', participation: 72, sendDate: 'Aug 1', closeDate: 'Aug 7' },
                    { survey: 'Sep', participation: 68, sendDate: 'Sep 1', closeDate: 'Sep 7' },
                    { survey: 'Oct', participation: 75, sendDate: 'Oct 1', closeDate: 'Oct 7' },
                    { survey: 'Nov', participation: 71, sendDate: 'Nov 1', closeDate: 'Nov 7' },
                    { survey: 'Dec', participation: 73, sendDate: 'Dec 1', closeDate: 'Dec 7' },
                    { survey: 'Jan', participation: 78, sendDate: 'Jan 1', closeDate: 'Jan 7' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="survey" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [`${value}%`, 'Participation']}
                      labelFormatter={(label) => `${label} Survey`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="participation" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. Sub-team / Segment Breakdown */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Segment Breakdown</CardTitle>
              <CardDescription>Participation by role/location (aggregates only, no individuals)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { segment: 'Frontend Developers', teamSize: 8, respondents: 7, participation: 87.5, delta: 12.5, status: 'healthy' },
                  { segment: 'Backend Developers', teamSize: 6, respondents: 4, participation: 66.7, delta: -8.3, status: 'low' },
                  { segment: 'QA Engineers', teamSize: 4, respondents: 4, participation: 100, delta: 0, status: 'healthy' },
                  { segment: 'DevOps', teamSize: 3, respondents: 2, participation: 66.7, delta: -16.7, status: 'low' }
                ].map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{segment.segment}</div>
                        <div className="text-sm text-muted-foreground">
                          {segment.respondents} of {segment.teamSize} responded
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{segment.participation}%</div>
                      <div className={`text-sm ${segment.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {segment.delta > 0 ? '+' : ''}{segment.delta}% vs last
                      </div>
                    </div>
                    <div>
                      <Badge variant={segment.status === 'healthy' ? 'default' : 'secondary'}>
                        {segment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Response Consistency Heatmap */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Response Consistency</CardTitle>
              <CardDescription>Participation heatmap - are we building a rhythm?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Your Team</span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">High (&gt;70%)</span>
                    <span className="text-yellow-600">Medium (50-70%)</span>
                    <span className="text-red-600">Low (&lt;50%)</span>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {[78, 72, 68, 75, 71, 73].map((value, index) => (
                    <div 
                      key={index}
                      className={`h-12 rounded-lg flex items-center justify-center text-white font-medium text-sm ${
                        value > 70 ? 'bg-green-500' : 
                        value > 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    >
                      {value}%
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                  <span>Jan</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. "Lift Engagement" Actions */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Lift Engagement</CardTitle>
              <CardDescription>Quick actions to improve participation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <Bell className="h-4 w-4 mb-2" />
                  <span className="font-medium">Send Reminder</span>
                  <span className="text-xs text-muted-foreground">Pre-approved copy</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <Clock className="h-4 w-4 mb-2" />
                  <span className="font-medium">Schedule Nudge</span>
                  <span className="text-xs text-muted-foreground">Morning/afternoon</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <MessageSquare className="h-4 w-4 mb-2" />
                  <span className="font-medium">Share Talking Points</span>
                  <span className="text-xs text-muted-foreground">Stand-up script</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <AlertTriangle className="h-4 w-4 mb-2" />
                  <span className="font-medium">Request Admin Help</span>
                  <span className="text-xs text-muted-foreground">Adjust cadence</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 6. Insights Chips */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Insights</CardTitle>
              <CardDescription>Auto-surfaced recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge variant="destructive" className="cursor-pointer hover:bg-red-700">
                  Low-participation risk
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-gray-700">
                  Fatigue risk
                </Badge>
                <Badge variant="default" className="cursor-pointer hover:bg-green-700">
                  Positive momentum
                </Badge>
              </div>
              <div className="mt-4 space-y-2">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-red-600">Low-participation risk</div>
                  <div className="text-sm text-muted-foreground">Participation &lt;60% two cycles</div>
                  <div className="text-xs text-muted-foreground mt-1">Action: Send reminder + schedule team discussion</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-orange-600">Fatigue risk</div>
                  <div className="text-sm text-muted-foreground">Drop-off &gt;20% vs last run</div>
                  <div className="text-xs text-muted-foreground mt-1">Action: Review survey timing + add reminder</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-green-600">Positive momentum</div>
                  <div className="text-sm text-muted-foreground">3-run streak &gt;80%</div>
                  <div className="text-xs text-muted-foreground mt-1">Action: Maintain current approach</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Privacy & Anonymity Notice */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Privacy & Anonymity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Anonymous by Design</div>
                      <div className="text-sm text-blue-700 mt-1">
                        Managers never see individual employee names, emails, or response status. 
                        All data is aggregated to protect anonymity.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>Data shown only when at least min-n responses exist (protects anonymity)</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>Manager view shows aggregates only (team size, participation %, never individuals)</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>All reminders are sent anonymously by the system (manager cannot see who gets reminders)</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>Employee lists and individual data are Admin-only (Settings → Organization)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Admin/Owner view - use existing Engagement component
    return <Engagement />;
  };

  const renderEmployees = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Engagement</h2>
            <p className="text-gray-600">
              Monitor survey participation and identify engagement trends across teams
            </p>
          </div>
          {isOwnerOrAdmin && (
            <div className="flex items-center gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Invite Employee
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Directory
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Employee Statistics */}
      {isOwnerOrAdmin && (
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle>Employee Statistics</CardTitle>
            <CardDescription>Overview of employee distribution and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-gray-600">Total Employees</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="text-2xl font-bold text-green-600">142</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="text-2xl font-bold text-orange-600">14</div>
                <div className="text-sm text-gray-600">On Leave</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="text-2xl font-bold text-gray-600">12</div>
                <div className="text-sm text-gray-600">Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Distribution */}
      {isOwnerOrAdmin && (
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle>Team Distribution</CardTitle>
            <CardDescription>Employee count by team</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { team: 'Engineering', count: 45, managers: 3 },
                { team: 'Marketing', count: 28, managers: 2 },
                { team: 'Sales', count: 35, managers: 4 },
                { team: 'HR', count: 12, managers: 1 },
                { team: 'Finance', count: 18, managers: 2 },
                { team: 'Operations', count: 18, managers: 2 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Enhanced Employee Directory */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            {isManager ? 'Your team members' : 'Complete employee directory with management options'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.email} • {employee.role}</p>
                    {isOwnerOrAdmin && (
                      <p className="text-xs text-gray-500">
                        Manager: {employee.team === 'Engineering' ? 'Sarah Johnson' : 
                                 employee.team === 'Marketing' ? 'Mike Chen' : 'Alex Rodriguez'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <Badge variant="outline">{employee.team}</Badge>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                      {employee.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwnerOrAdmin && (
                      <>
                        <Button variant="outline" size="sm">
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manager Assignment */}
      {isOwnerOrAdmin && (
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle>Manager Assignment</CardTitle>
            <CardDescription>Assign and manage team leaders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { team: 'Engineering', manager: 'Sarah Johnson', employees: 45, status: 'active' },
                { team: 'Marketing', manager: 'Mike Chen', employees: 28, status: 'active' },
                { team: 'Sales', manager: 'Alex Rodriguez', employees: 35, status: 'active' },
                { team: 'HR', manager: 'Lisa Thompson', employees: 12, status: 'active' }
              ].map((team) => (
                <div key={team.team} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                  <div>
                    <h4 className="font-semibold">{team.team}</h4>
                    <p className="text-sm text-gray-600">Manager: {team.manager}</p>
                    <p className="text-xs text-gray-500">{team.employees} employees</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                      {team.status}
                    </Badge>
                    <Button variant="outline" size="sm">Reassign</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSurveys = () => {
    if (isManager) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Surveys</h1>
              <p className="text-gray-600 mt-2">Past results and upcoming surveys for your team</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>

          {/* 1. Last Team Survey Overview (hero section) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Last Team Survey Results</CardTitle>
              <CardDescription>January 2024 Pulse Survey - Sent Jan 1 → Closed Jan 7</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">7.8</div>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+0.3 vs last</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Score</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+42</div>
                  <div className="text-xs text-muted-foreground mt-1">65% Promoters | 25% Passives | 10% Detractors</div>
                  <div className="text-sm text-muted-foreground">eNPS</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+5% vs last</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Participation</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">68%</div>
                  <div className="text-xs text-muted-foreground mt-1">Positive | 22% Neutral | 10% Negative</div>
                  <div className="text-sm text-muted-foreground">Sentiment</div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 2. Team Survey History (main section) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Team Survey History</CardTitle>
              <CardDescription>Your team's performance over the last 6 surveys</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Trend Chart */}
              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { survey: 'Aug', avgScore: 7.2, participation: 78 },
                    { survey: 'Sep', avgScore: 7.4, participation: 82 },
                    { survey: 'Oct', avgScore: 7.1, participation: 75 },
                    { survey: 'Nov', avgScore: 7.6, participation: 88 },
                    { survey: 'Dec', avgScore: 7.5, participation: 85 },
                    { survey: 'Jan', avgScore: 7.8, participation: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="survey" />
                    <YAxis yAxisId="left" domain={[0, 10]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        name === 'avgScore' ? `${value}/10` : `${value}%`,
                        name === 'avgScore' ? 'Avg Score' : 'Participation'
                      ]}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="avgScore" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Avg Score"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="participation" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Participation %"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* History Table */}
              <div className="space-y-3">
                {[
                  {
                    date: 'Jan 1-7, 2024',
                    name: 'January Pulse Survey',
                    participation: 85,
                    avgScore: 7.8,
                    enps: 42,
                    status: 'completed'
                  },
                  {
                    date: 'Dec 1-7, 2023',
                    name: 'December Pulse Survey',
                    participation: 85,
                    avgScore: 7.5,
                    enps: 38,
                    status: 'completed'
                  },
                  {
                    date: 'Nov 1-7, 2023',
                    name: 'November Pulse Survey',
                    participation: 88,
                    avgScore: 7.6,
                    enps: 41,
                    status: 'completed'
                  },
                  {
                    date: 'Oct 1-7, 2023',
                    name: 'October Pulse Survey',
                    participation: 75,
                    avgScore: 7.1,
                    enps: 35,
                    status: 'completed'
                  }
                ].map((survey, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{survey.name}</div>
                        <div className="text-sm text-muted-foreground">{survey.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-semibold">{survey.participation}%</div>
                        <div className="text-xs text-muted-foreground">Participation</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{survey.avgScore}</div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{survey.enps}</div>
                        <div className="text-xs text-muted-foreground">eNPS</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={survey.status === 'completed' ? 'default' : 'secondary'}>
                          {survey.status === 'completed' ? 'Completed' : 'Ongoing'}
                        </Badge>
                        <Button variant="outline" size="sm">View Results</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Upcoming / Scheduled Surveys */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Upcoming Surveys</CardTitle>
              <CardDescription>Next scheduled surveys for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    date: 'Feb 1-7, 2024',
                    name: 'February Pulse Survey',
                    status: 'scheduled',
                    questions: 12,
                    time: '60 sec',
                    createdBy: 'Admin'
                  }
                ].map((survey, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-semibold">{survey.name}</div>
                          <div className="text-sm text-muted-foreground">{survey.date}</div>
                          <div className="text-xs text-muted-foreground">
                            {survey.questions} questions • {survey.time} expected time
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={survey.status === 'scheduled' ? 'default' : 'secondary'}>
                          {survey.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                        </Badge>
                        <Button variant="outline" size="sm">Request Change</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Drafts (read-only for Managers) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Survey Drafts</CardTitle>
              <CardDescription>Drafts created by Admin (read-only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'March Engagement Survey',
                    createdBy: 'Admin',
                    lastEdited: 'Jan 15, 2024',
                    questions: 15,
                    status: 'draft'
                  }
                ].map((draft, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{draft.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Created by {draft.createdBy} • Last edited {draft.lastEdited}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {draft.questions} questions
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Draft</Badge>
                        <Button variant="outline" size="sm">Request Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 5. Permissions & Guardrails */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Permissions & Guardrails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>Managers cannot create or edit surveys (Admin controls survey creation)</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>All data respects min-n anonymity rule (&lt;4 responses = "Not enough data")</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>Managers can request changes (timing, content, cadence) via Admin</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>View past & current team survey results only</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Admin/Owner view - use existing Surveys component
    return <Surveys />;
  };

  const renderReports = () => {
    if (isManager) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Reports</h1>
              <p className="text-gray-600 mt-2">Proof for your team - shareable, anonymized reports</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* 1. Team Monthly Digest (hero card) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Monthly Digest</CardTitle>
                  <CardDescription>January 2024 - Executive summary for your team</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4 mr-2" />
                    Share Link
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">7.8</div>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+0.3 vs last month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Team Score</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+42</div>
                  <div className="text-xs text-muted-foreground mt-1">65% Promoters | 25% Passives | 10% Detractors</div>
                  <div className="text-sm text-muted-foreground">eNPS</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+5% vs last month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Participation</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">68%</div>
                  <div className="text-xs text-muted-foreground mt-1">Positive | 22% Neutral | 10% Negative</div>
                  <div className="text-sm text-muted-foreground">Sentiment</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Perfect for team retros, 1:1s, and sharing with your manager
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Trend Reports (charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle>Team Performance Trends</CardTitle>
                <CardDescription>Avg Score + Participation over last 6 surveys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { survey: 'Aug', avgScore: 7.2, participation: 78 },
                      { survey: 'Sep', avgScore: 7.4, participation: 82 },
                      { survey: 'Oct', avgScore: 7.1, participation: 75 },
                      { survey: 'Nov', avgScore: 7.6, participation: 88 },
                      { survey: 'Dec', avgScore: 7.5, participation: 85 },
                      { survey: 'Jan', avgScore: 7.8, participation: 85 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="survey" />
                      <YAxis yAxisId="left" domain={[0, 10]} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          name === 'avgScore' ? `${value}/10` : `${value}%`,
                          name === 'avgScore' ? 'Avg Score' : 'Participation'
                        ]}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="avgScore" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Avg Score"
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="participation" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Participation %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
              <CardHeader>
                <CardTitle>Driver Performance</CardTitle>
                <CardDescription>Strongest vs weakest drivers (latest survey)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { driver: 'Collaboration', score: 8.2, color: '#10b981' },
                      { driver: 'Communication', score: 7.9, color: '#10b981' },
                      { driver: 'Growth', score: 7.5, color: '#f59e0b' },
                      { driver: 'Workload', score: 6.8, color: '#ef4444' },
                      { driver: 'Recognition', score: 6.1, color: '#ef4444' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="driver" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip formatter={(value: any) => [`${value}/10`, 'Score']} />
                      <Bar dataKey="score" fill="#3b82f6">
                        {[
                          { driver: 'Collaboration', score: 8.2, color: '#10b981' },
                          { driver: 'Communication', score: 7.9, color: '#10b981' },
                          { driver: 'Growth', score: 7.5, color: '#f59e0b' },
                          { driver: 'Workload', score: 6.8, color: '#ef4444' },
                          { driver: 'Recognition', score: 6.1, color: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. Before / After Comparison */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Before / After Comparison</CardTitle>
                  <CardDescription>Compare two survey periods</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value="dec" onValueChange={(value) => console.log('Before:', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Before" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nov">November</SelectItem>
                      <SelectItem value="dec">December</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">vs</span>
                  <Select value="jan" onValueChange={(value) => console.log('After:', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="After" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dec">December</SelectItem>
                      <SelectItem value="jan">January</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Comparison
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-center">December 2023</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-blue-600">7.5</div>
                      <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-green-600">+38</div>
                      <div className="text-xs text-muted-foreground">eNPS</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-purple-600">85%</div>
                      <div className="text-xs text-muted-foreground">Participation</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-orange-600">62%</div>
                      <div className="text-xs text-muted-foreground">Positive</div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-2">Top 3 Declined:</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>• Recognition (-0.8)</div>
                      <div>• Workload (-0.5)</div>
                      <div>• Growth (-0.2)</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-center">January 2024</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-blue-600">7.8</div>
                      <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-green-600">+42</div>
                      <div className="text-xs text-muted-foreground">eNPS</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-purple-600">85%</div>
                      <div className="text-xs text-muted-foreground">Participation</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-orange-600">68%</div>
                      <div className="text-xs text-muted-foreground">Positive</div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-2">Top 3 Improved:</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>• Recognition (+0.7)</div>
                      <div>• Communication (+0.4)</div>
                      <div>• Collaboration (+0.3)</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Export Options */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Generate and share reports (read-only scope)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Download className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Download PDF</h3>
                  <p className="text-sm text-muted-foreground mb-3">Branded, clean, anonymized report</p>
                  <Button variant="outline" size="sm">Generate PDF</Button>
                </div>

                <div className="p-4 border rounded-lg text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">CSV Export</h3>
                  <p className="text-sm text-muted-foreground mb-3">Aggregates only, never raw answers</p>
                  <Button variant="outline" size="sm">Export CSV</Button>
                </div>

                <div className="p-4 border rounded-lg text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Share className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Shareable Link</h3>
                  <p className="text-sm text-muted-foreground mb-3">Read-only, expires after 30 days</p>
                  <Button variant="outline" size="sm">Create Link</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Report Library (history) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Report Library</CardTitle>
              <CardDescription>All past generated reports for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: 'Team Monthly Digest - January 2024',
                    period: 'Jan 1-31, 2024',
                    format: 'PDF',
                    dateGenerated: 'Jan 15, 2024',
                    status: 'active'
                  },
                  {
                    name: 'Before/After Comparison - Dec vs Jan',
                    period: 'Dec 2023 - Jan 2024',
                    format: 'PDF',
                    dateGenerated: 'Jan 10, 2024',
                    status: 'active'
                  },
                  {
                    name: 'Team Performance Trends',
                    period: 'Aug 2023 - Jan 2024',
                    format: 'CSV',
                    dateGenerated: 'Jan 5, 2024',
                    status: 'active'
                  }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.period} • {report.format}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Generated {report.dateGenerated}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                      <Button variant="outline" size="sm">Download</Button>
                      <Button variant="outline" size="sm">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {false && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No reports generated yet</h3>
                  <p className="text-muted-foreground">Download your first Team Digest above to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 6. Permissions & Guardrails */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Permissions & Guardrails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>Manager only sees their assigned team(s)</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>Reports always respect min-n anonymity rule (&lt;4 responses = no report)</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>Export content: aggregates, trends, themes — never individual responses</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>Admin controls global styling (logo, disclaimers)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Admin/Owner view - use existing Reports component
    return <Reports />;
  };

  const renderActiveSection = () => {
    switch (currentSection) {
      case 'overview':
        return renderOverview();
      case 'team-trends':
        return renderTeamTrends();
      case 'feedback':
        return renderFeedback();
      case 'alerts':
        return renderAlerts();
              case 'employees':
          return renderEngagement();
      case 'surveys':
        return renderSurveys();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  const renderSettings = () => {
    if (isManager) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Settings</h1>
              <p className="text-gray-600 mt-2">Personal preferences and team-level controls</p>
            </div>
          </div>

          {/* 1. Profile & Notifications */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Profile & Notifications</CardTitle>
              <CardDescription>Manage your profile and notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Profile Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Sarah Johnson" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="sarah.johnson@company.com" disabled />
                    <p className="text-xs text-muted-foreground">Email is read-only (contact Admin to change)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                  <Button variant="outline">Change Avatar</Button>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="survey-reminders">Survey Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get notified when surveys are sent to your team</p>
                    </div>
                    <Switch id="survey-reminders" defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Alert Notifications</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-alerts" defaultChecked />
                        <Label htmlFor="email-alerts">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="slack-alerts" defaultChecked />
                        <Label htmlFor="slack-alerts">Slack</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="teams-alerts" />
                        <Label htmlFor="teams-alerts">Microsoft Teams</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="digest-cadence">Digest Cadence</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue placeholder="Select cadence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quiet-hours">Quiet Hours</Label>
                    <div className="flex items-center gap-2">
                      <Input type="time" defaultValue="20:00" className="w-32" />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input type="time" defaultValue="08:00" className="w-32" />
                    </div>
                    <p className="text-xs text-muted-foreground">No alert notifications during these hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Team Assignments (read-only) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Assignments</CardTitle>
                  <CardDescription>Teams you manage (read-only)</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Request Change
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: 'Engineering Team',
                    size: 12,
                    surveysCompleted: 8,
                    nextSurvey: 'Feb 1, 2024'
                  },
                  {
                    name: 'Product Team',
                    size: 8,
                    surveysCompleted: 6,
                    nextSurvey: 'Feb 1, 2024'
                  }
                ].map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.size} members • {team.surveysCompleted} surveys completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Next Survey</div>
                      <div className="text-sm text-muted-foreground">{team.nextSurvey}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Info className="w-4 h-4 inline mr-2" />
                  Cannot reassign teams yourself. Contact Admin to request changes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Survey Settings (limited controls) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Survey Settings</CardTitle>
              <CardDescription>Limited team-level controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder-count">Survey Reminders</Label>
                  <Select defaultValue="2">
                    <SelectTrigger>
                      <SelectValue placeholder="Number of reminders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 reminder</SelectItem>
                      <SelectItem value="2">2 reminders</SelectItem>
                      <SelectItem value="3">3 reminders</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Number of reminders sent to your team</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-timing">Reminder Timing</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger>
                      <SelectValue placeholder="Timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 hours before close</SelectItem>
                      <SelectItem value="24h">24 hours before close</SelectItem>
                      <SelectItem value="48h">48 hours before close</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="survey-window">Survey Window Adjustment</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">-1 Day</Button>
                    <span className="text-sm">Current: 7 days</span>
                    <Button variant="outline" size="sm">+1 Day</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Propose shifting close date by ±1 day</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="survey-cadence">Survey Cadence</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Current: Monthly</span>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Change
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Only Admin can change global cadence</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Feedback Visibility Preferences */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Feedback Visibility Preferences</CardTitle>
              <CardDescription>Control what feedback you see (subject to Admin privacy defaults)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-themes">Show Themes & Sentiment Summary</Label>
                  <p className="text-sm text-muted-foreground">View aggregated themes and sentiment analysis</p>
                </div>
                <Switch id="show-themes" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-comments">Show Comment Feed</Label>
                  <p className="text-sm text-muted-foreground">View anonymous comments (if min-n rule is met)</p>
                </div>
                <Switch id="show-comments" defaultChecked />
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  All toggles are subject to Admin privacy defaults. Your org default is "Show all feedback when min-n=4".
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Export Access */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Export Access</CardTitle>
              <CardDescription>What you can export for your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">Team Digest PDF</div>
                      <div className="text-sm text-muted-foreground">Monthly summary reports</div>
                    </div>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">Team CSV Aggregates</div>
                      <div className="text-sm text-muted-foreground">Aggregated data only</div>
                    </div>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">Individual Responses</div>
                      <div className="text-sm text-muted-foreground">Raw survey answers</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Exports respect anonymity rules (min-n=4). Never includes individual responses.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Request Center */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Request Center</CardTitle>
              <CardDescription>Request changes from Admin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Request New Survey Questions</div>
                    <div className="text-sm text-muted-foreground">Suggest questions for upcoming surveys</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Request Help with Low Participation</div>
                    <div className="text-sm text-muted-foreground">Get support for improving team engagement</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Suggest Survey Cadence Improvement</div>
                    <div className="text-sm text-muted-foreground">Propose changes to survey timing</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  All requests are sent to Admin dashboard → Notifications for review.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 7. Admin-Controlled Settings (read-only) */}
          <Card className="border border-gray-200 bg-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Admin-Controlled Settings</CardTitle>
              <CardDescription>Org-level settings (read-only for managers)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Min-N Anonymity Rule</div>
                    <div className="text-sm text-muted-foreground">Minimum responses required for data visibility</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">4 responses</div>
                    <Badge variant="secondary">Admin Controlled</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Alert Thresholds</div>
                    <div className="text-sm text-muted-foreground">Score drop triggers for alerts</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">&gt;1.0 drop</div>
                    <Badge variant="secondary">Admin Controlled</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Survey Cadence</div>
                    <div className="text-sm text-muted-foreground">Global survey frequency</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Monthly</div>
                    <Badge variant="secondary">Admin Controlled</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Billing & Integrations</div>
                    <div className="text-sm text-muted-foreground">Payment and third-party connections</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Admin Controlled</Badge>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <Lock className="w-4 h-4 inline mr-2" />
                  These settings control org-wide policies and cannot be changed by managers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Admin/Owner view - use existing Settings component
    return <Settings />;
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {renderActiveSection()}
        </div>
      </div>

      {/* Create Survey Modal - Admin Only */}
      {isOwnerOrAdmin && (
        <Dialog open={showCreateSurvey} onOpenChange={setShowCreateSurvey}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Survey</DialogTitle>
              <DialogDescription>
                Start building your survey with our easy-to-use builder.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button 
                onClick={() => {
                  setShowCreateSurvey(false);
                  // Navigate to survey builder
                  window.location.href = '/create-survey';
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Building
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UnifiedDashboard;
