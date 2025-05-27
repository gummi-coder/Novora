import React, { useState } from "react";
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  LineChart,
  Users, 
  ClipboardList, 
  Bell, 
  Settings, 
  UserCircle,
  Calendar,
  LogOut,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { state, toggleSidebar } = useSidebar();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Count unread alerts (in a real app, this would come from a context or API)
  const unreadAlerts = 3;
  
  // Main navigation items
  const mainNavItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: BarChart3,
    },
    {
      title: "Team Overview",
      url: "/teams",
      icon: Users,
    },
    {
      title: "Surveys",
      url: "/surveys",
      icon: ClipboardList,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: LineChart,
    },
    {
      title: "Alerts",
      url: "/alerts",
      icon: Bell,
      badge: unreadAlerts.toString()
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
    }
  ];

  // Settings/help navigation items
  const settingsNavItems = [
    {
      title: "Settings",
      url: "/settings/account",
      icon: Settings,
    },
    {
      title: "Profile",
      url: "/profile/me",
      icon: UserCircle,
    }
  ];

  // Check if a path is active (handles nested routes)
  const isActive = (url: string) => {
    if (url === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(url);
  };

  const handleLogout = () => {
    // In a real app, you would clear auth tokens/session here
    window.location.href = "http://localhost:8080";
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded flex items-center justify-center mr-2 overflow-hidden">
                <img 
                  src="/lovable-uploads/5b77ec96-2245-4206-9aa7-a6b00a8dea4c.png" 
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
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`relative ${isActive(item.url) ? "bg-accent" : ""}`}
                    >
                      <Link to={item.url} className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={isActive(item.url) ? "bg-accent" : ""}
                    >
                      <Link to={item.url} className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="p-4">
            <button 
              className="w-full flex items-center text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, stay logged in</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Yes, logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

