import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Building,
  Users,
  CreditCard,
  AlertCircle,
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const AppSidebar = () => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { state, toggleSidebar } = useSidebar();

  const mainNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { name: "Companies", path: "/companies", icon: Building },
    { name: "Users", path: "/users", icon: Users },
    { name: "Billing & Plans", path: "/billing", icon: CreditCard },
    { name: "System Alerts", path: "/system-alerts", icon: AlertCircle },
    { name: "Feedback", path: "/feedback", icon: MessageSquare },
    { name: "Engagement", path: "/engagement", icon: Activity },
  ];

  const settingsNavItems = [
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    window.location.href = "http://localhost:8080";
  };

  return (
    <>
      <Sidebar className="w-[240px] border-r bg-background">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded flex items-center justify-center mr-2 overflow-hidden">
                <img 
                  src="/uploads/5b77ec96-2245-4206-9aa7-a6b00a8dea4c.png" 
                  alt="Novora Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-semibold text-lg">Novora</div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2 hidden md:flex" 
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {state === "expanded" ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4">Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      className="flex items-center"
                    >
                      <NavLink 
                        to={item.path} 
                        className={({ isActive }) =>
                          `flex items-center px-4 ${isActive ? "bg-accent" : ""}`
                        }
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel className="px-4">Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild
                      className="flex items-center"
                    >
                      <NavLink 
                        to={item.path} 
                        className={({ isActive }) =>
                          `flex items-center px-4 ${isActive ? "bg-accent" : ""}`
                        }
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <SidebarMenuButton
            onClick={() => setShowLogoutDialog(true)}
            className="w-full flex items-center"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppSidebar;
