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
  Activity
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

  useEffect(() => {
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

  const handleViewDetail = (departmentId: string) => {
    onViewDetail?.(departmentId);
    toast({
      title: "View Detail",
      description: `Opening admin view for ${departments.find(d => d.id === departmentId)?.name}`,
    });
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
                      className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
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
                            <DropdownMenuItem onClick={() => handleViewDetail(dept.id)} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Detail</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Users className="mr-2 h-4 w-4" />
                              <span>Team Members</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
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
      </div>
    </div>
  );
};

export default Departments; 