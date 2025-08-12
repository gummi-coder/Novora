import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Bell,
  User,
  Plus,
  Settings,
  LogOut,
  Shield,
  Building,
  Users,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Clock,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "alert" | "survey" | "team" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  team?: string;
  priority: "low" | "medium" | "high";
}

interface AdminTopNavbarProps {
  adminName?: string;
  adminEmail?: string;
  teams?: string[];
  notifications?: number;
  onDateRangeChange?: (range: string) => void;
  onCreateSurvey?: () => void;
  onLogout?: () => void;
}

const AdminTopNavbar = ({
  adminName = "Admin",
  adminEmail = "admin@novora.com",
  teams = ["Sales", "Marketing"],
  notifications = 5,
  onDateRangeChange,
  onCreateSurvey,
  onLogout
}: AdminTopNavbarProps) => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("This Month");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([
    {
      id: "1",
      type: "alert",
      title: "Team Alert: Sales",
      message: "Engagement score dropped by 15% this week",
      time: "2 minutes ago",
      read: false,
      team: "Sales",
      priority: "high"
    },
    {
      id: "2",
      type: "survey",
      title: "Survey Completed",
      message: "Monthly pulse check completed by Marketing team",
      time: "15 minutes ago",
      read: false,
      team: "Marketing",
      priority: "medium"
    },
    {
      id: "3",
      type: "team",
      title: "New Team Member",
      message: "Sarah Johnson joined the Engineering team",
      time: "1 hour ago",
      read: true,
      team: "Engineering",
      priority: "low"
    },
    {
      id: "4",
      type: "system",
      title: "System Update",
      message: "New features available in the dashboard",
      time: "2 hours ago",
      read: true,
      priority: "low"
    },
    {
      id: "5",
      type: "alert",
      title: "Response Rate Alert",
      message: "HR team survey response rate below 50%",
      time: "3 hours ago",
      read: false,
      team: "HR",
      priority: "medium"
    }
  ]);
  
  const notificationsRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    onDateRangeChange?.(value);
    toast({
      title: "Date Range Updated",
      description: `Viewing data for: ${value}`,
    });
  };

  const handleCreateSurvey = () => {
    onCreateSurvey?.();
    toast({
      title: "Create Survey",
      description: "Opening survey creation form...",
    });
  };

  const handleLogout = () => {
    onLogout?.();
    toast({
      title: "Logged Out",
      description: "Successfully logged out",
    });
  };

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      setNotificationsList(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
    
    // Handle different notification types
    switch (notification.type) {
      case "alert":
        toast({
          title: "Team Alert",
          description: `Viewing alert for ${notification.team} team`,
        });
        break;
      case "survey":
        toast({
          title: "Survey Completed",
          description: `Viewing survey results for ${notification.team} team`,
        });
        break;
      case "team":
        toast({
          title: "Team Update",
          description: `Viewing team details for ${notification.team}`,
        });
        break;
      case "system":
        toast({
          title: "System Update",
          description: "Viewing system updates and new features",
        });
        break;
    }
    
    setShowNotifications(false);
  };

  const handleMarkAllRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "All Read",
      description: "All notifications marked as read",
    });
  };

  const handleClearAll = () => {
    setNotificationsList([]);
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been cleared",
    });
    setShowNotifications(false);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notificationsList.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "survey":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "team":
        return <Users className="w-4 h-4 text-green-500" />;
      case "system":
        return <Settings className="w-4 h-4 text-purple-500" />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4 h-16">
        {/* Enhanced Left side: Admin View / My Teams */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin View</h1>
              <p className="text-xs text-gray-600 font-medium">Managing {teams.length} teams</p>
            </div>
          </div>
        </div>

        {/* Enhanced Right side: Controls */}
        <div className="flex items-center space-x-4">
          {/* Enhanced Date Range Selector */}
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4 text-gray-600" />
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-40 border-0 bg-transparent focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="This Quarter">This Quarter</SelectItem>
                <SelectItem value="Last Quarter">Last Quarter</SelectItem>
                <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                <SelectItem value="This Year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Notification Icon */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              onClick={handleNotificationsClick}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Mark all read
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notificationsList.length > 0 ? (
                    notificationsList.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                          !notification.read ? 'bg-blue-50' : ''
                        } ${getPriorityColor(notification.priority)} border-l-4`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </span>
                              {notification.team && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.team}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No notifications</p>
                      <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
                
                {notificationsList.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowNotifications(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Create Survey Button */}
          <Button
            onClick={handleCreateSurvey}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Survey
          </Button>

          {/* Enhanced Admin Avatar Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-all duration-200">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border-2 border-white shadow-sm">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none text-gray-900">{adminName}</p>
                      <p className="text-xs leading-none text-gray-500 mt-1">
                        {adminEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="font-medium">My Teams ({teams.length})</span>
                  <p className="text-xs text-gray-500">Manage your teams</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <span className="font-medium">Settings</span>
                  <p className="text-xs text-gray-500">Configure preferences</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="p-3 hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-600 hover:text-red-700"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <LogOut className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <span className="font-medium">Log out</span>
                  <p className="text-xs text-red-500">Sign out of your account</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default AdminTopNavbar; 