import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Eye,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Calendar,
  Target
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  overallScore: number;
  participationRate: number;
  dropAlerts: number;
  monthlyTrend: number;
  totalEmployees: number;
  totalResponses: number;
}

interface TeamHealth {
  id: string;
  name: string;
  currentScore: number;
  changeVsLastMonth: number;
  participationRate: number;
  hasDropAlert: boolean;
  employeeCount: number;
  responseCount: number;
}

interface DropAlert {
  id: string;
  teamName: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  scoreDrop: number;
  suggestedAction: string;
  createdAt: string;
}

interface FeedbackSnippet {
  id: string;
  comment: string;
  team: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: string;
  tags: string[];
}

const PulseOverview = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    overallScore: 7.3,
    participationRate: 78,
    dropAlerts: 2,
    monthlyTrend: 0.8,
    totalEmployees: 156,
    totalResponses: 122
  });
  const [teams, setTeams] = useState<TeamHealth[]>([]);
  const [dropAlerts, setDropAlerts] = useState<DropAlert[]>([]);
  const [feedbackSnippets, setFeedbackSnippets] = useState<FeedbackSnippet[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const dashboardStats = await api.getDashboardStats();
        setStats({
          overallScore: 7.3,
          participationRate: 78,
          dropAlerts: 2,
          monthlyTrend: 0.8,
          totalEmployees: 156,
          totalResponses: 122
        });
        
        // Fetch team breakdown and transform to match interface
        const teamData = await api.getTeamBreakdown();
        const transformedTeams: TeamHealth[] = teamData.map((team: any) => ({
          id: team.id,
          name: team.name,
          currentScore: team.avgScore,
          changeVsLastMonth: team.scoreChange,
          participationRate: Math.round((team.responseCount / 25) * 100), // Mock calculation
          hasDropAlert: team.alerts.length > 0,
          employeeCount: 25, // Mock data
          responseCount: team.responseCount
        }));
        setTeams(transformedTeams);
        
        // Mock drop alerts data
        setDropAlerts([
          {
            id: "1",
            teamName: "Sales",
            severity: "high",
            message: "Team score dropped 2.1 points this month",
            scoreDrop: 2.1,
            suggestedAction: "Schedule team check-in meeting",
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            teamName: "Marketing",
            severity: "medium",
            message: "Participation rate below 60%",
            scoreDrop: 0.8,
            suggestedAction: "Send reminder email",
            createdAt: new Date().toISOString()
          }
        ]);
        
        // Mock feedback snippets
        setFeedbackSnippets([
          {
            id: "1",
            comment: "Great team collaboration this month!",
            team: "Engineering",
            sentiment: "positive",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            tags: ["collaboration", "positive"]
          },
          {
            id: "2",
            comment: "Need more clarity on project priorities",
            team: "Sales",
            sentiment: "negative",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            tags: ["priorities", "communication"]
          },
          {
            id: "3",
            comment: "Work-life balance has improved",
            team: "Marketing",
            sentiment: "positive",
            createdAt: new Date(Date.now() - 10800000).toISOString(),
            tags: ["work-life-balance", "positive"]
          }
        ]);
        
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
  }, [toast]);

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'text-green-600 bg-green-100';
    if (score >= 6.0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 7.5) return 'bg-green-50 border-green-200';
    if (score >= 6.0) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time team sentiment & risk overview</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score */}
        <Card className={`${getScoreBackground(stats.overallScore)}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-3xl font-bold ${getScoreColor(stats.overallScore).split(' ')[0]}`}>
                  {stats.overallScore}/10
                </span>
                {getTrendIcon(stats.monthlyTrend)}
              </div>
              <Badge variant="outline" className={getScoreColor(stats.overallScore)}>
                {stats.monthlyTrend > 0 ? '+' : ''}{stats.monthlyTrend.toFixed(1)}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last month</p>
          </CardContent>
        </Card>

        {/* Participation Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Participation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-600">{stats.participationRate}%</span>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress value={stats.participationRate} className="h-2" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalResponses} of {stats.totalEmployees} employees
            </p>
          </CardContent>
        </Card>

        {/* Drop Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Drop Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${stats.dropAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.dropAlerts}
              </span>
              <AlertTriangle className={`w-8 h-8 ${stats.dropAlerts > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.dropAlerts > 0 ? 'Teams need attention' : 'All teams healthy'}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-3xl font-bold ${stats.monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.monthlyTrend >= 0 ? '+' : ''}{stats.monthlyTrend.toFixed(1)}
                </span>
                <TrendingUp className={`w-8 h-8 ${stats.monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Score change</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Health Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Team Health</span>
          </CardTitle>
          <CardDescription>Current team scores and participation rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Team</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Current Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Change</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Participation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Alert</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{team.name}</div>
                      <div className="text-sm text-gray-500">{team.employeeCount} employees</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${getScoreColor(team.currentScore).split(' ')[0]}`}>
                        {team.currentScore}/10
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(team.changeVsLastMonth)}
                        <span className={`text-sm ${team.changeVsLastMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {team.changeVsLastMonth >= 0 ? '+' : ''}{team.changeVsLastMonth.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Progress value={team.participationRate} className="w-16 h-2" />
                        <span className="text-sm text-gray-600">{team.participationRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {team.hasDropAlert && (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drop Alerts Module */}
      {dropAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Drop Alerts</span>
              <Badge variant="destructive">{dropAlerts.length}</Badge>
            </CardTitle>
            <CardDescription className="text-red-600">
              Teams that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dropAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{alert.teamName}</span>
                      <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{alert.message}</p>
                    <p className="text-xs text-gray-500">Score drop: {alert.scoreDrop} points</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      View Comments
                    </Button>
                    <Button size="sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {alert.suggestedAction}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Feedback Snippets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Recent Feedback</span>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardTitle>
          <CardDescription>Latest anonymous comments from teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbackSnippets.map((feedback) => (
              <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{feedback.team}</span>
                    <Badge className={getSentimentColor(feedback.sentiment)}>
                      {feedback.sentiment}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{feedback.comment}</p>
                <div className="flex items-center space-x-2">
                  {feedback.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PulseOverview; 