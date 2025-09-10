import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Bell,
  Share,
  Download,
  Filter,
  Settings,
  Eye,
  Plus,
  FileText,
  Building,
  Calendar,
  Shield,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminDashboardProps {
  currentSection?: string;
}

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

interface TeamMember {
  id: number;
  name: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  lastSurvey: string;
  participation: number;
}

interface TeamAlert {
  id: number;
  type: 'score-drop' | 'participation' | 'sentiment';
  title: string;
  message: string;
  severity: 'critical' | 'medium' | 'low';
  acknowledged: boolean;
  date: string;
}

interface TeamFeedback {
  id: number;
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  dimension: string;
  surveyDate: string;
  responseCount: number;
  team: string;
  needsHRFollowUp: boolean;
  hidden: boolean;
}

interface TeamSurvey {
  id: number;
  name: string;
  status: 'Active' | 'Completed' | 'Scheduled' | 'Draft';
  participation: number;
  dueDate: string;
  isAutoPilot: boolean;
  team: string;
}

interface TeamReport {
  id: number;
  name: string;
  type: 'current-cycle' | 'last-quarter' | 'custom-range';
  generatedDate: string;
  expiresDate: string;
  downloadUrl: string;
  shareUrl: string;
}

interface TeamSettings {
  notifications: {
    email: boolean;
    slack: boolean;
    teams: boolean;
    digest: boolean;
    realTime: boolean;
  };
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  deviceSessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
  }>;
}

interface TeamDimension {
  name: string;
  currentScore: number;
  previousScore: number;
  change: number;
  trend: 'improving' | 'stable' | 'declining';
}

