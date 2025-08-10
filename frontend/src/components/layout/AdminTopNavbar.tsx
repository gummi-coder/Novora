import { useState } from "react";
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
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              onClick={() => toast({
                title: "Notifications",
                description: `${notifications} alerts for your teams`,
              })}
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