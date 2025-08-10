import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Clock,
  AlertTriangle,
  MessageSquare,
  Activity,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Bell,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminActivity {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
  teamsManaged: string[];
  reviewsThisMonth: number;
  alertsResponded: number;
  totalAlerts: number;
  status: 'active' | 'inactive' | 'overloaded' | 'new';
  avgResponseTime: number; // hours
  lastReviewDate: string;
}

interface HeatmapData {
  week: string;
  sarah: number;
  mike: number;
  lisa: number;
  david: number;
  alex: number;
}

interface FlaggedFeedback {
  id: string;
  team: string;
  feedback: string;
  flaggedDate: string;
  severity: 'high' | 'medium' | 'low';
  assignedTo?: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

interface OpenAlert {
  id: string;
  team: string;
  alertType: string;
  description: string;
  createdDate: string;
  daysOpen: number;
  assignedTo?: string;
  priority: 'high' | 'medium' | 'low';
}

const AdminActivity = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [flaggedFeedback, setFlaggedFeedback] = useState<FlaggedFeedback[]>([]);
  const [openAlerts, setOpenAlerts] = useState<OpenAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchAdminActivityData = async () => {
      try {
        setLoading(true);
        
        // Mock admin activity data
        const mockAdminActivities: AdminActivity[] = [
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah.johnson@novora.com",
            lastLogin: "2024-01-15T10:30:00Z",
            teamsManaged: ["Sales", "Marketing"],
            reviewsThisMonth: 12,
            alertsResponded: 8,
            totalAlerts: 10,
            status: 'active',
            avgResponseTime: 4.2,
            lastReviewDate: "2024-01-14"
          },
          {
            id: "2",
            name: "Mike Chen",
            email: "mike.chen@novora.com",
            lastLogin: "2024-01-15T09:15:00Z",
            teamsManaged: ["Engineering"],
            reviewsThisMonth: 18,
            alertsResponded: 15,
            totalAlerts: 15,
            status: 'active',
            avgResponseTime: 2.1,
            lastReviewDate: "2024-01-15"
          },
          {
            id: "3",
            name: "Lisa Rodriguez",
            email: "lisa.rodriguez@novora.com",
            lastLogin: "2024-01-14T16:45:00Z",
            teamsManaged: ["HR", "Finance"],
            reviewsThisMonth: 8,
            alertsResponded: 5,
            totalAlerts: 8,
            status: 'overloaded',
            avgResponseTime: 8.5,
            lastReviewDate: "2024-01-12"
          },
          {
            id: "4",
            name: "David Kim",
            email: "david.kim@novora.com",
            lastLogin: "2024-01-13T14:20:00Z",
            teamsManaged: ["Operations"],
            reviewsThisMonth: 6,
            alertsResponded: 4,
            totalAlerts: 6,
            status: 'active',
            avgResponseTime: 6.3,
            lastReviewDate: "2024-01-13"
          },
          {
            id: "5",
            name: "Alex Thompson",
            email: "alex.thompson@novora.com",
            lastLogin: "2024-01-15T11:00:00Z",
            teamsManaged: ["Product"],
            reviewsThisMonth: 10,
            alertsResponded: 9,
            totalAlerts: 9,
            status: 'active',
            avgResponseTime: 3.8,
            lastReviewDate: "2024-01-15"
          }
        ];
        setAdminActivities(mockAdminActivities);

        // Mock heatmap data
        const mockHeatmapData: HeatmapData[] = [
          { week: 'Week 1', sarah: 5, mike: 8, lisa: 3, david: 4, alex: 6 },
          { week: 'Week 2', sarah: 7, mike: 6, lisa: 2, david: 5, alex: 7 },
          { week: 'Week 3', sarah: 4, mike: 9, lisa: 1, david: 3, alex: 5 },
          { week: 'Week 4', sarah: 6, mike: 7, lisa: 4, david: 6, alex: 8 }
        ];
        setHeatmapData(mockHeatmapData);

        // Mock flagged feedback
        const mockFlaggedFeedback: FlaggedFeedback[] = [
          {
            id: "1",
            team: "Sales",
            feedback: "Team morale has significantly declined due to recent policy changes",
            flaggedDate: "2024-01-14",
            severity: 'high',
            assignedTo: "Sarah Johnson",
            status: 'pending'
          },
          {
            id: "2",
            team: "Marketing",
            feedback: "Workload is becoming unmanageable, need additional resources",
            flaggedDate: "2024-01-13",
            severity: 'medium',
            assignedTo: "Sarah Johnson",
            status: 'reviewed'
          },
          {
            id: "3",
            team: "Finance",
            feedback: "Communication from leadership has been unclear",
            flaggedDate: "2024-01-12",
            severity: 'medium',
            status: 'pending'
          }
        ];
        setFlaggedFeedback(mockFlaggedFeedback);

        // Mock open alerts
        const mockOpenAlerts: OpenAlert[] = [
          {
            id: "1",
            team: "Sales",
            alertType: "Score Drop",
            description: "Team score dropped by 0.7 points this month",
            createdDate: "2024-01-10",
            daysOpen: 5,
            assignedTo: "Sarah Johnson",
            priority: 'high'
          },
          {
            id: "2",
            team: "Marketing",
            alertType: "Low Participation",
            description: "Participation rate below 70% for 2 consecutive surveys",
            createdDate: "2024-01-08",
            daysOpen: 7,
            priority: 'medium'
          },
          {
            id: "3",
            team: "Finance",
            alertType: "Negative Feedback",
            description: "Multiple negative comments about workload",
            createdDate: "2024-01-05",
            daysOpen: 10,
            priority: 'high'
          }
        ];
        setOpenAlerts(mockOpenAlerts);
        
      } catch (error) {
        console.error('Error fetching admin activity data:', error);
        toast({
          title: "Error",
          description: "Failed to load admin activity data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminActivityData();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'overloaded': return 'text-yellow-600 bg-yellow-100';
      case 'new': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'overloaded': return <AlertTriangle className="w-4 h-4" />;
      case 'new': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getResponseRate = (responded: number, total: number) => {
    return total > 0 ? Math.round((responded / total) * 100) : 0;
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Exporting admin activity report...",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refresh",
      description: "Refreshing admin activity data...",
    });
  };

  const filteredAdmins = adminActivities.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAdmins = adminActivities.length;
  const activeAdmins = adminActivities.filter(admin => admin.status === 'active').length;
  const overloadedAdmins = adminActivities.filter(admin => admin.status === 'overloaded').length;
  const avgResponseTime = adminActivities.reduce((sum, admin) => sum + admin.avgResponseTime, 0) / totalAdmins;

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Activity</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ensure Admins/HR are reviewing, responding, and engaging effectively
          </p>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Admins</CardTitle>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalAdmins}</div>
              <div className="text-sm text-gray-500 mt-1">
                Managing {adminActivities.reduce((sum, admin) => sum + admin.teamsManaged.length, 0)} teams
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Admins</CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeAdmins}</div>
              <div className="text-sm text-gray-500 mt-1">
                {Math.round((activeAdmins / totalAdmins) * 100)}% of total
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overloaded</CardTitle>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{overloadedAdmins}</div>
              <div className="text-sm text-gray-500 mt-1">
                Need support
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{avgResponseTime.toFixed(1)}h</div>
              <div className="text-sm text-gray-500 mt-1">
                Across all admins
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Search & Filters</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Find and filter admin activity by various criteria
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleRefresh} className="flex items-center space-x-2 hover:bg-gray-50">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
                <Button onClick={handleExport} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 hover:border-blue-300 transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={filterStatus === 'all' ? "default" : "outline"}
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'hover:bg-gray-50'}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? "default" : "outline"}
                  onClick={() => setFilterStatus('active')}
                  className={filterStatus === 'active' ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' : 'hover:bg-gray-50'}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'overloaded' ? "default" : "outline"}
                  onClick={() => setFilterStatus('overloaded')}
                  className={filterStatus === 'overloaded' ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'hover:bg-gray-50'}
                >
                  Overloaded
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Admin Activity Table */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Admin Activity Overview</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  {filteredAdmins.length} of {totalAdmins} admins
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Admin</TableHead>
                    <TableHead className="font-semibold text-gray-900">Last Login</TableHead>
                    <TableHead className="font-semibold text-gray-900">Teams Managed</TableHead>
                    <TableHead className="font-semibold text-gray-900">Reviews This Month</TableHead>
                    <TableHead className="font-semibold text-gray-900">Alerts Responded</TableHead>
                    <TableHead className="font-semibold text-gray-900">Response Rate</TableHead>
                    <TableHead className="font-semibold text-gray-900">Avg Response Time</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin, index) => (
                    <TableRow 
                      key={admin.id} 
                      className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {admin.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{formatTimeAgo(admin.lastLogin)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-700">
                          {admin.teamsManaged.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-gray-900">{admin.reviewsThisMonth}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-gray-900">
                          {admin.alertsResponded}/{admin.totalAlerts}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold text-gray-900">
                            {getResponseRate(admin.alertsResponded, admin.totalAlerts)}%
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300" 
                              style={{ width: `${getResponseRate(admin.alertsResponded, admin.totalAlerts)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-gray-900">{admin.avgResponseTime}h</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(admin.status)} px-3 py-1 font-medium`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(admin.status)}
                            <span>{admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>Send Message</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>Schedule Review</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Heatmap of Admin Activity */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Admin Activity Heatmap</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Weekly activity levels per admin with engagement insights
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="sarah" fill="#3b82f6" name="Sarah" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mike" fill="#10b981" name="Mike" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lisa" fill="#f59e0b" name="Lisa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="david" fill="#8b5cf6" name="David" radius={[4, 4, 0, 0]} />
                <Bar dataKey="alex" fill="#ef4444" name="Alex" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Flagged Feedback & Open Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Flagged Feedback */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <span>Flagged Feedback</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Not reviewed yet - requires attention
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 bg-gradient-to-r from-gray-50 to-orange-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${getSeverityColor(feedback.severity)} px-3 py-1 font-medium`}>
                            {feedback.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-semibold text-gray-900">{feedback.team}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{feedback.feedback}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Flagged: {new Date(feedback.flaggedDate).toLocaleDateString()}</span>
                          {feedback.assignedTo && (
                            <span>Assigned to: {feedback.assignedTo}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={feedback.status === 'pending' ? 'destructive' : 'secondary'} className="px-3 py-1 font-medium">
                        {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Open Alerts */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-red-600" />
                    </div>
                    <span>Open Alerts</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    No action taken yet - requires immediate attention
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 bg-gradient-to-r from-gray-50 to-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${getPriorityColor(alert.priority)} px-3 py-1 font-medium`}>
                            {alert.priority.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-semibold text-gray-900">{alert.team}</span>
                        </div>
                        <p className="text-sm font-semibold mb-1 text-gray-900">{alert.alertType}</p>
                        <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Open for {alert.daysOpen} days</span>
                          {alert.assignedTo && (
                            <span>Assigned to: {alert.assignedTo}</span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="hover:bg-red-50 hover:border-red-200">
                        Assign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminActivity; 