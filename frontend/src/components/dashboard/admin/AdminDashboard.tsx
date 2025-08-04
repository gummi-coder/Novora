import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalTeams: number;
  activeSurveys: number;
  totalResponses: number;
  avgParticipation: number;
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

const AdminDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalTeams: 2,
    activeSurveys: 3,
    totalResponses: 156,
    avgParticipation: 78,
    alertsCount: 5,
    avgScore: 7.2,
    scoreChange: 0.3
  });
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        setLoading(true);
        
        // Mock team performance data
        const mockTeamPerformance: TeamPerformance[] = [
          {
            id: "1",
            name: "Sales",
            score: 6.8,
            change: -0.2,
            participation: 75,
            responses: 45,
            alerts: 2,
            status: 'declining'
          },
          {
            id: "2",
            name: "Marketing",
            score: 7.5,
            change: 0.4,
            participation: 82,
            responses: 32,
            alerts: 1,
            status: 'improving'
          }
        ];
        setTeamPerformance(mockTeamPerformance);

        // Mock recent activity
        const mockRecentActivity: RecentActivity[] = [
          {
            id: "1",
            type: "alert",
            description: "Sales team score dropped by 0.2 points",
            team: "Sales",
            timestamp: "2024-01-15T10:30:00Z",
            priority: 'high'
          },
          {
            id: "2",
            type: "survey",
            description: "New survey created for Marketing team",
            team: "Marketing",
            timestamp: "2024-01-15T09:15:00Z",
            priority: 'medium'
          },
          {
            id: "3",
            type: "response",
            description: "High participation rate achieved in Sales survey",
            team: "Sales",
            timestamp: "2024-01-15T08:45:00Z",
            priority: 'low'
          },
          {
            id: "4",
            type: "feedback",
            description: "New anonymous comment flagged for review",
            team: "Marketing",
            timestamp: "2024-01-15T08:30:00Z",
            priority: 'high'
          }
        ];
        setRecentActivity(mockRecentActivity);
        
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'improving': return 'text-green-600 bg-green-100';
      case 'stable': return 'text-blue-600 bg-blue-100';
      case 'declining': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'improving': return <TrendingUp className="w-4 h-4" />;
      case 'stable': return <CheckCircle className="w-4 h-4" />;
      case 'declining': return <TrendingDown className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'survey': return <BarChart3 className="w-4 h-4" />;
      case 'response': return <MessageSquare className="w-4 h-4" />;
      case 'feedback': return <MessageSquare className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your teams and surveys</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Teams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams Managed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
            <div className="text-sm text-muted-foreground">
              Active teams
            </div>
          </CardContent>
        </Card>

        {/* Active Surveys */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSurveys}</div>
            <div className="text-sm text-muted-foreground">
              Currently running
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}/10</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {stats.scoreChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={stats.scoreChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.scoreChange > 0 ? '+' : ''}{stats.scoreChange} from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alertsCount}</div>
            <div className="text-sm text-muted-foreground">
              Require attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Team Performance</span>
          </CardTitle>
          <CardDescription>Overview of your managed teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformance.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="font-semibold">{team.name}</div>
                    <div className="text-sm text-gray-500">
                      {team.responses} responses • {team.alerts} alerts
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Score */}
                  <div className="text-center">
                    <div className="text-lg font-bold">{team.score}/10</div>
                    <div className="flex items-center space-x-1 text-sm">
                      {team.change > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={team.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {team.change > 0 ? '+' : ''}{team.change}
                      </span>
                    </div>
                  </div>

                  {/* Participation */}
                  <div className="text-center">
                    <div className="text-lg font-bold">{team.participation}%</div>
                    <div className="text-sm text-gray-500">Participation</div>
                  </div>

                  {/* Status */}
                  <Badge className={getStatusColor(team.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(team.status)}
                      <span>{team.status.charAt(0).toUpperCase() + team.status.slice(1)}</span>
                    </div>
                  </Badge>

                  {/* Actions */}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>Latest updates from your teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{activity.description}</div>
                    <Badge className={getPriorityColor(activity.priority)}>
                      {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <span>{activity.team}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for managing your teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center space-x-2 h-auto p-4">
              <BarChart3 className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Create Survey</div>
                <div className="text-sm text-gray-500">New survey for teams</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
              <MessageSquare className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Review Feedback</div>
                <div className="text-sm text-gray-500">Check recent comments</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
              <AlertTriangle className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">View Alerts</div>
                <div className="text-sm text-gray-500">Address team issues</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 