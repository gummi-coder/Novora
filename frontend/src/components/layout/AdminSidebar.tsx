import { useState } from "react";
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
  activeSection: string;
  onSectionChange: (section: string) => void;
  teamsCount?: number;
}

const AdminSidebar = ({ activeSection, onSectionChange, teamsCount = 2 }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  // Admin navigation items
  const adminNavigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & Analytics'
    },
    {
      id: 'team-trends',
      label: 'Team Trends',
      icon: TrendingUp,
      description: 'Team Performance Trends'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      description: 'Comments & Responses'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      description: 'Team Alerts & Issues'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      description: 'Directory & Invitations'
    },
    {
      id: 'surveys',
      label: 'Surveys',
      icon: BarChart3,
      description: 'Survey Management'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Analytics & Exports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configuration'
    }
  ];

  // Optional: My Teams if managing >5 teams
  const showMyTeams = teamsCount > 5;
  const allItems = showMyTeams 
    ? [...adminNavigationItems, {
        id: 'my-teams',
        label: 'My Teams',
        icon: Users,
        description: `Managing ${teamsCount} teams`
      }]
    : adminNavigationItems;

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
              <span className="font-bold text-xl text-gray-900">Admin</span>
              <div className="text-xs text-gray-600 font-medium">Control Center</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hover:bg-white/80 transition-all duration-200",
            collapsed ? "ml-auto" : ""
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Enhanced Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {allItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md" 
                  : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Enhanced Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {teamsCount} team{teamsCount !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-500">Under management</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar; 