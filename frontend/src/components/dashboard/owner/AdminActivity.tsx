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
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  Info,
  Settings,
  UserPlus,
  Target,
  Clock3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface AdminDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastLogin: string;
  teamsManaged: string[];
  reviewsThisMonth: number;
  alertsResponded: number;
  totalAlerts: number;
  status: 'active' | 'inactive' | 'overloaded' | 'new';
  avgResponseTime: number;
  lastReviewDate: string;
  location: string;
  department: string;
  startDate: string;
  description: string;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    team: string;
  }>;
  performanceMetrics: Array<{
    month: string;
    reviews: number;
    alertsHandled: number;
    responseTime: number;
    satisfaction: number;
  }>;
  managedTeams: Array<{
    id: string;
    name: string;
    size: number;
    status: string;
    lastReview: string;
  }>;
  upcomingReviews: Array<{
    id: string;
    team: string;
    scheduledDate: string;
    type: string;
  }>;
}

const AdminActivity = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [flaggedFeedback, setFlaggedFeedback] = useState<FlaggedFeedback[]>([]);
  const [openAlerts, setOpenAlerts] = useState<OpenAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminDetail | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAdminForAction, setSelectedAdminForAction] = useState<AdminActivity | null>(null);
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

  const getAdminDetails = async (adminId: string): Promise<AdminDetail> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock detailed admin data
    const mockAdminDetails: { [key: string]: AdminDetail } = {
      "1": {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.johnson@novora.com",
        phone: "+1 (555) 123-4567",
        lastLogin: "2024-01-15",
        teamsManaged: ["Sales", "Marketing"],
        reviewsThisMonth: 12,
        alertsResponded: 8,
        totalAlerts: 10,
        status: 'active',
        avgResponseTime: 2.5,
        lastReviewDate: "2024-01-14",
        location: "San Francisco, CA",
        department: "HR",
        startDate: "2023-03-15",
        description: "Experienced HR professional with expertise in employee engagement and team management.",
        recentActivity: [
          { id: "1", type: "Review", description: "Completed monthly review for Sales team", date: "2024-01-15", team: "Sales" },
          { id: "2", type: "Alert", description: "Responded to low participation alert", date: "2024-01-14", team: "Marketing" },
          { id: "3", type: "Meeting", description: "Scheduled team feedback session", date: "2024-01-13", team: "Sales" }
        ],
        performanceMetrics: [
          { month: "Jan 2024", reviews: 12, alertsHandled: 8, responseTime: 2.5, satisfaction: 8.5 },
          { month: "Dec 2023", reviews: 15, alertsHandled: 12, responseTime: 2.1, satisfaction: 8.8 },
          { month: "Nov 2023", reviews: 14, alertsHandled: 10, responseTime: 2.3, satisfaction: 8.6 }
        ],
        managedTeams: [
          { id: "1", name: "Sales", size: 45, status: "Active", lastReview: "2024-01-15" },
          { id: "2", name: "Marketing", size: 28, status: "Active", lastReview: "2024-01-12" }
        ],
        upcomingReviews: [
          { id: "1", team: "Sales", scheduledDate: "2024-01-22", type: "Monthly Review" },
          { id: "2", team: "Marketing", scheduledDate: "2024-01-25", type: "Quarterly Review" }
        ]
      },
      "2": {
        id: "2",
        name: "Mike Chen",
        email: "mike.chen@novora.com",
        phone: "+1 (555) 234-5678",
        lastLogin: "2024-01-15",
        teamsManaged: ["Engineering", "Product"],
        reviewsThisMonth: 18,
        alertsResponded: 15,
        totalAlerts: 18,
        status: 'active',
        avgResponseTime: 1.8,
        lastReviewDate: "2024-01-15",
        location: "Remote",
        department: "HR",
        startDate: "2023-06-10",
        description: "Technical HR specialist with strong background in engineering team management.",
        recentActivity: [
          { id: "1", type: "Review", description: "Completed quarterly review for Engineering", date: "2024-01-15", team: "Engineering" },
          { id: "2", type: "Alert", description: "Resolved high-priority alert", date: "2024-01-14", team: "Product" },
          { id: "3", type: "Training", description: "Conducted team training session", date: "2024-01-13", team: "Engineering" }
        ],
        performanceMetrics: [
          { month: "Jan 2024", reviews: 18, alertsHandled: 15, responseTime: 1.8, satisfaction: 9.2 },
          { month: "Dec 2023", reviews: 20, alertsHandled: 18, responseTime: 1.5, satisfaction: 9.4 },
          { month: "Nov 2023", reviews: 17, alertsHandled: 14, responseTime: 1.9, satisfaction: 9.1 }
        ],
        managedTeams: [
          { id: "1", name: "Engineering", size: 120, status: "Active", lastReview: "2024-01-15" },
          { id: "2", name: "Product", size: 25, status: "Active", lastReview: "2024-01-10" }
        ],
        upcomingReviews: [
          { id: "1", team: "Engineering", scheduledDate: "2024-01-20", type: "Weekly Check-in" },
          { id: "2", team: "Product", scheduledDate: "2024-01-23", type: "Monthly Review" }
        ]
      }
    };
    
    return mockAdminDetails[adminId] || mockAdminDetails["1"];
  };

  const handleViewDetails = async (adminId: string) => {
    try {
      const adminDetails = await getAdminDetails(adminId);
      setSelectedAdmin(adminDetails);
      setShowAdminModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin details",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = (admin: AdminActivity) => {
    setSelectedAdminForAction(admin);
    setShowMessageModal(true);
    toast({
      title: "Send Message",
      description: `Opening message interface for ${admin.name}`,
    });
  };

  const handleScheduleReview = (admin: AdminActivity) => {
    setSelectedAdminForAction(admin);
    setShowScheduleModal(true);
    toast({
      title: "Schedule Review",
      description: `Opening calendar to schedule review with ${admin.name}`,
    });
  };

  const handleAssignAlert = (alertId: string) => {
    setShowAssignModal(true);
    toast({
      title: "Assign Alert",
      description: "Opening admin assignment interface",
    });
  };

  const handleContactAdmin = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleScheduleMeeting = (adminId: string) => {
    const admin = adminActivities.find(a => a.id === adminId);
    toast({
      title: "Schedule Meeting",
      description: `Opening calendar to schedule meeting with ${admin?.name || 'the'} admin`,
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
                            <DropdownMenuItem 
                              onClick={() => handleViewDetails(admin.id)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSendMessage(admin)}
                              className="cursor-pointer"
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>Send Message</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleScheduleReview(admin)}
                              className="cursor-pointer"
                            >
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-red-50 hover:border-red-200"
                        onClick={() => handleAssignAlert(alert.id)}
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Detail Modal */}
        <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            {selectedAdmin && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    <span>{selectedAdmin.name} - Admin Details</span>
                  </DialogTitle>
                  <DialogDescription>
                    Comprehensive overview of admin performance, activity, and managed teams
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Admin Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Reviews This Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{selectedAdmin.reviewsThisMonth}</div>
                        <div className="text-sm text-gray-500 mt-1">completed reviews</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Alerts Handled</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{selectedAdmin.alertsResponded}/{selectedAdmin.totalAlerts}</div>
                        <div className="text-sm text-gray-500 mt-1">response rate</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{selectedAdmin.avgResponseTime}h</div>
                        <div className="text-sm text-gray-500 mt-1">to alerts</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Teams Managed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{selectedAdmin.teamsManaged.length}</div>
                        <div className="text-sm text-gray-500 mt-1">active teams</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Admin Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Info className="w-5 h-5" />
                        <span>Admin Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-blue-600">
                              {selectedAdmin.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{selectedAdmin.name}</div>
                            <div className="text-sm text-gray-500">{selectedAdmin.email}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                              <Phone className="w-3 h-3" />
                              <span>{selectedAdmin.phone}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{selectedAdmin.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleContactAdmin(selectedAdmin.email)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleScheduleMeeting(selectedAdmin.id)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Meeting
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-4">{selectedAdmin.description}</p>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Recent Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedAdmin.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Activity className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{activity.type}</div>
                                <div className="text-sm text-gray-600">{activity.description}</div>
                                <div className="text-sm text-gray-500">{activity.team}</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">{activity.date}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Managed Teams */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Managed Teams</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedAdmin.managedTeams.map((team) => (
                          <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-green-600">
                                  {team.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{team.name}</div>
                                <div className="text-sm text-gray-500">{team.size} members</div>
                                <div className="text-sm text-gray-500">Status: {team.status}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Last Review</div>
                              <div className="text-sm font-medium text-gray-900">{team.lastReview}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upcoming Reviews */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Upcoming Reviews</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedAdmin.upcomingReviews.map((review) => (
                          <div key={review.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{review.team}</div>
                                <div className="text-sm text-gray-600">{review.type}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Scheduled</div>
                              <div className="text-sm font-medium text-gray-900">{review.scheduledDate}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Message Modal */}
        <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <span>Send Message to {selectedAdminForAction?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Send a direct message to the admin
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <Input placeholder="Enter message subject..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea 
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your message..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                  Cancel
                </Button>
                <Button>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Review Modal */}
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                <span>Schedule Review with {selectedAdminForAction?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Schedule a review meeting with the admin
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Review Type</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Performance Review</option>
                  <option>Team Management Review</option>
                  <option>Training Session</option>
                  <option>General Check-in</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date & Time</label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>1.5 hours</option>
                  <option>2 hours</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea 
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes for the review..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Alert Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserPlus className="w-6 h-6 text-blue-600" />
                <span>Assign Alert to Admin</span>
              </DialogTitle>
              <DialogDescription>
                Assign this alert to an available admin
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Admin</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sarah Johnson (Sales, Marketing)</option>
                  <option>Mike Chen (Engineering, Product)</option>
                  <option>Lisa Rodriguez (HR, Finance)</option>
                  <option>David Kim (Operations, Customer Success)</option>
                  <option>Alex Thompson (Product, Design)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea 
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes for the assignment..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </Button>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Alert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminActivity; 