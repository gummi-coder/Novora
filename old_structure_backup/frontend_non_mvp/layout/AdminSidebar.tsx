import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface AdminSidebarProps {
  teamsCount?: number;
}

const AdminSidebar = ({ teamsCount = 2 }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to check if a route is active
  const isActiveRoute = (routeId: string) => {
    const path = location.pathname;
    if (routeId === 'dashboard') {
      return path === '/dashboard' || path === '/dashboard/overview';
    }
    return path === `/dashboard/${routeId}`;
  };

  // Admin navigation items
  const adminNavigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & Analytics',
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
      description: 'Comments & Responses',
      path: '/dashboard/feedback'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      description: 'Team Alerts & Issues',
      path: '/dashboard/alerts'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      description: 'Directory & Invitations',
      path: '/dashboard/employees'
    },
    {
      id: 'surveys',
      label: 'Surveys',
      icon: BarChart3,
      description: 'Survey Management',
      path: '/dashboard/surveys'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Analytics & Exports',
      path: '/dashboard/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configuration',
      path: '/dashboard/settings'
    }
  ];

  // Optional: My Teams if managing >5 teams
  const showMyTeams = teamsCount > 5;
  const allItems = showMyTeams 
    ? [...adminNavigationItems, {
        id: 'my-teams',
        label: 'My Teams',
        icon: Users,
        description: `Managing ${teamsCount} teams`,
        path: '/dashboard/my-teams'
      }]
    : adminNavigationItems;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-600">Team Management</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
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
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-purple-600" : "text-gray-500"
              )} />
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
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {!collapsed && (
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-2">Admin Dashboard</div>
            <div className="text-xs text-gray-400">
              Managing {teamsCount} teams
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar; 