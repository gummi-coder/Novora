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

  const isOwner = userRole === 'owner' || userRole === 'admin';

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

  // User navigation items (for regular users)
  const userNavigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview & Analytics',
      path: '/dashboard'
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: TrendingUp,
      description: 'Trend Analysis & Predictions',
      path: '/dashboard/trends'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      description: 'Comments & Suggestions',
      path: '/dashboard/feedback'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      description: 'Analytics & Exports',
      path: '/dashboard/reports'
    },
    {
      id: 'auto-pilot',
      label: 'Auto-Pilot',
      icon: Zap,
      description: 'Automated Survey Management',
      path: '/dashboard/auto-pilot'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configuration & Preferences',
      path: '/dashboard/settings'
    },
    {
      id: 'debug',
      label: 'Debug',
      icon: Activity,
      description: 'Debug Information',
      path: '/dashboard/debug'
    },
  ];

  // Owner navigation items - Strategic & High-Level
  const ownerNavigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Executive Overview',
      path: '/dashboard'
    },
    {
      id: 'culture-trends',
      label: 'Culture Trends',
      icon: TrendingUp,
      description: 'Organizational Culture Insights',
      path: '/dashboard/culture-trends'
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building,
      description: 'Department Performance & Health',
      path: '/dashboard/departments'
    },
    {
      id: 'adoption-usage',
      label: 'Adoption & Usage',
      icon: Users,
      description: 'Platform Adoption Metrics',
      path: '/dashboard/adoption-usage'
    },
    {
      id: 'admin-activity',
      label: 'Admin Activity',
      icon: Shield,
      description: 'Administrative Actions & Logs',
      path: '/dashboard/admin-activity'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      description: 'Executive Reports & Analytics',
      path: '/dashboard/reports'
    },
    {
      id: 'auto-pilot',
      label: 'Auto-Pilot',
      icon: Zap,
      description: 'Automated Survey Management',
      path: '/dashboard/auto-pilot'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'System Configuration',
      path: '/dashboard/settings'
    },
  ];

  // Admin navigation items
  const adminNavigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Admin Overview',
      path: '/dashboard'
    },
    {
      id: 'team-trends',
      label: 'Team Trends',
      icon: TrendingUp,
      description: 'Team Performance Trends',
      path: '/dashboard/team-trends'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      description: 'Employee Feedback Management',
      path: '/dashboard/feedback'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      description: 'System Alerts & Notifications',
      path: '/dashboard/alerts'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      description: 'Employee Management',
      path: '/dashboard/employees'
    },
    {
      id: 'surveys',
      label: 'Surveys',
      icon: FileText,
      description: 'Survey Management',
      path: '/dashboard/surveys'
    },
    {
      id: 'auto-pilot',
      label: 'Auto-Pilot',
      icon: Zap,
      description: 'Automated Survey Management',
      path: '/dashboard/auto-pilot'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      description: 'Analytics & Reports',
      path: '/dashboard/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'System Settings',
      path: '/dashboard/settings'
    },
  ];

  // Select navigation items based on user role
  const getNavigationItems = () => {
    if (userRole === 'admin') {
      return adminNavigationItems;
    } else if (isOwner) {
      return ownerNavigationItems;
    } else {
      return userNavigationItems;
    }
  };

  const allItems = getNavigationItems();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
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
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!collapsed && (
            <div className="text-xs text-gray-500 text-center">
              {userRole === 'admin' ? 'Admin Dashboard' : isOwner ? 'Owner Dashboard' : 'User Dashboard'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar; 