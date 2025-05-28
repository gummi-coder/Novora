
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export interface Alert {
  id: string;
  title: string;
  metric: string;
  triggeredOn: string;
  severity: "info" | "warning" | "critical";
  status: "unread" | "acknowledged" | "resolved";
  value?: number;
  previousValue?: number;
  percentageChange?: number;
}

interface AlertTableProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onMarkAllRead: () => void;
}

export function AlertTable({ alerts, onAcknowledge, onResolve, onMarkAllRead }: AlertTableProps) {
  const { toast } = useToast();
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    if (selectedAlerts.includes(id)) {
      setSelectedAlerts(selectedAlerts.filter((alertId) => alertId !== id));
    } else {
      setSelectedAlerts([...selectedAlerts, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === alerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(alerts.map((alert) => alert.id));
    }
  };

  const handleAcknowledge = (id: string) => {
    onAcknowledge(id);
    toast({
      title: "Alert acknowledged",
      description: "The alert has been marked as read",
    });
  };

  const handleResolve = (id: string) => {
    onResolve(id);
    toast({
      title: "Alert resolved",
      description: "The alert has been marked as resolved",
    });
  };

  const handleMarkAllRead = () => {
    onMarkAllRead();
    toast({
      title: "Alerts updated",
      description: "All alerts have been marked as read",
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge className="bg-orange-500">Warning</Badge>;
      case "info":
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge variant="outline" className="text-green-500 border-green-500">Resolved</Badge>;
      case "acknowledged":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Acknowledged</Badge>;
      case "unread":
      default:
        return <Badge variant="outline">Unread</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Alerts</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllRead}
          disabled={alerts.filter(a => a.status === "unread").length === 0}
        >
          Mark all as read
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Alert Title</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Triggered On</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>{alert.title}</TableCell>
                  <TableCell>{alert.metric}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(alert.triggeredOn), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                  <TableCell>{getStatusBadge(alert.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {alert.status === "unread" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    {alert.status !== "resolved" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      asChild
                    >
                      <Link to={`/alerts/${alert.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
