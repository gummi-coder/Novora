import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Users,
  TrendingUp,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Activity,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdoptionMetrics {
  activeTeams: number;
  totalTeams: number;
  participationRate: number;
  surveyDeliveryRate: number;
  avgTimeInUse: number;
}

interface TeamUsage {
  id: string;
  name: string;
  isActive: boolean;
  participationRate: number;
  timeInUse: number; // months
  lastActivity: string;
  hasAdmin: boolean;
  adminName?: string;
  surveyDeliveryRate: number;
  status: 'active' | 'inactive' | 'at-risk' | 'new';
}

interface TimeInUseData {
  month: string;
  activeTeams: number;
  totalTeams: number;
}

interface AdminCoverageData {
  name: string;
  value: number;
  color: string;
}

const AdoptionUsage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdoptionMetrics>({
    activeTeams: 8,
    totalTeams: 12,
    participationRate: 78,
    surveyDeliveryRate: 95,
    avgTimeInUse: 4.2
  });
  const [teamUsage, setTeamUsage] = useState<TeamUsage[]>([]);
  const [timeInUseData, setTimeInUseData] = useState<TimeInUseData[]>([]);
  const [adminCoverageData, setAdminCoverageData] = useState<AdminCoverageData[]>([]);

  useEffect(() => {
    const fetchAdoptionData = async () => {
      try {
        setLoading(true);
        
        // Mock team usage data
        const mockTeamUsage: TeamUsage[] = [
          {
            id: "1",
            name: "Sales",
            isActive: true,
            participationRate: 78,
            timeInUse: 6,
            lastActivity: "2024-01-15",
            hasAdmin: true,
            adminName: "Sarah Johnson",
            surveyDeliveryRate: 98,
            status: 'active'
          },
          {
            id: "2",
            name: "Engineering",
            isActive: true,
            participationRate: 92,
            timeInUse: 8,
            lastActivity: "2024-01-10",
            hasAdmin: true,
            adminName: "Mike Chen",
            surveyDeliveryRate: 100,
            status: 'active'
          },
          {
            id: "3",
            name: "Marketing",
            isActive: true,
            participationRate: 85,
            timeInUse: 4,
            lastActivity: "2024-01-12",
            hasAdmin: false,
            surveyDeliveryRate: 90,
            status: 'at-risk'
          },
          {
            id: "4",
            name: "HR",
            isActive: true,
            participationRate: 95,
            timeInUse: 10,
            lastActivity: "2024-01-08",
            hasAdmin: true,
            adminName: "Lisa Rodriguez",
            surveyDeliveryRate: 100,
            status: 'active'
          },
          {
            id: "5",
            name: "Finance",
            isActive: false,
            participationRate: 45,
            timeInUse: 2,
            lastActivity: "2023-12-20",
            hasAdmin: false,
            surveyDeliveryRate: 60,
            status: 'inactive'
          },
          {
            id: "6",
            name: "Operations",
            isActive: true,
            participationRate: 82,
            timeInUse: 5,
            lastActivity: "2024-01-11",
            hasAdmin: true,
            adminName: "David Kim",
            surveyDeliveryRate: 95,
            status: 'active'
          },
          {
            id: "7",
            name: "Customer Success",
            isActive: true,
            participationRate: 90,
            timeInUse: 3,
            lastActivity: "2024-01-09",
            hasAdmin: false,
            surveyDeliveryRate: 88,
            status: 'new'
          },
          {
            id: "8",
            name: "Product",
            isActive: true,
            participationRate: 87,
            timeInUse: 7,
            lastActivity: "2024-01-13",
            hasAdmin: true,
            adminName: "Alex Thompson",
            surveyDeliveryRate: 97,
            status: 'active'
          }
        ];
        setTeamUsage(mockTeamUsage);

        // Mock time in use data
        const mockTimeInUseData: TimeInUseData[] = [
          { month: 'Jul', activeTeams: 2, totalTeams: 12 },
          { month: 'Aug', activeTeams: 3, totalTeams: 12 },
          { month: 'Sep', activeTeams: 4, totalTeams: 12 },
          { month: 'Oct', activeTeams: 5, totalTeams: 12 },
          { month: 'Nov', activeTeams: 6, totalTeams: 12 },
          { month: 'Dec', activeTeams: 7, totalTeams: 12 },
          { month: 'Jan', activeTeams: 8, totalTeams: 12 }
        ];
        setTimeInUseData(mockTimeInUseData);

        // Mock admin coverage data
        const mockAdminCoverageData: AdminCoverageData[] = [
          { name: 'With Admin', value: 5, color: '#10b981' },
          { name: 'Without Admin', value: 3, color: '#ef4444' }
        ];
        setAdminCoverageData(mockAdminCoverageData);
        
      } catch (error) {
        console.error('Error fetching adoption data:', error);
        toast({
          title: "Error",
          description: "Failed to load adoption data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptionData();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100';
      case 'new': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'at-risk': return <AlertTriangle className="w-4 h-4" />;
      case 'new': return <Target className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Exporting adoption data...",
    });
  };

  const activeTeamsPercentage = Math.round((metrics.activeTeams / metrics.totalTeams) * 100);
  const teamsWithoutAdmin = teamUsage.filter(team => !team.hasAdmin).length;

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Adoption & Usage</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track rollout, engagement, and usage health across your organization
          </p>
        </div>

        {/* Enhanced Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Teams */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Teams</CardTitle>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.activeTeams}/{metrics.totalTeams}</div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <Progress value={activeTeamsPercentage} className="w-16" />
                <span className="text-gray-500">{activeTeamsPercentage}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Participation Rate */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Participation Rate</CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.participationRate}%</div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <Progress value={metrics.participationRate} className="w-16" />
                <span className="text-gray-500">Org-wide</span>
              </div>
            </CardContent>
          </Card>

          {/* Survey Delivery Rate */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Survey Delivery</CardTitle>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.surveyDeliveryRate}%</div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <Progress value={metrics.surveyDeliveryRate} className="w-16" />
                <span className="text-gray-500">Success rate</span>
              </div>
            </CardContent>
          </Card>

          {/* Average Time in Use */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Time in Use</CardTitle>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.avgTimeInUse} months</div>
              <div className="text-sm text-gray-500 mt-1">
                Across active teams
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Time in Use Graph */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>Time in Use Trend</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Active teams over time with adoption insights
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeInUseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis domain={[0, metrics.totalTeams]} stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Teams']}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="activeTeams" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Active Teams"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Admin Coverage Map */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <span>Admin Coverage</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Teams with/without HR/admin assigned
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={adminCoverageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {adminCoverageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                <div className="text-sm font-medium text-red-700">
                  {teamsWithoutAdmin} teams need admin assignment
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Team Usage Table */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Team Usage Details</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Last activity and admin coverage per team
                </CardDescription>
              </div>
              <Button onClick={handleExport} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Team</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Participation</TableHead>
                    <TableHead className="font-semibold text-gray-900">Time in Use</TableHead>
                    <TableHead className="font-semibold text-gray-900">Survey Delivery</TableHead>
                    <TableHead className="font-semibold text-gray-900">Admin</TableHead>
                    <TableHead className="font-semibold text-gray-900">Last Activity</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamUsage.map((team, index) => (
                    <TableRow 
                      key={team.id} 
                      className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {team.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">{team.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(team.status)} px-3 py-1 font-medium`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(team.status)}
                            <span>{team.status.charAt(0).toUpperCase() + team.status.slice(1)}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-gray-900">{team.participationRate}%</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300" 
                              style={{ width: `${team.participationRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-gray-900">{team.timeInUse} months</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-gray-900">{team.surveyDeliveryRate}%</div>
                      </TableCell>
                      <TableCell>
                        {team.hasAdmin ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="text-sm">
                              <div className="font-semibold text-gray-900">{team.adminName}</div>
                              <div className="text-gray-500">Assigned</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <UserX className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="text-sm text-red-600 font-semibold">Unassigned</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 font-medium">
                          {formatTimeAgo(team.lastActivity)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 hover:bg-gray-100">
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Teams Without Admin */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-600" />
                </div>
                <span>Teams Without Admin</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{teamsWithoutAdmin}</div>
              <p className="text-sm text-gray-600 mt-2">
                Need HR/admin assignment
              </p>
              <Button variant="outline" size="sm" className="mt-4 hover:bg-red-50 hover:border-red-200">
                Assign Admins
              </Button>
            </CardContent>
          </Card>

          {/* Inactive Teams */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-gray-600" />
                </div>
                <span>Inactive Teams</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">
                {teamUsage.filter(team => !team.isActive).length}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Not using platform
              </p>
              <Button variant="outline" size="sm" className="mt-4 hover:bg-gray-50">
                Re-engage
              </Button>
            </CardContent>
          </Card>

          {/* At-Risk Teams */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <span>At-Risk Teams</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {teamUsage.filter(team => team.status === 'at-risk').length}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Need attention
              </p>
              <Button variant="outline" size="sm" className="mt-4 hover:bg-yellow-50 hover:border-yellow-200">
                Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdoptionUsage; 