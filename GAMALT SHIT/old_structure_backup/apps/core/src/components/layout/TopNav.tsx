
import React from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Search, Menu } from "lucide-react";
import { RealtimeFeed } from "@/components/alerts/RealtimeFeed";
import { Alert } from "@/components/alerts/AlertTable";
import { useToast } from "@/hooks/use-toast";

// Mock alerts data for demonstration
const mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Sales team eNPS dropped 20%",
    metric: "eNPS",
    triggeredOn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    severity: "critical",
    status: "unread"
  },
  {
    id: "2",
    title: "Engineering response rate below 50%",
    metric: "Response Rate",
    triggeredOn: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    severity: "warning",
    status: "unread"
  }
];

export function TopNav() {
  const { toast } = useToast();
  const [alerts, setAlerts] = React.useState<Alert[]>(mockAlerts);
  const { state, toggleSidebar } = useSidebar();
  
  // Handle acknowledge alert
  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: "acknowledged" } : alert
    ));
  };
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex w-full justify-between items-center">
          <div className="relative max-w-md flex items-center gap-2">
            {/* Sidebar toggle button placed next to search */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex items-center justify-center"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 w-full bg-accent"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            
            <RealtimeFeed alerts={alerts} onAcknowledge={handleAcknowledge} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-8">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

