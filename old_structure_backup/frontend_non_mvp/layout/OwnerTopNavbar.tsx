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
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminTopNavbarProps {
  companyName?: string;
  userRole?: string;
  notifications?: number;
  customLogo?: string;
  isEnterprise?: boolean;
  onDateRangeChange?: (range: string) => void;
  onCreateSurvey?: () => void;
  onSwitchToAdmin?: () => void;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
}

const AdminTopNavbar = ({
  companyName = "Novora",
  userRole = "admin",
  notifications = 3,
  customLogo,
  isEnterprise = false,
  onDateRangeChange,
  onCreateSurvey,
  onSwitchToAdmin,
  onLogout,
  onNavigateToSettings
}: AdminTopNavbarProps) => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("This Quarter");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  // Mock notifications data
  const [notificationsList] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'Team Alert: Low Participation',
      message: 'Sales team participation dropped below 60%',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'survey',
      title: 'New Survey Response',
      message: 'Engineering team completed Q1 culture survey',
      time: '4 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'system',
      title: 'System Update',
      message: 'New features available in your dashboard',
      time: '1 day ago',
      read: true
    }
  ]);

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

  const handleSwitchToAdmin = () => {
    onSwitchToAdmin?.();
    toast({
      title: "View Changed",
      description: "Switched to Admin View",
    });
  };

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (notificationId: number) => {
    toast({
      title: "Notification Opened",
      description: `Opening notification: ${notificationsList.find(n => n.id === notificationId)?.title}`,
    });
    setShowNotifications(false);
  };

  const handleMarkAllRead = () => {
    toast({
      title: "Notifications Updated",
      description: "All notifications marked as read",
    });
    setShowNotifications(false);
  };

  const handleSettingsClick = () => {
    onNavigateToSettings?.();
    toast({
      title: "Settings",
      description: "Opening settings...",
    });
  };

  const handleLogout = () => {
    onLogout?.();
    toast({
      title: "Logged Out",
      description: "Successfully logged out",
    });
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 h-16">
        {/* Enhanced Left side: Company Logo & Name */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Company Logo - Novora default or custom for enterprise */}
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xl">
              {customLogo && isEnterprise ? (
                <img 
                  src={customLogo} 
                  alt={`${companyName} Logo`} 
                  className="w-10 h-10 object-contain rounded-lg"
                />
              ) : companyName === 'Novora' ? (
                <img 
                  src="/favicon.png" 
                  alt="Novora Logo" 
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
              <p className="text-sm text-gray-600 font-medium">{userRole === 'admin' ? 'Admin View' : 'Manager View'}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Right side: Controls */}
        <div className="flex items-center space-x-4">

          {/* Enhanced Notification Icon */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-white/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:shadow-sm"
              onClick={handleNotificationsClick}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllRead}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notificationsList.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'alert' ? 'bg-red-500' :
                          notification.type === 'survey' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowNotifications(false)}
                  >
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Create Survey Button - Admin Only */}
          {userRole === 'admin' && (
            <Button
              onClick={handleCreateSurvey}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Survey
            </Button>
          )}

          {/* Enhanced Owner Avatar Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-sm p-0">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border-2 border-white shadow-sm">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none text-gray-900">{userRole === 'admin' ? 'Admin' : 'Manager'}</p>
                      <p className="text-xs leading-none text-gray-500 mt-1">
                        {userRole === 'admin' ? 'admin@novora.com' : 'manager@novora.com'}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSwitchToAdmin}
                className="p-3 hover:bg-white/50 backdrop-blur-sm rounded-lg transition-all duration-300"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="font-medium">Switch to Admin View</span>
                  <p className="text-xs text-gray-500">Team management</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSettingsClick}
                className="p-3 hover:bg-white/50 backdrop-blur-sm rounded-lg transition-all duration-300"
              >
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
                className="p-3 hover:bg-red-50/50 backdrop-blur-sm rounded-lg transition-all duration-300 text-red-600 hover:text-red-700"
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
    </nav>
  );
};

export default AdminTopNavbar; 