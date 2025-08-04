import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Activity
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

const OwnerDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchOwnerDashboardData = async () => {
      try {
        setLoading(true);
        
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

    fetchOwnerDashboardData();
  }, [toast]);

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

  const handleDepartmentClick = (departmentId: string) => {
    // Navigate to Departments page filtered on this team
    toast({
      title: "Navigation",
      description: `Navigating to Departments page filtered on ${departments.find(d => d.id === departmentId)?.name}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-600 mt-1">At-a-glance pulse of the company</p>
      </div>

      {/* Top: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgScore}/10</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+0.4 from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Teams with Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams with Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.teamsWithAlerts}</div>
            <div className="text-sm text-muted-foreground">
              out of {kpiData.totalTeams} teams
            </div>
          </CardContent>
        </Card>

        {/* Participation Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.participationRate}%</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+5% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Sparkline Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">6-Month Trend</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">↗️</div>
            <div className="text-sm text-muted-foreground">
              Steady improvement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle: Executive Culture Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Executive Culture Report</span>
          </CardTitle>
          <CardDescription>Monthly culture health assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Summary */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getStatusIcon(cultureReport.status)}</span>
              <div>
                <div className="text-lg font-semibold">
                  {cultureReport.percentageStable}% teams stable
                </div>
                <div className="text-sm text-gray-600">
                  This month vs last month: {cultureReport.alertDelta > 0 ? '+' : ''}{cultureReport.alertDelta} alerts
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(cultureReport.status)}>
              {cultureReport.status.charAt(0).toUpperCase() + cultureReport.status.slice(1)}
            </Badge>
          </div>

          {/* Suggested Actions */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Suggested Actions</h4>
            <div className="space-y-2">
              {cultureReport.suggestedActions.map((action, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom: Department Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Department Summary</span>
          </CardTitle>
          <CardDescription>Click on any department to view detailed insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Participation</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow 
                  key={dept.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleDepartmentClick(dept.id)}
                >
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.score}/10</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(dept.change)}
                      <span className={getChangeColor(dept.change)}>
                        {dept.change > 0 ? '+' : ''}{dept.change}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {dept.alerts > 0 ? (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{dept.alerts}</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary">0</Badge>
                    )}
                  </TableCell>
                  <TableCell>{dept.participation}%</TableCell>
                  <TableCell>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard; 