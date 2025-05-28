
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { 
  AlertTriangle, 
  TrendingDown, 
  UserX, 
  BarChart,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock alert data
const alerts = [
  {
    id: 1,
    icon: TrendingDown,
    title: "Sales team eNPS dropped 20%",
    description: "Current: -5, Previous: 15",
    severity: "high",
  },
  {
    id: 2,
    icon: UserX,
    title: "Engineering response rate below 50%",
    description: "Only 48% completed the latest survey",
    severity: "medium",
  },
  {
    id: 3,
    icon: BarChart,
    title: "Manager satisfaction score decreased",
    description: "3 consecutive months of decline",
    severity: "medium",
  },
];

export function AlertsCard() {
  // Helper function to determine alert color
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500 bg-red-50";
      case "medium":
        return "text-orange-500 bg-orange-50";
      case "low":
        return "text-yellow-500 bg-yellow-50";
      default:
        return "text-blue-500 bg-blue-50";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Actionable Alerts</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start p-3 rounded-md border"
            >
              <div className={`p-2 rounded-full mr-3 ${getAlertColor(alert.severity)}`}>
                <alert.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {alert.description}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="ml-2">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
