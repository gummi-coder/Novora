import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  FileText,
  Users,
  Activity,
  Plus,
  LogOut,
  Settings,
  Calendar,
  Bell,
  TrendingUp,
  Clock,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import OwnerTopNavbar from "@/components/layout/OwnerTopNavbar";
import PulseOverview from "@/components/dashboard/PulseOverview";
import TeamBreakdown from "@/components/dashboard/TeamBreakdown";
import AnonymousCommentsViewer from "@/components/dashboard/AnonymousCommentsViewer";
import QuickActionsPanel from "@/components/dashboard/QuickActionsPanel";
import AnonymousSuggestionBox from "@/components/dashboard/AnonymousSuggestionBox";
import GoalTrackingDashboard from "@/components/dashboard/GoalTrackingDashboard";
import PredictiveTrendForecasting from "@/components/dashboard/PredictiveTrendForecasting";
import AdvancedCapabilities from "@/components/dashboard/AdvancedCapabilities";
import {
  TeamUsageSnapshot,
  SurveyActivityLog,
  PlanBillingOverview,
  SupportRiskFlags
} from "@/components/dashboard/owner";
import OwnerDashboard from "@/components/dashboard/owner/OwnerDashboard";
import CultureTrends from "@/components/dashboard/owner/CultureTrends";
import Departments from "@/components/dashboard/owner/Departments";
import AdoptionUsage from "@/components/dashboard/owner/AdoptionUsage";
import AdminActivity from "@/components/dashboard/owner/AdminActivity";
import Reports from "@/components/dashboard/owner/Reports";
import OwnerSettings from "@/components/dashboard/owner/Settings";
import AdminTopNavbar from "@/components/layout/AdminTopNavbar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";
import TeamTrends from "@/components/dashboard/admin/TeamTrends";
import AdminFeedback from "@/components/dashboard/admin/Feedback";
import AdminAlerts from "@/components/dashboard/admin/Alerts";
import AdminSurveys from "@/components/dashboard/admin/Surveys";
import AdminReports from "@/components/dashboard/admin/Reports";
import AdminSettings from "@/components/dashboard/admin/Settings";
import Employees from "@/components/dashboard/admin/Employees";
import AutoPilotDashboard from "@/components/autoPilot/AutoPilotDashboard";
import { api } from "@/lib/api";
import Breadcrumb from "@/components/ui/breadcrumb";
import { getPageTitle } from "@/utils/navigation";
import DashboardDebug from "@/components/DashboardDebug";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  company_name?: string;
  createdAt: string;
  updatedAt: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Month');
  const [notifications, setNotifications] = useState(3); // Mock notification count

  // Get current section from URL
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/overview') {
      return 'overview';
    }
    // Extract section from path like /dashboard/trends -> trends
    const section = path.replace('/dashboard/', '');
    return section || 'overview';
  };

  const currentSection = getCurrentSection();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/auth/signin');
      return;
    }

    try {
      const user = JSON.parse(userData);
      setUser(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/auth/signin');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setActivityLoading(true);
        const activity = await api.getRecentActivity();
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Fallback to mock data if API fails
        setRecentActivity([
          {
            id: "1",
            type: "survey",
            description: "Employee Satisfaction Survey created",
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: "2",
            type: "response",
            description: "15 new responses received",
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: "3",
            type: "alert",
            description: "Team engagement score improved",
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ]);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/signin');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'survey':
        return <FileText className="w-4 h-4" />;
      case 'response':
        return <Users className="w-4 h-4" />;
      case 'alert':
        return <Bell className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'survey':
        return 'text-blue-600 bg-blue-100';
      case 'response':
        return 'text-green-600 bg-green-100';
      case 'alert':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const renderActiveSection = () => {
    // Temporary: Show debug component for troubleshooting
    if (currentSection === 'debug') {
      return <DashboardDebug />;
    }
    
    // For admin dashboard, use admin-specific components
    if (user?.role === 'admin') {
      switch (currentSection) {
        case 'overview':
          return <AdminDashboard />;
        case 'team-trends':
          return <TeamTrends />;
        case 'feedback':
          return <AdminFeedback />;
        case 'alerts':
          return <AdminAlerts />;
        case 'employees':
          return <Employees />;
        case 'surveys':
          return <AdminSurveys />;
        case 'reports':
          return <AdminReports />;
        case 'settings':
          return <AdminSettings />;
        case 'my-teams':
          return <div>My Teams - Coming Soon</div>;
        case 'auto-pilot':
          return <AutoPilotDashboard />;
        default:
          return <AdminDashboard />;
      }
    }
    // For owner dashboard, use different components
    else if (user?.role === 'owner') {
      switch (currentSection) {
        case 'overview':
          return <OwnerDashboard />;
        case 'culture-trends':
          return <CultureTrends />;
        case 'departments':
          return <Departments />;
        case 'adoption-usage':
          return <AdoptionUsage />;
        case 'admin-activity':
          return <AdminActivity />;
        case 'reports':
          return <Reports />;
        case 'settings':
          return <OwnerSettings />;
        case 'auto-pilot':
          return <AutoPilotDashboard />;
        default:
          return <OwnerDashboard />;
      }
    }
    
    // For regular users, use the original components
    switch (currentSection) {
      case 'overview':
        return <PulseOverview />;
      case 'trends':
        return <PredictiveTrendForecasting />;
      case 'feedback':
        return (
          <div className="space-y-6">
            <AnonymousCommentsViewer />
            <AnonymousSuggestionBox />
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <TeamBreakdown />
            <QuickActionsPanel />
          </div>
        );
      case 'settings':
        return <AdvancedCapabilities />;
      case 'team-usage':
        return <TeamUsageSnapshot />;
      case 'survey-activity':
        return <SurveyActivityLog />;
      case 'billing':
        return <PlanBillingOverview />;
      case 'support-risk':
        return <SupportRiskFlags />;
      case 'auto-pilot':
        return <AutoPilotDashboard />;
      default:
        return <PulseOverview />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional Top Navbar - Admin vs Owner vs Regular */}
      {user?.role === 'admin' ? (
        <AdminTopNavbar
          adminName={`${user.firstName} ${user.lastName}`}
          adminEmail={user.email}
          teams={["Sales", "Marketing"]}
          notifications={notifications}
          onDateRangeChange={setDateRange}
          onCreateSurvey={() => navigate('/surveys/create')}
          onLogout={handleLogout}
        />
      ) : (user?.role === 'owner') ? (
        <OwnerTopNavbar
          companyName={user?.company_name || "Novora"}
          notifications={notifications}
          onDateRangeChange={setDateRange}
          onCreateSurvey={() => navigate('/surveys/create')}
          onSwitchToAdmin={() => {
            // For now, just show a toast. In a real app, this would switch views
            toast({
              title: "Admin View",
              description: "Switching to admin view...",
            });
          }}
          onNavigateToSettings={() => navigate('/dashboard/settings')}
          onLogout={handleLogout}
        />
      ) : (
        <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side - Company name/logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Novora</span>
              </div>
              <div className="text-sm text-gray-500">
                {user?.company_name || 'Company Dashboard'}
              </div>
            </div>

            {/* Center - Date range selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 3 Months">Last 3 Months</option>
                <option value="This Year">This Year</option>
              </select>
            </div>

            {/* Right side - Notifications, user menu, create survey */}
            <div className="flex items-center space-x-4">
              {/* Notification bell */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* Create Survey button */}
              <Link to="/surveys/create">
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Survey</span>
                </Button>
              </Link>

              {/* User avatar menu */}
              <div className="relative">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName || user?.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </div>

              {/* Logout button */}
              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      <div className="flex h-screen pt-16"> {/* Add pt-16 to account for fixed header */}
        {/* Conditional Sidebar - Admin vs Others */}
        {user?.role === 'admin' ? (
          <AdminSidebar
            teamsCount={2}
          />
        ) : (
          <DashboardSidebar
            userRole={user?.role || 'user'}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Breadcrumb />
            </div>
            
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">
                {getPageTitle(location.pathname, user?.role)}
              </h1>
            </div>
            
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 