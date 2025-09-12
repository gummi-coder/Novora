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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
  Mail,
  Phone,
  Calendar,
  MapPin,
  BarChart3,
  MessageSquare,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Info,
  User,
  Download,
  Share2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: string;
  name: string;
  avgScore: number;
  change: number;
  alerts: number;
  participation: number;
  employeeCount: number;
  hasAdmin: boolean;
  adminName?: string;
  lastSurveyDate: string;
  status: 'stable' | 'improving' | 'declining' | 'critical';
}

interface DepartmentDetail {
  id: string;
  name: string;
  avgScore: number;
  change: number;
  alertCount: number;
  participation: number;
  employeeCount: number;
  hasAdmin: boolean;
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
  lastSurveyDate: string;
  status: 'stable' | 'improving' | 'declining' | 'critical';
  description: string;
  location: string;
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    lastSurvey: string;
    score: number;
    department: string;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    date: string;
    status: 'active' | 'resolved';
  }>;
  surveyHistory: Array<{
    date: string;
    score: number;
    participation: number;
    responseCount: number;
  }>;
  recentFeedback: Array<{
    id: string;
    employee: string;
    feedback: string;
    date: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
}

interface DepartmentsProps {
  onViewDetail?: (departmentId: string) => void;
}

const Departments = ({ onViewDetail }: DepartmentsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Department>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentDetail | null>(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [modalView, setModalView] = useState<'detail' | 'team' | 'alerts'>('detail');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDepartmentsData = async () => {
    try {
      setLoading(true);
      
      // Mock department data
      const mockDepartments: Department[] = [
        {
          id: "1",
          name: "Sales",
          avgScore: 6.4,
          change: -0.7,
          alerts: 2,
          participation: 78,
          employeeCount: 45,
          hasAdmin: true,
          adminName: "Sarah Johnson",
          lastSurveyDate: "2024-01-15",
          status: 'declining'
        },
        {
          id: "2",
          name: "Engineering",
          avgScore: 7.8,
          change: 0.3,
          alerts: 0,
          participation: 92,
          employeeCount: 120,
          hasAdmin: true,
          adminName: "Mike Chen",
          lastSurveyDate: "2024-01-10",
          status: 'improving'
        },
        {
          id: "3",
          name: "Marketing",
          avgScore: 7.1,
          change: -0.2,
          alerts: 1,
          participation: 85,
          employeeCount: 28,
          hasAdmin: false,
          lastSurveyDate: "2024-01-12",
          status: 'stable'
        },
        {
          id: "4",
          name: "HR",
          avgScore: 8.2,
          change: 0.5,
          alerts: 0,
          participation: 95,
          employeeCount: 15,
          hasAdmin: true,
          adminName: "Lisa Rodriguez",
          lastSurveyDate: "2024-01-08",
          status: 'improving'
        },
        {
          id: "5",
          name: "Finance",
          avgScore: 6.9,
          change: 0.1,
          alerts: 0,
          participation: 88,
          employeeCount: 22,
          hasAdmin: false,
          lastSurveyDate: "2024-01-14",
          status: 'stable'
        },
        {
          id: "6",
          name: "Operations",
          avgScore: 7.5,
          change: -0.1,
          alerts: 1,
          participation: 82,
          employeeCount: 35,
          hasAdmin: true,
          adminName: "David Kim",
          lastSurveyDate: "2024-01-11",
          status: 'stable'
        },
        {
          id: "7",
          name: "Customer Success",
          avgScore: 7.3,
          change: 0.4,
          alerts: 0,
          participation: 90,
          employeeCount: 18,
          hasAdmin: false,
          lastSurveyDate: "2024-01-09",
          status: 'improving'
        },
        {
          id: "8",
          name: "Product",
          avgScore: 7.6,
          change: 0.2,
          alerts: 0,
          participation: 87,
          employeeCount: 25,
          hasAdmin: true,
          adminName: "Alex Thompson",
          lastSurveyDate: "2024-01-13",
          status: 'improving'
        }
      ];
      setDepartments(mockDepartments);
      setFilteredDepartments(mockDepartments);
      
    } catch (error) {
      console.error('Error fetching departments data:', error);
      toast({
        title: "Error",
        description: "Failed to load departments data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
  }, [toast]);

  // Filter and sort departments
  useEffect(() => {
    let filtered = departments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(dept => 
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.adminName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply unassigned filter
    if (showOnlyUnassigned) {
      filtered = filtered.filter(dept => !dept.hasAdmin);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredDepartments(filtered);
  }, [departments, searchTerm, showOnlyUnassigned, sortField, sortDirection]);

  const handleSort = (field: keyof Department) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Department) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'improving': return 'text-green-600 bg-green-100';
      case 'stable': return 'text-blue-600 bg-blue-100';
      case 'declining': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
        avgScore: 6.4,
        change: -0.7,
        alertCount: 2,
        participation: 78,
        employeeCount: 45,
        hasAdmin: true,
        adminName: "Sarah Johnson",
        adminEmail: "sarah.johnson@novora.com",
        adminPhone: "+1 (555) 123-4567",
        lastSurveyDate: "2024-01-15",
        status: 'declining',
        description: "Our sales team drives revenue growth through strategic partnerships and customer acquisition.",
        location: "San Francisco, CA",
        teamMembers: [
          { id: "1", name: "Sarah Johnson", role: "Sales Manager", email: "sarah.johnson@novora.com", lastSurvey: "2024-01-15", score: 6.5, department: "Sales" },
          { id: "2", name: "Mike Chen", role: "Senior Sales Rep", email: "mike.chen@novora.com", lastSurvey: "2024-01-14", score: 6.2, department: "Sales" },
          { id: "3", name: "Lisa Rodriguez", role: "Sales Rep", email: "lisa.rodriguez@novora.com", lastSurvey: "2024-01-13", score: 6.8, department: "Sales" },
          { id: "4", name: "David Kim", role: "Sales Rep", email: "david.kim@novora.com", lastSurvey: "2024-01-12", score: 6.1, department: "Sales" },
          { id: "5", name: "Emma Wilson", role: "Sales Rep", email: "emma.wilson@novora.com", lastSurvey: "2024-01-11", score: 6.9, department: "Sales" }
        ],
        alerts: [
          { id: "1", type: "Score Drop", message: "Team score dropped by 0.7 points", severity: "medium", date: "2024-01-15", status: "active" },
          { id: "2", type: "Low Participation", message: "Participation rate below 80%", severity: "low", date: "2024-01-14", status: "active" }
        ],
        surveyHistory: [
          { date: "2024-01", score: 6.4, participation: 78, responseCount: 35 },
          { date: "2023-12", score: 7.1, participation: 85, responseCount: 38 },
          { date: "2023-11", score: 7.3, participation: 82, responseCount: 37 }
        ],
        recentFeedback: [
          { id: "1", employee: "Mike Chen", feedback: "Need more training on new sales tools", date: "2024-01-14", sentiment: "neutral" },
          { id: "2", employee: "Lisa Rodriguez", feedback: "Great team collaboration this month", date: "2024-01-13", sentiment: "positive" },
          { id: "3", employee: "David Kim", feedback: "Workload is becoming overwhelming", date: "2024-01-12", sentiment: "negative" }
        ]
      },
      "2": {
        id: "2",
        name: "Engineering",
        avgScore: 7.8,
        change: 0.3,
        alertCount: 0,
        participation: 92,
        employeeCount: 120,
        hasAdmin: true,
        adminName: "Mike Chen",
        adminEmail: "mike.chen@novora.com",
        adminPhone: "+1 (555) 234-5678",
        lastSurveyDate: "2024-01-10",
        status: 'improving',
        description: "Our engineering team builds innovative solutions and maintains technical excellence.",
        location: "Remote",
        teamMembers: [
          { id: "1", name: "Mike Chen", role: "Engineering Manager", email: "mike.chen@novora.com", lastSurvey: "2024-01-10", score: 7.9, department: "Engineering" },
          { id: "2", name: "Alex Thompson", role: "Senior Engineer", email: "alex.thompson@novora.com", lastSurvey: "2024-01-09", score: 7.7, department: "Engineering" },
          { id: "3", name: "Emma Wilson", role: "Software Engineer", email: "emma.wilson@novora.com", lastSurvey: "2024-01-08", score: 7.8, department: "Engineering" },
          { id: "4", name: "John Smith", role: "DevOps Engineer", email: "john.smith@novora.com", lastSurvey: "2024-01-07", score: 8.1, department: "Engineering" },
          { id: "5", name: "Sarah Davis", role: "QA Engineer", email: "sarah.davis@novora.com", lastSurvey: "2024-01-06", score: 7.6, department: "Engineering" }
        ],
        alerts: [],
        surveyHistory: [
          { date: "2024-01", score: 7.8, participation: 92, responseCount: 110 },
          { date: "2023-12", score: 7.5, participation: 88, responseCount: 106 },
          { date: "2023-11", score: 7.2, participation: 85, responseCount: 102 }
        ],
        recentFeedback: [
          { id: "1", employee: "Alex Thompson", feedback: "Excellent work-life balance and flexible hours", date: "2024-01-09", sentiment: "positive" },
          { id: "2", employee: "Emma Wilson", feedback: "Great mentorship opportunities", date: "2024-01-08", sentiment: "positive" },
          { id: "3", employee: "John Smith", feedback: "Need more resources for infrastructure projects", date: "2024-01-07", sentiment: "neutral" }
        ]
      }
    };
    
    return mockDepartmentDetails[departmentId] || mockDepartmentDetails["1"];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDepartmentClick = async (departmentId: string) => {
    try {
      const departmentDetails = await getDepartmentDetails(departmentId);
      setSelectedDepartment(departmentDetails);
      setModalView('detail');
      setShowDepartmentModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load department details",
        variant: "destructive"
      });
    }
  };

  const handleViewDetail = async (departmentId: string) => {
    try {
      const departmentDetails = await getDepartmentDetails(departmentId);
      setSelectedDepartment(departmentDetails);
      setModalView('detail');
      setShowDepartmentModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load department details",
        variant: "destructive"
      });
    }
  };

  const handleViewTeamMembers = async (departmentId: string) => {
    try {
      const departmentDetails = await getDepartmentDetails(departmentId);
      setSelectedDepartment(departmentDetails);
      setModalView('team');
      setShowDepartmentModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    }
  };

  const handleViewAlerts = async (departmentId: string) => {
    try {
      const departmentDetails = await getDepartmentDetails(departmentId);
      setSelectedDepartment(departmentDetails);
      setModalView('alerts');
      setShowDepartmentModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive"
      });
    }
  };

  const handleContactAdmin = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleScheduleMeeting = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    toast({
      title: "Schedule Meeting",
      description: `Opening calendar to schedule meeting with ${department?.name || 'the'} team`,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDepartmentsData();
      toast({
        title: "Success",
        description: "Department data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      // Simulate file download
      const dataStr = JSON.stringify(departments, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'departments-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Department data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/departments`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Department page link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const unassignedCount = departments.filter(dept => !dept.hasAdmin).length;

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Departments</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compare departments and drill into issues with comprehensive analytics
          </p>
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
                  Find and filter departments by various criteria
                </CardDescription>
              </div>
              {unassignedCount > 0 && (
                <Badge variant="destructive" className="flex items-center space-x-1 px-3 py-1">
                  <UserX className="w-3 h-3" />
                  <span className="font-medium">{unassignedCount} unassigned</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search departments or admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 hover:border-blue-300 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Show Only Unassigned Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={showOnlyUnassigned ? "default" : "outline"}
                  onClick={() => setShowOnlyUnassigned(!showOnlyUnassigned)}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    showOnlyUnassigned 
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <UserX className="w-4 h-4" />
                  <span>Unassigned Only</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Departments Table */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Department Performance</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  {filteredDepartments.length} of {departments.length} departments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 p-0 h-auto font-semibold hover:bg-gray-100"
                      >
                        <span>Department</span>
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('avgScore')}
                        className="flex items-center space-x-1 p-0 h-auto font-semibold hover:bg-gray-100"
                      >
                        <span>Avg Score</span>
                        {getSortIcon('avgScore')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('change')}
                        className="flex items-center space-x-1 p-0 h-auto font-semibold hover:bg-gray-100"
                      >
                        <span>Change</span>
                        {getSortIcon('change')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('alerts')}
                        className="flex items-center space-x-1 p-0 h-auto font-semibold hover:bg-gray-100"
                      >
                        <span>Alerts</span>
                        {getSortIcon('alerts')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('participation')}
                        className="flex items-center space-x-1 p-0 h-auto font-semibold hover:bg-gray-100"
                      >
                        <span>Participation</span>
                        {getSortIcon('participation')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('employeeCount')}
                        className="flex items-center space-x-1 p-0 h-auto font-semibold hover:bg-gray-100"
                      >
                        <span>Employees</span>
                        {getSortIcon('employeeCount')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Admin</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((dept, index) => (
                    <TableRow 
                      key={dept.id} 
                      className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 cursor-pointer ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => handleDepartmentClick(dept.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {dept.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{dept.name}</div>
                            <div className="text-sm text-gray-500">
                              Last survey: {new Date(dept.lastSurveyDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-gray-900">{dept.avgScore}/10</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getChangeIcon(dept.change)}
                          <span className={`font-semibold ${getChangeColor(dept.change)}`}>
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
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-gray-900">{dept.participation}%</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300" 
                              style={{ width: `${dept.participation}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-gray-900">{dept.employeeCount}</div>
                      </TableCell>
                      <TableCell>
                        {dept.hasAdmin ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="text-sm">
                              <div className="font-semibold text-gray-900">{dept.adminName}</div>
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
                        <Badge className={`${getStatusColor(dept.status)} px-3 py-1 font-medium`}>
                          {dept.status.charAt(0).toUpperCase() + dept.status.slice(1)}
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
                              onClick={(e) => { e.stopPropagation(); handleViewDetail(dept.id); }} 
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Detail</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleViewTeamMembers(dept.id); }}
                              className="cursor-pointer"
                            >
                              <Users className="mr-2 h-4 w-4" />
                              <span>Team Members</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleViewAlerts(dept.id); }}
                              className="cursor-pointer"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              <span>View Alerts</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredDepartments.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No departments found matching your criteria</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Detail Modal */}
        <Dialog open={showDepartmentModal} onOpenChange={setShowDepartmentModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            {selectedDepartment && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Building className="w-6 h-6 text-blue-600" />
                    <span>
                      {modalView === 'detail' && `${selectedDepartment.name} Department Details`}
                      {modalView === 'team' && `${selectedDepartment.name} Team Members`}
                      {modalView === 'alerts' && `${selectedDepartment.name} Alerts`}
                    </span>
                  </DialogTitle>
                  <DialogDescription>
                    {modalView === 'detail' && 'Comprehensive overview of department performance and insights'}
                    {modalView === 'team' && 'Detailed view of team members and their survey participation'}
                    {modalView === 'alerts' && 'Active alerts and issues requiring attention'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {modalView === 'detail' && (
                    <>
                      {/* Department Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Current Score</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{selectedDepartment.avgScore}/10</div>
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
                            <div className="text-2xl font-bold text-gray-900">{selectedDepartment.employeeCount}</div>
                            <div className="text-sm text-gray-500 mt-1">employees</div>
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
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{selectedDepartment.alertCount}</div>
                            <div className="text-sm text-gray-500 mt-1">requiring attention</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Department Description */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Info className="w-5 h-5" />
                            <span>Department Overview</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4">{selectedDepartment.description}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{selectedDepartment.location}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Admin Information */}
                      {selectedDepartment.hasAdmin && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <UserCheck className="w-5 h-5" />
                              <span>Department Admin</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-semibold text-blue-600">
                                    {selectedDepartment.adminName?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{selectedDepartment.adminName}</div>
                                  <div className="text-sm text-gray-500">{selectedDepartment.adminEmail}</div>
                                  <div className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{selectedDepartment.adminPhone}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleContactAdmin(selectedDepartment.adminEmail!)}
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
                      )}

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
                            {selectedDepartment.recentFeedback.map((feedback) => (
                              <div key={feedback.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  feedback.sentiment === 'positive' ? 'bg-green-100' : 
                                  feedback.sentiment === 'negative' ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                  <MessageSquare className={`w-4 h-4 ${
                                    feedback.sentiment === 'positive' ? 'text-green-600' : 
                                    feedback.sentiment === 'negative' ? 'text-red-600' : 'text-blue-600'
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium text-gray-900">{feedback.employee}</div>
                                    <div className="text-sm text-gray-500">{feedback.date}</div>
                                  </div>
                                  <p className="text-gray-700 mt-1">{feedback.feedback}</p>
                                </div>
                              </div>
                            ))}
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
                                    <div className="text-sm text-gray-500">{survey.responseCount} responses</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">{survey.score}/10</div>
                                  <div className="text-sm text-gray-500">{survey.participation}% participation</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {modalView === 'team' && (
                    <>
                      {/* Team Members Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{selectedDepartment.employeeCount}</div>
                            <div className="text-sm text-gray-500 mt-1">team members</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Survey Participation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{selectedDepartment.participation}%</div>
                            <div className="text-sm text-gray-500 mt-1">completion rate</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{selectedDepartment.avgScore}/10</div>
                            <div className="text-sm text-gray-500 mt-1">team average</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Team Members List */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>Team Members</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedDepartment.teamMembers.map((member) => (
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
                                    <div className="text-sm text-gray-500">{member.email}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">{member.score}/10</div>
                                  <div className="text-sm text-gray-500">Last: {member.lastSurvey}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {modalView === 'alerts' && (
                    <>
                      {/* Alerts Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Alerts</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{selectedDepartment.alertCount}</div>
                            <div className="text-sm text-gray-500 mt-1">active alerts</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">High Priority</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                              {selectedDepartment.alerts.filter(alert => alert.severity === 'high').length}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">urgent issues</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              {selectedDepartment.alerts.filter(alert => alert.status === 'resolved').length}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">completed actions</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Alerts List */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span>Active Alerts</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedDepartment.alerts.length > 0 ? (
                              selectedDepartment.alerts.map((alert) => (
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
                                  <div className="text-right">
                                    <div className="text-sm text-gray-500">{alert.date}</div>
                                    <div className="flex items-center space-x-1 mt-1">
                                      {alert.status === 'active' ? (
                                        <Clock className="w-3 h-3 text-orange-600" />
                                      ) : (
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                      )}
                                      <span className={`text-xs ${
                                        alert.status === 'active' ? 'text-orange-600' : 'text-green-600'
                                      }`}>
                                        {alert.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-gray-500 font-medium">No active alerts</p>
                                <p className="text-gray-400 text-sm mt-1">All issues have been resolved</p>
                              </div>
                            )}
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
    </div>
  );
};

export default Departments; 