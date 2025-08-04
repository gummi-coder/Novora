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
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OwnerTopNavbarProps {
  companyName?: string;
  notifications?: number;
  onDateRangeChange?: (range: string) => void;
  onCreateSurvey?: () => void;
  onSwitchToAdmin?: () => void;
  onLogout?: () => void;
}

const OwnerTopNavbar = ({
  companyName = "Novora",
  notifications = 3,
  onDateRangeChange,
  onCreateSurvey,
  onSwitchToAdmin,
  onLogout
}: OwnerTopNavbarProps) => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("This Quarter");

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

  const handleLogout = () => {
    onLogout?.();
    toast({
      title: "Logged Out",
      description: "Successfully logged out",
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 h-16">
        {/* Left side: Company Name / Owner View */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Building className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{companyName}</h1>
              <p className="text-xs text-gray-500">Owner View</p>
            </div>
          </div>
        </div>

        {/* Right side: Controls */}
        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="This Quarter">This Quarter</SelectItem>
                <SelectItem value="Last Quarter">Last Quarter</SelectItem>
                <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                <SelectItem value="This Year">This Year</SelectItem>
                <SelectItem value="Last Year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Icon */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2"
              onClick={() => toast({
                title: "Notifications",
                description: `${notifications} organization-wide alerts`,
              })}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>
          </div>

          {/* Create Survey Button */}
          <Button
            onClick={handleCreateSurvey}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Survey
          </Button>

          {/* Owner Avatar Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Owner</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    owner@novora.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSwitchToAdmin}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Switch to Admin View</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default OwnerTopNavbar; 