const AdminDashboard = ({ currentSection = 'overview' }: AdminDashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalTeams: 8,
    activeSurveys: 3,
    totalResponses: 245,
    avgParticipation: 78,
    alertsCount: 2,
    avgScore: 7.2,
    scoreChange: 0.3
  });

  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamAlerts, setTeamAlerts] = useState<TeamAlert[]>([]);
  const [teamFeedback, setTeamFeedback] = useState<TeamFeedback[]>([]);
  const [teamSurveys, setTeamSurveys] = useState<TeamSurvey[]>([]);
  const [teamReports, setTeamReports] = useState<TeamReport[]>([]);
  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    notifications: {
      email: true,
      slack: false,
      teams: true,
      digest: true,
      realTime: false
    },
    language: 'English',
    timezone: 'UTC-5',
    twoFactorEnabled: true,
    deviceSessions: [
      { id: '1', device: 'MacBook Pro', location: 'New York, NY', lastActive: '2024-01-20 10:30 AM' },
      { id: '2', device: 'iPhone 15', location: 'New York, NY', lastActive: '2024-01-20 09:15 AM' }
    ]
  });
  const [teamDimensions, setTeamDimensions] = useState<TeamDimension[]>([]);

  // Tab state - use currentSection prop or default to overview
  const [activeTab, setActiveTab] = useState(currentSection);

  // Update activeTab when currentSection prop changes
  useEffect(() => {
    setActiveTab(currentSection);
  }, [currentSection]);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        setLoading(true);
        
        // Mock data setup
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
          }
        ];
        setRecentActivity(mockRecentActivity);

        const mockTeamMembers: TeamMember[] = [
          { id: 1, name: "John Smith", role: "Senior Developer", status: "Active", lastSurvey: "2024-01-15", participation: 85 },
          { id: 2, name: "Sarah Johnson", role: "Product Manager", status: "Active", lastSurvey: "2024-01-15", participation: 90 },
          { id: 3, name: "Mike Davis", role: "Designer", status: "On Leave", lastSurvey: "2024-01-10", participation: 0 }
        ];
        setTeamMembers(mockTeamMembers);

        const mockTeamAlerts: TeamAlert[] = [
          { id: 1, type: 'score-drop', title: 'Team Score Decline', message: 'Sales team score dropped significantly', severity: 'critical', acknowledged: false, date: '2024-01-15' },
          { id: 2, type: 'participation', title: 'Low Participation', message: 'Marketing team participation below threshold', severity: 'medium', acknowledged: true, date: '2024-01-14' }
        ];
        setTeamAlerts(mockTeamAlerts);

        const mockTeamFeedback: TeamFeedback[] = [
          { id: 1, comment: "Great team collaboration and communication", sentiment: "positive", dimension: "Communication", surveyDate: "2024-01-15", responseCount: 8, team: "Engineering", needsHRFollowUp: false, hidden: false },
          { id: 2, comment: "Workload is manageable and well distributed", sentiment: "positive", dimension: "Workload", surveyDate: "2024-01-15", responseCount: 8, team: "Engineering", needsHRFollowUp: false, hidden: false }
        ];
        setTeamFeedback(mockTeamFeedback);

        const mockTeamSurveys: TeamSurvey[] = [
          { id: 1, name: 'Monthly Pulse Survey', status: 'Active', participation: 80, dueDate: '2024-02-15', isAutoPilot: true, team: 'Engineering' },
          { id: 2, name: 'Team Health Check', status: 'Completed', participation: 90, dueDate: '2024-01-15', isAutoPilot: false, team: 'Engineering' }
        ];
        setTeamSurveys(mockTeamSurveys);

        const mockTeamReports: TeamReport[] = [
          { id: 1, name: 'Q1 2024 Team Report', type: 'last-quarter', generatedDate: '2024-01-15', expiresDate: '2024-02-15', downloadUrl: '#', shareUrl: '#' },
          { id: 2, name: 'Current Cycle Report', type: 'current-cycle', generatedDate: '2024-01-20', expiresDate: '2024-01-27', downloadUrl: '#', shareUrl: '#' }
        ];
        setTeamReports(mockTeamReports);

        const mockTeamDimensions: TeamDimension[] = [
          { name: 'Recognition', currentScore: 7.8, previousScore: 7.5, change: 0.3, trend: 'improving' },
          { name: 'Workload', currentScore: 6.9, previousScore: 7.2, change: -0.3, trend: 'declining' },
          { name: 'Leadership', currentScore: 8.1, previousScore: 7.9, change: 0.2, trend: 'improving' },
          { name: 'Communication', currentScore: 7.4, previousScore: 7.4, change: 0, trend: 'stable' }
        ];
        setTeamDimensions(mockTeamDimensions);
        
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
            Comprehensive team management with privacy controls and organizational oversight
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="team-trends" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Team Trends</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Employees</span>
            </TabsTrigger>
            <TabsTrigger value="surveys" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Surveys</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Team Health Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgScore}/10</div>
                  <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Participation</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgParticipation}%</div>
                  <p className="text-xs text-muted-foreground">+5% from last survey</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.alertsCount}</div>
                  <p className="text-xs text-muted-foreground">2 require attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSurveys}</div>
                  <p className="text-xs text-muted-foreground">Currently running</p>
                </CardContent>
              </Card>
            </div>

            {/* Team Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Overview</CardTitle>
                <CardDescription>Current status of all teams under management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{team.name}</h4>
                          <p className="text-sm text-gray-600">{team.responses} responses</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">{team.score}/10</div>
                          <div className={`text-sm ${team.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {team.change >= 0 ? '+' : ''}{team.change.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{team.participation}%</div>
                          <div className="text-xs text-gray-500">Participation</div>
                        </div>
                        <Badge 
                          variant={
                            team.status === 'improving' ? 'default' : 
                            team.status === 'stable' ? 'secondary' : 
                            team.status === 'declining' ? 'outline' : 'destructive'
                          }
                        >
                          {team.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates for your teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500">{activity.team} • {new Date(activity.timestamp).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={activity.priority === 'high' ? 'destructive' : activity.priority === 'medium' ? 'default' : 'secondary'}>
                        {activity.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Trends Tab */}
          <TabsContent value="team-trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Trends</CardTitle>
                <CardDescription>Performance trends over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Team trends chart would go here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Feedback</CardTitle>
                <CardDescription>Anonymous comments from team surveys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg">
                      <p className="mb-2">{feedback.comment}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{feedback.dimension}</span>
                        <span>{feedback.surveyDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Alerts</CardTitle>
                <CardDescription>Current alerts requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{alert.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Direct reports and team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">{member.participation}%</div>
                          <div className="text-xs text-gray-500">Participation</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Surveys</CardTitle>
                <CardDescription>Survey status and participation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamSurveys.map((survey) => (
                    <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{survey.name}</h4>
                          <p className="text-sm text-gray-600">{survey.team}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={survey.status === 'Active' ? 'default' : 'secondary'}>
                          {survey.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">{survey.participation}%</div>
                          <div className="text-xs text-gray-500">Participation</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Reports</CardTitle>
                <CardDescription>Available reports for your teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-gray-600">Generated: {report.generatedDate}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Settings</CardTitle>
                <CardDescription>Manage your notification preferences and account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Notifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Email notifications</span>
                        <Badge variant={teamSettings.notifications.email ? 'default' : 'secondary'}>
                          {teamSettings.notifications.email ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Slack notifications</span>
                        <Badge variant={teamSettings.notifications.slack ? 'default' : 'secondary'}>
                          {teamSettings.notifications.slack ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Account</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Language</span>
                        <span className="text-sm text-gray-600">{teamSettings.language}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Timezone</span>
                        <span className="text-sm text-gray-600">{teamSettings.timezone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Two-factor authentication</span>
                        <Badge variant={teamSettings.twoFactorEnabled ? 'default' : 'secondary'}>
                          {teamSettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard; 