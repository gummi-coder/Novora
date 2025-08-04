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
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Admin</span>
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

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {allItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                isActive
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-purple-600" : "text-gray-500"
              )} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Managing {teamsCount} team{teamsCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar; 