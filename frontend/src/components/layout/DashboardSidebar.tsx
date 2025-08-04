import { useState } from "react";
import { Link } from "react-router-dom";
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
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DashboardSidebar = ({ userRole, activeSection, onSectionChange }: DashboardSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const isOwner = userRole === 'owner' || userRole === 'admin';

  // User navigation items (for regular users)
  const userNavigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview & Analytics'
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: TrendingUp,
      description: 'Trend Analysis & Predictions'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      description: 'Comments & Suggestions'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      description: 'Analytics & Exports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configuration & Preferences'
    },
  ];

  // Owner navigation items - Strategic & High-Level
  const ownerNavigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Executive Overview'
    },
    {
      id: 'culture-trends',
      label: 'Culture Trends',
      icon: TrendingUp,
      description: 'Organizational Culture Insights'
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building,
      description: 'Department Performance & Health'
    },
    {
      id: 'adoption-usage',
      label: 'Adoption & Usage',
      icon: Users,
      description: 'Platform Adoption Metrics'
    },
    {
      id: 'admin-activity',
      label: 'Admin Activity',
      icon: Shield,
      description: 'Administrative Actions & Logs'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      description: 'Executive Reports & Analytics'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'System Configuration'
    },
  ];

  const allItems = isOwner ? ownerNavigationItems : userNavigationItems;

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return 'Dashboard';
      case 'trends':
        return 'Trends';
      case 'feedback':
        return 'Feedback';
      case 'reports':
        return 'Reports';
      case 'settings':
        return 'Settings';
      case 'culture-trends':
        return 'Culture Trends';
      case 'departments':
        return 'Departments';
      case 'adoption-usage':
        return 'Adoption & Usage';
      case 'admin-activity':
        return 'Admin Activity';
      default:
        return 'Dashboard';
    }
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

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
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
              {isOwner ? 'Owner Dashboard' : 'User Dashboard'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar; 