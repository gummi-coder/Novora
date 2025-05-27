
import React from "react";
import { Alert as AlertComponent } from "@/components/ui/alert";
import { AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Bell, Check, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Alert } from "./AlertTable";
import { DataPoint } from "../analytics/MetricChart";

interface AlertDetailProps {
  alert: Alert;
  historyData: Array<{
    date: string;
    value: number;
  }>;
  chartData: DataPoint[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onBack: () => void;
}

export function AlertDetail({ 
  alert, 
  historyData, 
  chartData,
  onAcknowledge, 
  onResolve, 
  onBack 
}: AlertDetailProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-200 bg-red-50/50";
      case "warning":
        return "border-orange-200 bg-orange-50/50";
      case "info":
      default:
        return "border-blue-200 bg-blue-50/50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Alerts
        </Button>
        
        <div className="flex items-center gap-2">
          {alert.status === "unread" && (
            <Button 
              variant="outline" 
              onClick={() => onAcknowledge(alert.id)}
            >
              <Check className="mr-2 h-4 w-4" />
              Acknowledge
            </Button>
          )}
          {alert.status !== "resolved" && (
            <Button 
              variant="default"
              onClick={() => onResolve(alert.id)}
            >
              Resolve
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{alert.title}</CardTitle>
                  <CardDescription>
                    Triggered on {format(new Date(alert.triggeredOn), 'MMMM d, yyyy h:mm a')}
                  </CardDescription>
                </div>
                <Badge variant={
                  alert.severity === 'critical' 
                    ? 'destructive' 
                    : alert.severity === 'warning' 
                      ? 'default' 
                      : 'secondary'
                } className="text-xs capitalize">
                  {alert.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <AlertComponent className={`mb-4 ${getSeverityColor(alert.severity)}`}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertTitle>Metric: {alert.metric}</AlertTitle>
                {alert.value && alert.previousValue && (
                  <AlertDescription className="flex items-center mt-1">
                    Current value: <strong className="ml-1">{alert.value}</strong>
                    <span className="mx-2">|</span>
                    Previous value: <strong className="ml-1">{alert.previousValue}</strong>
                    
                    {alert.percentageChange && (
                      <span className={`flex items-center ml-2 ${
                        alert.percentageChange < 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {alert.percentageChange < 0 ? (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(alert.percentageChange)}%
                      </span>
                    )}
                  </AlertDescription>
                )}
              </AlertComponent>

              <div className="h-64 mt-6">
                {/* Chart placeholder - in a real app, render an actual chart component here */}
                <div className="w-full h-full bg-accent rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="ml-auto">
                <Link to={`/analytics/${alert.metric.toLowerCase().replace(/ /g, "-")}`}>
                  View Full Metric Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert History</CardTitle>
              <CardDescription>Past occurrences of this alert</CardDescription>
            </CardHeader>
            <CardContent>
              {historyData.length > 0 ? (
                <div className="space-y-4">
                  {historyData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{format(new Date(item.date), 'MMMM d, yyyy')}</p>
                        <p className="text-sm text-muted-foreground">Value: {item.value}</p>
                      </div>
                      <Badge variant="outline">Resolved</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No previous history for this alert</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Settings</CardTitle>
              <CardDescription>Threshold configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Current Threshold</p>
                <p className="text-muted-foreground">
                  {alert.metric} {'<'} 50 (Critical)
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <div className="flex items-center mt-1">
                  <Bell className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">In-app, Email</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Recipients</p>
                <p className="text-muted-foreground">Team Leaders, Administrators</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/alerts/settings">
                  Adjust Alert Settings
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
