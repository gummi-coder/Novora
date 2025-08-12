import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  const navigate = useNavigate();
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
  
  // Modal states
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showSurveysModal, setShowSurveysModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showAllTeamsModal, setShowAllTeamsModal] = useState(false);
  const [showAllActivityModal, setShowAllActivityModal] = useState(false);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamPerformance | null>(null);

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

  // KPI Card handlers
  const handleTeamsClick = () => {
    setShowTeamsModal(true);
    toast({
      title: "Teams Overview",
      description: "Opening detailed teams information",
    });
  };

  const handleSurveysClick = () => {
    setShowSurveysModal(true);
    toast({
      title: "Active Surveys",
      description: "Opening surveys management",
    });
  };

  const handleScoreClick = () => {
    setShowScoreModal(true);
    toast({
      title: "Score Analysis",
      description: "Opening detailed score breakdown",
    });
  };

  const handleAlertsClick = () => {
    setShowAlertsModal(true);
    toast({
      title: "Active Alerts",
      description: "Opening alerts management",
    });
  };

  // Button handlers
  const handleViewAllTeams = () => {
    setShowAllTeamsModal(true);
    toast({
      title: "All Teams",
      description: "Opening comprehensive teams view",
    });
  };

  const handleViewDetails = (teamId: string) => {
    const team = teamPerformance.find(t => t.id === teamId);
    if (team) {
      setSelectedTeam(team);
      setShowTeamDetailsModal(true);
      toast({
        title: "Team Details",
        description: `Opening detailed view for ${team.name}`,
      });
    }
  };

  const handleViewAllActivity = () => {
    setShowAllActivityModal(true);
    toast({
      title: "All Activity",
      description: "Opening comprehensive activity log",
    });
  };

  // Quick Actions handlers
  const handleReviewFeedback = () => {
    navigate('/dashboard?section=feedback');
    toast({
      title: "Review Feedback",
      description: "Navigating to feedback review panel",
    });
  };

  const handleViewAlerts = () => {
    navigate('/dashboard?section=alerts');
    toast({
      title: "View Alerts",
      description: "Navigating to alerts management",
    });
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive overview of your teams, surveys, and organizational health metrics
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Teams */}
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-blue-50"
            onClick={handleTeamsClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Teams Managed</CardTitle>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalTeams}</div>
              <div className="text-sm text-gray-500 mt-1">
                Active teams
              </div>
            </CardContent>
          </Card>

          {/* Active Surveys */}
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-green-50"
            onClick={handleSurveysClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Surveys</CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.activeSurveys}</div>
              <div className="text-sm text-gray-500 mt-1">
                Currently running
              </div>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-purple-50"
            onClick={handleScoreClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.avgScore}/10</div>
              <div className="flex items-center space-x-2 text-sm mt-1">
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
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-orange-50"
            onClick={handleAlertsClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.alertsCount}</div>
              <div className="text-sm text-gray-500 mt-1">
                Require attention
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Team Performance */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Team Performance</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Overview of your managed teams and their engagement metrics
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewAllTeams}>
                View All Teams
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{team.name}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>{team.responses} responses</span>
                        <span>•</span>
                        <span>{team.alerts} alerts</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    {/* Score */}
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{team.score}/10</div>
                      <div className="flex items-center space-x-1 text-sm mt-1">
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
                      <div className="text-xl font-bold text-gray-900">{team.participation}%</div>
                      <div className="text-sm text-gray-500">Participation</div>
                    </div>

                    {/* Status */}
                    <Badge className={`${getStatusColor(team.status)} px-3 py-1`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(team.status)}
                        <span className="font-medium">{team.status.charAt(0).toUpperCase() + team.status.slice(1)}</span>
                      </div>
                    </Badge>

                    {/* Actions */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-blue-50 hover:border-blue-200"
                      onClick={() => handleViewDetails(team.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activity */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Latest updates and important events from your teams
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewAllActivity}>
                View All Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{activity.description}</div>
                      <Badge className={`${getPriorityColor(activity.priority)} px-2 py-1`}>
                        {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="font-medium">{activity.team}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Common tasks and shortcuts for managing your teams effectively
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button 
                className="flex items-center space-x-4 h-auto p-6 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                onClick={() => navigate('/surveys/create')}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-white">Create Survey</div>
                  <div className="text-sm text-white/80">New survey for teams</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center space-x-4 h-auto p-6 hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                onClick={handleReviewFeedback}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Review Feedback</div>
                  <div className="text-sm text-gray-500">Check recent comments</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center space-x-4 h-auto p-6 hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                onClick={handleViewAlerts}
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">View Alerts</div>
                  <div className="text-sm text-gray-500">Address team issues</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teams Modal */}
        <Dialog open={showTeamsModal} onOpenChange={setShowTeamsModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Teams Overview</span>
              </DialogTitle>
              <DialogDescription>
                Comprehensive view of all managed teams and their performance metrics
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalTeams}</div>
                  <div className="text-sm text-blue-700">Total Teams</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats.avgParticipation}%</div>
                  <div className="text-sm text-green-700">Avg Participation</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalResponses}</div>
                  <div className="text-sm text-purple-700">Total Responses</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Team Performance Summary</h3>
                {teamPerformance.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">{team.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{team.name}</div>
                        <div className="text-sm text-gray-500">{team.responses} responses, {team.alerts} alerts</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{team.score}/10</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{team.participation}%</div>
                        <div className="text-xs text-gray-500">Participation</div>
                      </div>
                      <Badge className={getStatusColor(team.status)}>
                        {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Surveys Modal */}
        <Dialog open={showSurveysModal} onOpenChange={setShowSurveysModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <span>Active Surveys</span>
              </DialogTitle>
              <DialogDescription>
                Manage and monitor all currently active surveys across teams
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats.activeSurveys}</div>
                  <div className="text-sm text-green-700">Active Surveys</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalResponses}</div>
                  <div className="text-sm text-blue-700">Total Responses</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.avgParticipation}%</div>
                  <div className="text-sm text-purple-700">Avg Participation</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Survey Details</h3>
                <div className="space-y-3">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Q1 Culture Survey</div>
                        <div className="text-sm text-gray-500">Sales & Marketing Teams</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">45</div>
                          <div className="text-xs text-gray-500">Responses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">75%</div>
                          <div className="text-xs text-gray-500">Participation</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Employee Engagement Survey</div>
                        <div className="text-sm text-gray-500">All Teams</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">32</div>
                          <div className="text-xs text-gray-500">Responses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">82%</div>
                          <div className="text-xs text-gray-500">Participation</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Team Feedback Survey</div>
                        <div className="text-sm text-gray-500">Engineering Team</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">28</div>
                          <div className="text-xs text-gray-500">Responses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">90%</div>
                          <div className="text-xs text-gray-500">Participation</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Score Modal */}
        <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-purple-600" />
                <span>Score Analysis</span>
              </DialogTitle>
              <DialogDescription>
                Detailed breakdown of organizational scores and trends
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.avgScore}/10</div>
                  <div className="text-sm text-purple-700">Average Score</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">+{stats.scoreChange}</div>
                  <div className="text-sm text-green-700">Monthly Change</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.avgParticipation}%</div>
                  <div className="text-sm text-blue-700">Participation Rate</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Score Breakdown by Team</h3>
                {teamPerformance.map((team) => (
                  <div key={team.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">{team.name.charAt(0)}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{team.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{team.score}/10</div>
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
                    </div>
                    <Progress value={team.score * 10} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Modal */}
        <Dialog open={showAlertsModal} onOpenChange={setShowAlertsModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <span>Active Alerts</span>
              </DialogTitle>
              <DialogDescription>
                Manage and address all active alerts requiring attention
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{stats.alertsCount}</div>
                  <div className="text-sm text-orange-700">Active Alerts</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <div className="text-sm text-red-700">High Priority</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-yellow-700">Medium Priority</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Alert Details</h3>
                <div className="space-y-3">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-red-900">Sales team score dropped by 0.2 points</div>
                        <div className="text-sm text-red-700">Team: Sales • 2 hours ago</div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-red-900">New anonymous comment flagged for review</div>
                        <div className="text-sm text-red-700">Team: Marketing • 4 hours ago</div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-yellow-900">Participation rate below 70%</div>
                        <div className="text-sm text-yellow-700">Team: Finance • 6 hours ago</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-yellow-900">Survey response rate declining</div>
                        <div className="text-sm text-yellow-700">Team: Operations • 1 day ago</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-yellow-900">Team engagement score below threshold</div>
                        <div className="text-sm text-yellow-700">Team: HR • 2 days ago</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* All Teams Modal */}
        <Dialog open={showAllTeamsModal} onOpenChange={setShowAllTeamsModal}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>All Teams</span>
              </DialogTitle>
              <DialogDescription>
                Comprehensive view of all teams under your management
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalTeams}</div>
                  <div className="text-sm text-blue-700">Total Teams</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats.avgParticipation}%</div>
                  <div className="text-sm text-green-700">Avg Participation</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.avgScore}/10</div>
                  <div className="text-sm text-purple-700">Avg Score</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{stats.alertsCount}</div>
                  <div className="text-sm text-orange-700">Active Alerts</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Team Performance Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-semibold text-gray-900">Team</th>
                        <th className="text-center p-3 font-semibold text-gray-900">Score</th>
                        <th className="text-center p-3 font-semibold text-gray-900">Change</th>
                        <th className="text-center p-3 font-semibold text-gray-900">Participation</th>
                        <th className="text-center p-3 font-semibold text-gray-900">Responses</th>
                        <th className="text-center p-3 font-semibold text-gray-900">Alerts</th>
                        <th className="text-center p-3 font-semibold text-gray-900">Status</th>
                        <th className="text-center p-3 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamPerformance.map((team, index) => (
                        <tr key={team.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-600">{team.name.charAt(0)}</span>
                              </div>
                              <span className="font-semibold text-gray-900">{team.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{team.score}/10</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {team.change > 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              )}
                              <span className={team.change > 0 ? 'text-green-600' : 'text-red-600'}>
                                {team.change > 0 ? '+' : ''}{team.change}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{team.participation}%</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{team.responses}</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{team.alerts}</div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className={getStatusColor(team.status)}>
                              {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(team.id)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* All Activity Modal */}
        <Dialog open={showAllActivityModal} onOpenChange={setShowAllActivityModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-green-600" />
                <span>All Activity</span>
              </DialogTitle>
              <DialogDescription>
                Complete activity log with all recent events and updates
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{activity.description}</div>
                          <Badge className={`${getPriorityColor(activity.priority)} px-2 py-1`}>
                            {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="font-medium">{activity.team}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Details Modal */}
        <Dialog open={showTeamDetailsModal} onOpenChange={setShowTeamDetailsModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Team Details - {selectedTeam?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Comprehensive overview of team performance, metrics, and recent activity
              </DialogDescription>
            </DialogHeader>
            
            {selectedTeam && (
              <div className="space-y-6">
                {/* Team Header */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-600">
                      {selectedTeam.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedTeam.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{selectedTeam.responses} responses</span>
                      <span>•</span>
                      <span>{selectedTeam.alerts} alerts</span>
                      <span>•</span>
                      <Badge className={getStatusColor(selectedTeam.status)}>
                        {selectedTeam.status.charAt(0).toUpperCase() + selectedTeam.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{selectedTeam.score}/10</div>
                    <div className="text-sm text-blue-700">Current Score</div>
                    <div className="flex items-center space-x-1 text-xs mt-1">
                      {selectedTeam.change > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={selectedTeam.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {selectedTeam.change > 0 ? '+' : ''}{selectedTeam.change} change
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{selectedTeam.participation}%</div>
                    <div className="text-sm text-green-700">Participation Rate</div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{selectedTeam.responses}</div>
                    <div className="text-sm text-purple-700">Total Responses</div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{selectedTeam.alerts}</div>
                    <div className="text-sm text-orange-700">Active Alerts</div>
                  </div>
                </div>

                {/* Score Progress */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Score Progress</h4>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Current Score</span>
                      <span className="text-sm font-bold text-gray-900">{selectedTeam.score}/10</span>
                    </div>
                    <Progress value={selectedTeam.score * 10} className="h-3" />
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity for this team */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Recent Activity</h4>
                  <div className="space-y-3">
                    {recentActivity
                      .filter(activity => activity.team === selectedTeam.name)
                      .slice(0, 5)
                      .map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm font-medium text-gray-900">{activity.description}</div>
                              <Badge className={`${getPriorityColor(activity.priority)} px-2 py-1 text-xs`}>
                                {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTimeAgo(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>



                {/* Performance Insights */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Performance Insights</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Score Trend</span>
                        <div className="flex items-center space-x-1">
                          {selectedTeam.change > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${selectedTeam.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedTeam.change > 0 ? 'Improving' : 'Declining'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Participation Level</span>
                        <span className={`text-sm font-medium ${selectedTeam.participation >= 80 ? 'text-green-600' : selectedTeam.participation >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {selectedTeam.participation >= 80 ? 'Excellent' : selectedTeam.participation >= 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Alert Status</span>
                        <span className={`text-sm font-medium ${selectedTeam.alerts === 0 ? 'text-green-600' : selectedTeam.alerts <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {selectedTeam.alerts === 0 ? 'No Issues' : selectedTeam.alerts <= 2 ? 'Minor Issues' : 'Critical Issues'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard; 