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
import { useAuth } from "@/hooks/useAuth";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminTopNavbar from "@/components/layout/OwnerTopNavbar";
import UnifiedDashboard from "@/components/dashboard/UnifiedDashboard";
import { api } from "@/lib/api";
import Breadcrumb from "@/components/ui/breadcrumb";
import { getPageTitle } from "@/utils/navigation";

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Month');
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const [logoSettings, setLogoSettings] = useState({
    customLogo: undefined as string | undefined,
    allowCustomLogo: true
  });

  // Listen for logo settings changes from localStorage or context
  useEffect(() => {
    const savedLogo = localStorage.getItem('novora_custom_logo');
    const savedAllowCustom = localStorage.getItem('novora_allow_custom_logo');
    
    if (savedLogo) {
      setLogoSettings(prev => ({ ...prev, customLogo: savedLogo }));
    }
    if (savedAllowCustom !== null) {
      setLogoSettings(prev => ({ ...prev, allowCustomLogo: savedAllowCustom === 'true' }));
    }
  }, []);

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

  if (authLoading) {
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
      {/* Use AdminTopNavbar for all users for consistency */}
      <AdminTopNavbar
        companyName={user?.company_name || "Novora"}
        userRole={user?.role || "admin"}
        notifications={notifications}
        customLogo={logoSettings.customLogo}
        isEnterprise={logoSettings.allowCustomLogo}
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

      <div className="flex h-screen pt-16">
        {/* Unified Sidebar for all roles */}
        <DashboardSidebar
          userRole={user?.role || 'user'}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 min-w-0">
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
            
            {/* Use UnifiedDashboard for all users */}
            <UnifiedDashboard />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 