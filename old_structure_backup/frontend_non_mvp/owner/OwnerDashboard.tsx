import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Building,
  MessageSquare,
  RefreshCw,
  Download,
  Share2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Eye,
  Edit,
  Settings
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface KPIData {
  avgScore: number;
  teamsWithAlerts: number;
  totalTeams: number;
  participationRate: number;
  trendData: number[];
}

interface CultureReport {
  status: 'stable' | 'improving' | 'declining' | 'critical';
  percentageStable: number;
  alertDelta: number;
  suggestedActions: string[];
}

interface DepartmentSummary {
  id: string;
  name: string;
  score: number;
  change: number;
  alerts: number;
  participation: number;
}

interface DepartmentDetail {
  id: string;
  name: string;
  score: number;
  change: number;
  alertCount: number;
  participation: number;
  manager: string;
  managerEmail: string;
  teamSize: number;
  location: string;
  description: string;
  recentFeedback: string[];
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    lastSurvey: string;
  }>;
  surveyHistory: Array<{
    date: string;
    score: number;
    participation: number;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    date: string;
  }>;
}

const OwnerDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentDetail | null>(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [kpiData, setKpiData] = useState<KPIData>({
    avgScore: 7.2,
    teamsWithAlerts: 3,
    totalTeams: 12,
    participationRate: 78,
    trendData: [6.8, 7.0, 7.1, 7.2, 7.3, 7.2]
  });
  const [cultureReport, setCultureReport] = useState<CultureReport>({
    status: 'stable',
    percentageStable: 82,
    alertDelta: -2,
    suggestedActions: [
      "Schedule 1:1s with Sales team leads to address 0.7 point drop",
      "Review feedback from Engineering team's recent survey",
      "Plan team building activities for Marketing department"
    ]
  });
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);

  const fetchOwnerDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock department data
      const mockDepartments: DepartmentSummary[] = [
        {
          id: "1",
          name: "Sales",
          score: 6.4,
          change: -0.7,
          alerts: 1,
          participation: 78
        },
        {
          id: "2",
          name: "Engineering",
          score: 7.8,
          change: 0.3,
          alerts: 0,
          participation: 92
        },
        {
          id: "3",
          name: "Marketing",
          score: 7.1,
          change: -0.2,
          alerts: 1,
          participation: 85
        },
        {
          id: "4",
          name: "HR",
          score: 8.2,
          change: 0.5,
          alerts: 0,
          participation: 95
        },
        {
          id: "5",
          name: "Finance",
          score: 6.9,
          change: 0.1,
          alerts: 0,
          participation: 88
        },
        {
          id: "6",
          name: "Operations",
          score: 7.5,
          change: -0.1,
          alerts: 1,
          participation: 82
        }
      ];
      setDepartments(mockDepartments);
      
    } catch (error) {
      console.error('Error fetching owner dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentDetails = async (departmentId: string): Promise<DepartmentDetail> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
         // Mock detailed department data
     const mockDepartmentDetails: { [key: string]: DepartmentDetail } = {
       "1": {
         id: "1",
         name: "Sales",
         score: 6.4,
         change: -0.7,
         alertCount: 1,
         participation: 78,
         manager: "Sarah Johnson",
         managerEmail: "sarah.johnson@novora.com",
         teamSize: 24,
         location: "San Francisco, CA",
         description: "Our sales team drives revenue growth through strategic partnerships and customer acquisition.",
         recentFeedback: [
           "Workload has increased significantly this quarter",
           "Need better communication from leadership",
           "Great team collaboration and support"
         ],
         teamMembers: [
           { id: "1", name: "Sarah Johnson", role: "Sales Manager", email: "sarah.johnson@novora.com", lastSurvey: "2024-01-15" },
           { id: "2", name: "Mike Chen", role: "Senior Sales Rep", email: "mike.chen@novora.com", lastSurvey: "2024-01-14" },
           { id: "3", name: "Lisa Rodriguez", role: "Sales Rep", email: "lisa.rodriguez@novora.com", lastSurvey: "2024-01-13" }
         ],
         surveyHistory: [
           { date: "2024-01", score: 6.4, participation: 78 },
           { date: "2023-12", score: 7.1, participation: 85 },
           { date: "2023-11", score: 7.3, participation: 82 }
         ],
         alerts: [
           { id: "1", type: "Score Drop", message: "Team score dropped by 0.7 points", severity: "medium", date: "2024-01-15" }
         ]
       },
       "2": {
         id: "2",
         name: "Engineering",
         score: 7.8,
         change: 0.3,
         alertCount: 0,
         participation: 92,
         manager: "David Kim",
         managerEmail: "david.kim@novora.com",
         teamSize: 18,
         location: "Remote",
         description: "Our engineering team builds innovative solutions and maintains technical excellence.",
         recentFeedback: [
           "Excellent work-life balance",
           "Great technical challenges and growth opportunities",
           "Strong team culture and collaboration"
         ],
         teamMembers: [
           { id: "1", name: "David Kim", role: "Engineering Manager", email: "david.kim@novora.com", lastSurvey: "2024-01-15" },
           { id: "2", name: "Alex Thompson", role: "Senior Engineer", email: "alex.thompson@novora.com", lastSurvey: "2024-01-14" },
           { id: "3", name: "Emma Wilson", role: "Software Engineer", email: "emma.wilson@novora.com", lastSurvey: "2024-01-13" }
         ],
         surveyHistory: [
           { date: "2024-01", score: 7.8, participation: 92 },
           { date: "2023-12", score: 7.5, participation: 88 },
           { date: "2023-11", score: 7.2, participation: 85 }
         ],
         alerts: []
       },
       "3": {
         id: "3",
         name: "Marketing",
         score: 7.1,
         change: -0.2,
         alertCount: 1,
         participation: 85,
         manager: "Jennifer Lee",
         managerEmail: "jennifer.lee@novora.com",
         teamSize: 12,
         location: "New York, NY",
         description: "Our marketing team creates compelling campaigns and drives brand awareness.",
         recentFeedback: [
           "Creative projects are engaging and fulfilling",
           "Need more resources for campaign execution",
           "Good collaboration with other departments"
         ],
         teamMembers: [
           { id: "1", name: "Jennifer Lee", role: "Marketing Manager", email: "jennifer.lee@novora.com", lastSurvey: "2024-01-15" },
           { id: "2", name: "Chris Brown", role: "Senior Marketing Specialist", email: "chris.brown@novora.com", lastSurvey: "2024-01-14" },
           { id: "3", name: "Maria Garcia", role: "Marketing Coordinator", email: "maria.garcia@novora.com", lastSurvey: "2024-01-13" }
         ],
         surveyHistory: [
           { date: "2024-01", score: 7.1, participation: 85 },
           { date: "2023-12", score: 7.3, participation: 88 },
           { date: "2023-11", score: 7.0, participation: 82 }
         ],
         alerts: [
           { id: "1", type: "Low Participation", message: "Participation rate below 90%", severity: "low", date: "2024-01-14" }
         ]
       }
     };
    
    return mockDepartmentDetails[departmentId] || mockDepartmentDetails["1"];
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOwnerDashboardData();
    setRefreshing(false);
    toast({
      title: "Dashboard Refreshed",
      description: "Latest data has been loaded successfully",
    });
  };

  const handleExportReport = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: "Your dashboard report is ready for download",
      });
      
      // Simulate file download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,This is a mock PDF report';
      link.download = 'executive-dashboard-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShareDashboard = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockShareUrl = 'https://novora.com/share/executive-dashboard-2024';
      
      // Copy to clipboard
      await navigator.clipboard.writeText(mockShareUrl);
      
      toast({
        title: "Share Link Created",
        description: "Dashboard share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to create share link. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDepartmentClick = async (departmentId: string) => {
    try {
      const departmentDetails = await getDepartmentDetails(departmentId);
      setSelectedDepartment(departmentDetails);
      setShowDepartmentModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load department details",
        variant: "destructive"
      });
    }
  };

  const handleViewFullReport = () => {
    toast({
      title: "Full Report",
      description: "Opening detailed culture report...",
    });
    // In a real app, you would navigate to the full report page
    // navigate('/reports/culture');
  };

  const handleExportDepartmentReport = () => {
    toast({
      title: "Department Report",
      description: "Exporting department summary report...",
    });
    // In a real app, you would export the department data
  };

  const handleContactManager = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleViewTeamDetails = (departmentId: string) => {
    toast({
      title: "Team Details",
      description: `Opening detailed view for ${selectedDepartment?.name} team`,
    });
    // In a real app, you would navigate to team details page
    // navigate(`/teams/${departmentId}`);
  };

  const handleScheduleMeeting = (departmentId: string) => {
    toast({
      title: "Schedule Meeting",
      description: `Opening calendar to schedule meeting with ${selectedDepartment?.name} team`,
    });
    // In a real app, you would open calendar integration
  };

  const handleKPIClick = (kpiType: string) => {
    setSelectedKPI(kpiType);
    setShowKPIModal(true);
  };

  const getKPIDetails = (kpiType: string) => {
    switch (kpiType) {
      case 'average-score':
        return {
          title: 'Average Score Analysis',
          description: 'Comprehensive breakdown of organizational scoring trends and insights',
          data: {
            currentScore: 7.2,
            previousScore: 6.8,
            change: 0.4,
            trend: [6.8, 7.0, 7.1, 7.2, 7.3, 7.2],
            breakdown: [
              { category: 'Work-Life Balance', score: 7.5, change: 0.3 },
              { category: 'Career Growth', score: 6.8, change: 0.6 },
              { category: 'Team Collaboration', score: 7.9, change: 0.2 },
              { category: 'Leadership', score: 6.5, change: 0.8 },
              { category: 'Compensation', score: 7.1, change: 0.1 }
            ],
            insights: [
              'Leadership scores improved significantly (+0.8) this month',
              'Career growth opportunities are trending upward',
              'Team collaboration remains the highest scoring category'
            ]
          }
        };
      case 'teams-alerts':
        return {
          title: 'Teams with Alerts Overview',
          description: 'Detailed analysis of teams requiring attention and intervention',
          data: {
            totalTeams: 12,
            teamsWithAlerts: 3,
            alertTypes: [
              { type: 'Score Drop', count: 2, severity: 'medium' },
              { type: 'Low Participation', count: 1, severity: 'low' }
            ],
            teams: [
              { name: 'Sales', alerts: 1, type: 'Score Drop', score: 6.4 },
              { name: 'Marketing', alerts: 1, type: 'Low Participation', score: 7.1 },
              { name: 'Operations', alerts: 1, type: 'Score Drop', score: 7.5 }
            ],
            recommendations: [
              'Schedule 1:1 meetings with Sales team leads',
              'Review Marketing team survey participation strategies',
              'Investigate Operations team recent changes'
            ]
          }
        };
      case 'participation-rate':
        return {
          title: 'Participation Rate Analysis',
          description: 'Survey completion rates and engagement metrics across the organization',
          data: {
            currentRate: 78,
            previousRate: 73,
            change: 5,
            departmentBreakdown: [
              { name: 'Engineering', rate: 92, trend: 'up' },
              { name: 'HR', rate: 95, trend: 'up' },
              { name: 'Finance', rate: 88, trend: 'stable' },
              { name: 'Sales', rate: 78, trend: 'down' },
              { name: 'Marketing', rate: 85, trend: 'up' },
              { name: 'Operations', rate: 82, trend: 'stable' }
            ],
            factors: [
              'Improved survey timing and frequency',
              'Enhanced communication about survey importance',
              'Department-specific engagement campaigns'
            ],
            goals: [
              'Achieve 85% participation rate by Q2',
              'Implement automated reminders',
              'Create department-specific incentives'
            ]
          }
        };
      case 'trend':
        return {
          title: '6-Month Trend Analysis',
          description: 'Long-term organizational health trends and predictive insights',
          data: {
            months: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            scores: [6.8, 7.0, 7.1, 7.2, 7.3, 7.2],
            participation: [70, 72, 75, 78, 80, 78],
            keyEvents: [
              { month: 'Sep', event: 'New leadership initiatives launched', impact: 'positive' },
              { month: 'Nov', event: 'Quarterly review process improved', impact: 'positive' },
              { month: 'Jan', event: 'Team restructuring completed', impact: 'neutral' }
            ],
            predictions: [
              'Expected score improvement to 7.4 by March',
              'Participation rate projected to reach 82%',
              'Continued positive trend in leadership scores'
            ],
            recommendations: [
              'Maintain current engagement strategies',
              'Focus on sustaining positive momentum',
              'Monitor impact of recent organizational changes'
            ]
          }
        };
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchOwnerDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'text-green-600 bg-green-100';
      case 'improving': return 'text-blue-600 bg-blue-100';
      case 'declining': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable': return '🟢';
      case 'improving': return '🔵';
      case 'declining': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Executive Dashboard</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            At-a-glance pulse of the company with comprehensive organizational health metrics
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="flex items-center space-x-2 hover:bg-gray-50"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </Button>
          <Button 
            onClick={handleExportReport}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
          <Button 
            onClick={handleShareDashboard}
            variant="outline"
            className="flex items-center space-x-2 hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Dashboard</span>
          </Button>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Score */}
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-gray-50"
            onClick={() => handleKPIClick('average-score')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpiData.avgScore}/10</div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">+0.4 from last month</span>
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Click for detailed analysis
              </div>
            </CardContent>
          </Card>

          {/* Teams with Alerts */}
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-gray-50"
            onClick={() => handleKPIClick('teams-alerts')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Teams with Alerts</CardTitle>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpiData.teamsWithAlerts}</div>
              <div className="text-sm text-gray-500 mt-1">
                out of {kpiData.totalTeams} teams
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Click for detailed analysis
              </div>
            </CardContent>
          </Card>

          {/* Participation Rate */}
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-gray-50"
            onClick={() => handleKPIClick('participation-rate')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Participation Rate</CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpiData.participationRate}%</div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">+5% from last month</span>
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Click for detailed analysis
              </div>
            </CardContent>
          </Card>

          {/* Sparkline Trend */}
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-gray-50"
            onClick={() => handleKPIClick('trend')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">6-Month Trend</CardTitle>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">↗️</div>
              <div className="text-sm text-gray-500 mt-1">
                Steady improvement
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Click for detailed analysis
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Executive Culture Report */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Executive Culture Report</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Monthly culture health assessment and strategic insights
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewFullReport}>
                View Full Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Summary */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{getStatusIcon(cultureReport.status)}</span>
                </div>
                <div>
                  <div className="text-xl font-semibold text-gray-900">
                    {cultureReport.percentageStable}% teams stable
                  </div>
                  <div className="text-sm text-gray-600">
                    This month vs last month: {cultureReport.alertDelta > 0 ? '+' : ''}{cultureReport.alertDelta} alerts
                  </div>
                </div>
              </div>
              <Badge className={`${getStatusColor(cultureReport.status)} px-4 py-2 text-sm font-medium`}>
                {cultureReport.status.charAt(0).toUpperCase() + cultureReport.status.slice(1)}
              </Badge>
            </div>

            {/* Suggested Actions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Suggested Actions</span>
              </h4>
              <div className="space-y-3">
                {cultureReport.suggestedActions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-sm transition-all duration-200">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Department Summary Table */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Department Summary</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Click on any department to view detailed insights and analytics
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportDepartmentReport}>
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Department</TableHead>
                    <TableHead className="font-semibold text-gray-900">Score</TableHead>
                    <TableHead className="font-semibold text-gray-900">Change</TableHead>
                    <TableHead className="font-semibold text-gray-900">Alerts</TableHead>
                    <TableHead className="font-semibold text-gray-900">Participation</TableHead>
                    <TableHead className="font-semibold text-gray-900"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow 
                      key={dept.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                      onClick={() => handleDepartmentClick(dept.id)}
                    >
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {dept.name.charAt(0)}
                            </span>
                          </div>
                          <span>{dept.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-gray-900">{dept.score}/10</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getChangeIcon(dept.change)}
                          <span className={`font-medium ${getChangeColor(dept.change)}`}>
                            {dept.change > 0 ? '+' : ''}{dept.change}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dept.alerts > 0 ? (
                          <Badge variant="destructive" className="flex items-center space-x-1 px-3 py-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="font-medium">{dept.alerts}</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="px-3 py-1 font-medium">0</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold text-gray-900">{dept.participation}%</div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                              style={{ width: `${dept.participation}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Detail Modal */}
      <Dialog open={showDepartmentModal} onOpenChange={setShowDepartmentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building className="w-6 h-6 text-blue-600" />
              <span>{selectedDepartment?.name} Department Details</span>
            </DialogTitle>
            <DialogDescription>
              Comprehensive overview of team performance, feedback, and insights
            </DialogDescription>
          </DialogHeader>
          
          {selectedDepartment && (
            <div className="space-y-6">
              {/* Department Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Current Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{selectedDepartment.score}/10</div>
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      {getChangeIcon(selectedDepartment.change)}
                      <span className={getChangeColor(selectedDepartment.change)}>
                        {selectedDepartment.change > 0 ? '+' : ''}{selectedDepartment.change} from last month
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Team Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{selectedDepartment.teamSize}</div>
                    <div className="text-sm text-gray-500 mt-1">members</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Participation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{selectedDepartment.participation}%</div>
                    <div className="text-sm text-gray-500 mt-1">survey completion</div>
                  </CardContent>
                </Card>
              </div>

              {/* Manager Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Department Manager</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                          {selectedDepartment.manager.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedDepartment.manager}</div>
                        <div className="text-sm text-gray-500">{selectedDepartment.managerEmail}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{selectedDepartment.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContactManager(selectedDepartment.managerEmail)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleScheduleMeeting(selectedDepartment.id)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Recent Feedback</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDepartment.recentFeedback.map((feedback, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">"{feedback}"</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Team Members</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDepartment.teamMembers.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.role}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Last survey: {member.lastSurvey}
                        </div>
                      </div>
                    ))}
                    {selectedDepartment.teamMembers.length > 5 && (
                      <div className="text-center text-sm text-gray-500">
                        +{selectedDepartment.teamMembers.length - 5} more members
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Survey History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Survey History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDepartment.surveyHistory.map((survey, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{survey.date}</div>
                            <div className="text-sm text-gray-500">{survey.participation}% participation</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{survey.score}/10</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              {selectedDepartment.alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span>Active Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedDepartment.alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getSeverityColor(alert.severity)} px-2 py-1`}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <div>
                              <div className="font-medium text-gray-900">{alert.type}</div>
                              <div className="text-sm text-gray-600">{alert.message}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{alert.date}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => handleViewTeamDetails(selectedDepartment.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Team Details
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleScheduleMeeting(selectedDepartment.id)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button 
                  onClick={() => handleContactManager(selectedDepartment.managerEmail)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Manager
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KPI Detail Modal */}
      <Dialog open={showKPIModal} onOpenChange={setShowKPIModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedKPI && getKPIDetails(selectedKPI) && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {selectedKPI === 'average-score' && <BarChart3 className="w-6 h-6 text-purple-600" />}
                  {selectedKPI === 'teams-alerts' && <AlertTriangle className="w-6 h-6 text-orange-600" />}
                  {selectedKPI === 'participation-rate' && <Users className="w-6 h-6 text-green-600" />}
                  {selectedKPI === 'trend' && <Activity className="w-6 h-6 text-blue-600" />}
                  <span>{getKPIDetails(selectedKPI)?.title}</span>
                </DialogTitle>
                <DialogDescription>
                  {getKPIDetails(selectedKPI)?.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedKPI === 'average-score' && (
                  <>
                    {/* Score Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Current Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{getKPIDetails(selectedKPI)?.data.currentScore}/10</div>
                          <div className="text-sm text-gray-500 mt-1">This month</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Previous Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{getKPIDetails(selectedKPI)?.data.previousScore}/10</div>
                          <div className="text-sm text-gray-500 mt-1">Last month</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Change</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">+{getKPIDetails(selectedKPI)?.data.change}</div>
                          <div className="text-sm text-gray-500 mt-1">Improvement</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Category Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {getKPIDetails(selectedKPI)?.data.breakdown.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{category.category}</div>
                                <div className="text-sm text-gray-500">
                                  {category.change > 0 ? '+' : ''}{category.change} change
                                </div>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{category.score}/10</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Insights */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Key Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getKPIDetails(selectedKPI)?.data.insights.map((insight, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">{insight}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {selectedKPI === 'teams-alerts' && (
                  <>
                    {/* Alert Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Total Teams</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{getKPIDetails(selectedKPI)?.data.totalTeams}</div>
                          <div className="text-sm text-gray-500 mt-1">Organization-wide</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Teams with Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-600">{getKPIDetails(selectedKPI)?.data.teamsWithAlerts}</div>
                          <div className="text-sm text-gray-500 mt-1">Requiring attention</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Alert Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">
                            {Math.round((getKPIDetails(selectedKPI)?.data.teamsWithAlerts / getKPIDetails(selectedKPI)?.data.totalTeams) * 100)}%
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Of total teams</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Alert Types */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getKPIDetails(selectedKPI)?.data.alertTypes.map((alertType, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Badge className={`${getSeverityColor(alertType.severity)} px-2 py-1`}>
                                  {alertType.severity.toUpperCase()}
                                </Badge>
                                <span className="font-medium text-gray-900">{alertType.type}</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{alertType.count}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Teams with Alerts */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Teams Requiring Attention</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getKPIDetails(selectedKPI)?.data.teams.map((team, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div>
                                <div className="font-medium text-gray-900">{team.name}</div>
                                <div className="text-sm text-gray-600">{team.type}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">{team.score}/10</div>
                                <div className="text-sm text-gray-500">{team.alerts} alert{team.alerts !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recommended Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getKPIDetails(selectedKPI)?.data.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {selectedKPI === 'participation-rate' && (
                  <>
                    {/* Participation Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Current Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{getKPIDetails(selectedKPI)?.data.currentRate}%</div>
                          <div className="text-sm text-gray-500 mt-1">This month</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Previous Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{getKPIDetails(selectedKPI)?.data.previousRate}%</div>
                          <div className="text-sm text-gray-500 mt-1">Last month</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">+{getKPIDetails(selectedKPI)?.data.change}%</div>
                          <div className="text-sm text-gray-500 mt-1">Increase</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Department Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Department Participation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getKPIDetails(selectedKPI)?.data.departmentBreakdown.map((dept, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  dept.trend === 'up' ? 'bg-green-500' : 
                                  dept.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                                }`}></div>
                                <span className="font-medium text-gray-900">{dept.name}</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{dept.rate}%</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contributing Factors */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Contributing Factors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getKPIDetails(selectedKPI)?.data.factors.map((factor, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Goals */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Participation Goals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getKPIDetails(selectedKPI)?.data.goals.map((goal, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Target className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">{goal}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {selectedKPI === 'trend' && (
                  <>
                    {/* Trend Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Score Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">↗️ Steady Growth</div>
                          <div className="text-sm text-gray-500 mt-1">6-month period</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Participation Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">↗️ Improving</div>
                          <div className="text-sm text-gray-500 mt-1">6-month period</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Key Events Timeline */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Key Events Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {getKPIDetails(selectedKPI)?.data.keyEvents.map((event, index) => (
                            <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                event.impact === 'positive' ? 'bg-green-100' : 
                                event.impact === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                              }`}>
                                <span className={`text-sm font-semibold ${
                                  event.impact === 'positive' ? 'text-green-600' : 
                                  event.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {event.month}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{event.event}</div>
                                <div className={`text-sm ${
                                  event.impact === 'positive' ? 'text-green-600' : 
                                  event.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)} impact
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Predictions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Predictions & Forecasts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getKPIDetails(selectedKPI)?.data.predictions.map((prediction, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <TrendingUp className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">{prediction}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Strategic Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getKPIDetails(selectedKPI)?.data.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerDashboard; 