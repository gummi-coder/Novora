
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Eye, TrendingDown, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Alert } from "./AlertTable";

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 text-red-500 border-red-200";
      case "warning":
        return "bg-orange-50 text-orange-500 border-orange-200";
      case "info":
      default:
        return "bg-blue-50 text-blue-500 border-blue-200";
    }
  };
  
  return (
    <Card className={`border-l-4 ${
      alert.status === 'unread' 
        ? alert.severity === 'critical' 
          ? 'border-l-red-500' 
          : alert.severity === 'warning' 
            ? 'border-l-orange-500' 
            : 'border-l-blue-500'
        : 'border-l-green-500'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-medium">{alert.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(alert.triggeredOn), { addSuffix: true })}
            </p>
          </div>
          <Badge variant={
            alert.severity === 'critical' 
              ? 'destructive' 
              : alert.severity === 'warning' 
                ? 'default' 
                : 'secondary'
          }>
            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center mt-2">
          <div className="text-sm font-medium">{alert.metric}</div>
          {alert.percentageChange && (
            <div className={`flex items-center ml-2 text-xs ${
              alert.percentageChange < 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {alert.percentageChange < 0 ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <TrendingUp className="w-3 h-3 mr-1" />
              )}
              {Math.abs(alert.percentageChange)}%
            </div>
          )}
        </div>
        <div className="mt-3 text-sm">
          <Badge variant="outline">
            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end gap-2">
        {alert.status === "unread" && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onAcknowledge(alert.id)}
          >
            <Check className="h-4 w-4 mr-1" />
            Acknowledge
          </Button>
        )}
        {alert.status !== "resolved" && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onResolve(alert.id)}
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
      </CardFooter>
    </Card>
  );
}
