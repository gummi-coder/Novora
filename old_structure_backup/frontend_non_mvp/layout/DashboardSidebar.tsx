import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Activity,
  Settings,
  Bell,
  TrendingUp,
  Clock,
  MessageSquare,
  Target,
  Brain,
  Zap,
  Crown,
  FileText,
  CreditCard,
  Shield,
  ChevronLeft,
  ChevronRight,
  PieChart,
  FileBarChart,
  Building
} from "lucide-react";

interface DashboardSidebarProps {
  userRole: string;
}

const DashboardSidebar = ({ userRole }: DashboardSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isOwner = userRole === 'admin';

  // Helper function to check if a route is active
  const isActiveRoute = (routeId: string) => {
    const path = location.pathname;
    if (routeId === 'overview') {
      return path === '/dashboard' || path === '/dashboard/overview';
    }
    return path === `/dashboard/${routeId}`;
  };

  // Helper function to get navigation path
  const getNavigationPath = (routeId: string) => {
    if (routeId === 'overview') {
      return '/dashboard';
    }
    return `/dashboard/${routeId}`;
  };

  // Manager navigation items (for team managers)
  const managerNavigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Your Team Overview & Analytics',
      path: '/dashboard'
    },
    {
      id: 'team-trends',
      label: 'Team Trends',
      icon: TrendingUp,
      description: 'Your Team Performance Trends',
      path: '/dashboard/team-trends'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      description: 'Your Team Comments & Suggestions',
      path: '/dashboard/feedback'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      description: 'Your Team Alerts & Notifications',
      path: '/dashboard/alerts'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      description: 'Your Team Members',
      path: '/dashboard/employees'
    },
    {
      id: 'surveys',
      label: 'Surveys',
      icon: FileText,
      description: 'Your Team Surveys (Read-Only)',
      path: '/dashboard/surveys'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      description: 'Your Team Reports & Exports',
      path: '/dashboard/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Your Personal Settings',
      path: '/dashboard/settings'
    },
  ];

  // Admin navigation items - Strategic & High-Level
  const adminNavigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Company Health Snapshot',
      path: '/dashboard'
    },
    {
      id: 'team-trends',
      label: 'Team Trends',
      icon: TrendingUp,
      description: 'All Teams Performance Trends',
      path: '/dashboard/team-trends'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      description: 'All Employee Feedback',
      path: '/dashboard/feedback'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      description: 'All System Alerts',
      path: '/dashboard/alerts'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      description: 'Full Employee Directory',
      path: '/dashboard/employees'
    },
    {
      id: 'surveys',
      label: 'Surveys',
      icon: FileText,
      description: 'Full Survey Management',
      path: '/dashboard/surveys'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      description: 'Company-wide Reports',
      path: '/dashboard/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'System Configuration',
      path: '/dashboard/settings'
    },
  ];

  // Admin navigation items - map to tab values
  const adminTabNavigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Company Health Snapshot',
      path: '/dashboard',
      tabValue: 'overview'
    },
    {
      id: 'team-trends',
      label: 'Team Trends',
      icon: TrendingUp,
      description: 'All Teams Performance Trends',
      path: '/dashboard/team-trends',
      tabValue: 'team-trends'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      description: 'All Employee Feedback',
      path: '/dashboard/feedback',
      tabValue: 'feedback'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      description: 'All System Alerts',
      path: '/dashboard/alerts',
      tabValue: 'alerts'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      description: 'Full Employee Directory',
      path: '/dashboard/employees',
      tabValue: 'employees'
    },
    {
      id: 'surveys',
      label: 'Surveys',
      icon: FileText,
      description: 'Full Survey Management',
      path: '/dashboard/surveys',
      tabValue: 'surveys'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      description: 'Company-wide Reports',
      path: '/dashboard/reports',
      tabValue: 'reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'System Configuration',
      path: '/dashboard/settings',
      tabValue: 'settings'
    },
  ];

  // Select navigation items based on user role
  const getNavigationItems = () => {
    if (userRole === 'admin') {
      return adminNavigationItems;
    } else if (userRole === 'manager') {
      return managerNavigationItems;
    } else {
      return managerNavigationItems;
    }
  };

  const allItems = getNavigationItems();

  const handleNavigation = (path: string, tabValue?: string) => {
    if (userRole === 'admin' && tabValue) {
      // For admin users, navigate to dashboard and set the tab
      navigate('/dashboard', { state: { activeTab: tabValue } });
    } else {
      navigate(path);
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-xl transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-gray-100/50 backdrop-blur-sm"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, (item as any).tabValue)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                    : 'text-gray-700 hover:bg-white/50 backdrop-blur-sm hover:text-gray-900 hover:shadow-sm hover:-translate-y-0.5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          {!collapsed && (
            <div className="text-xs text-gray-500 text-center">
              {userRole === 'admin' ? 'Admin Dashboard' : 'Manager Dashboard'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar; 