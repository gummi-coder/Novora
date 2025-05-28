
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Alert } from "./AlertTable";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

interface RealtimeFeedProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

export function RealtimeFeed({ alerts, onAcknowledge }: RealtimeFeedProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast: hookToast } = useToast();

  // Calculate unread count
  useEffect(() => {
    const count = alerts.filter(alert => alert.status === "unread").length;
    setUnreadCount(count);
  }, [alerts]);

  // Simulate receiving a new alert
  useEffect(() => {
    const interval = setInterval(() => {
      // This is just for demonstration - in a real app this would come from WebSockets or polling
      const shouldAddAlert = Math.random() > 0.9; // 10% chance
      
      if (shouldAddAlert) {
        // In a real app, this would be handled by the parent component updating the alerts array
        // This is just to simulate a notification
        toast("New Alert", {
          description: "Critical response rate drop in Engineering team",
          action: {
            label: "View",
            onClick: () => window.location.href = "/alerts",
          },
        });
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Mark as read when opening popover
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  // Handle clicking acknowledge for an individual alert
  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAcknowledge(id);
    
    hookToast({
      title: "Alert acknowledged",
      description: "The alert has been marked as read",
    });
  };

  const getSeverityIndicator = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-orange-500";
      default:
        return "bg-blue-500";
    }
  };

  // Get recent unread alerts
  const recentUnreadAlerts = alerts
    .filter(alert => alert.status === "unread")
    .sort((a, b) => new Date(b.triggeredOn).getTime() - new Date(a.triggeredOn).getTime())
    .slice(0, 5);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Alerts</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </div>
        </div>
        
        {recentUnreadAlerts.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            {recentUnreadAlerts.map((alert) => (
              <Link
                key={alert.id}
                to={`/alerts/${alert.id}`}
                className="flex items-start p-4 border-b hover:bg-accent transition-colors last:border-0"
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 ${getSeverityIndicator(alert.severity)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.metric} • {formatDistanceToNow(new Date(alert.triggeredOn), { addSuffix: true })}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-8"
                  onClick={(e) => handleAcknowledge(alert.id, e)}
                >
                  Clear
                </Button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <p>No unread alerts</p>
          </div>
        )}
        
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to="/alerts">View all alerts</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
