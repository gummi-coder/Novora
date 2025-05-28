
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertDetail } from "@/components/alerts/AlertDetail";
import { Alert } from "@/components/alerts/AlertTable";
import { useToast } from "@/hooks/use-toast";
import { DataPoint } from "@/components/analytics/MetricChart";
import { Button } from "@/components/ui/button";

// Mock alerts data (same as in AlertsList)
const mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Sales team eNPS dropped 20%",
    metric: "eNPS",
    triggeredOn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: "critical",
    status: "unread",
    value: -5,
    previousValue: 15,
    percentageChange: -20
  },
  {
    id: "2",
    title: "Engineering response rate below 50%",
    metric: "Response Rate",
    triggeredOn: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    severity: "warning",
    status: "unread",
    value: 48,
    previousValue: 75,
    percentageChange: -27
  },
  {
    id: "3",
    title: "Manager satisfaction score decreased",
    metric: "Job Satisfaction",
    triggeredOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    severity: "info",
    status: "acknowledged",
    value: 3.5,
    previousValue: 4.2,
    percentageChange: -17
  },
  {
    id: "4",
    title: "Product team collaboration score improved",
    metric: "Collaboration",
    triggeredOn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    severity: "info",
    status: "resolved",
    value: 4.2,
    previousValue: 3.8,
    percentageChange: 10
  }
];

export default function AlertDetailPage() {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock chart data
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  
  // Mock alert history data
  const [historyData, setHistoryData] = useState<Array<{date: string, value: number}>>(
    [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), value: 75 },
      { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), value: 80 },
      { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), value: 65 },
    ]
  );
  
  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      const alert = alerts.find(a => a.id === alertId);
      
      if (alert) {
        setCurrentAlert(alert);
        
        // Generate chart data based on the alert
        const startDate = new Date(alert.triggeredOn);
        startDate.setDate(startDate.getDate() - 30); // Show 30 days before trigger
        
        // Generate mock chart data
        const data: DataPoint[] = [];
        let currentValue = alert.previousValue || 50;
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          
          // Make value trend towards the final value
          if (i <= 5) { // Start trending in the last 5 days
            currentValue = currentValue + ((alert.value || 0) - currentValue) * 0.2;
          } else {
            // Small random fluctuations
            currentValue = currentValue + (Math.random() * 6 - 3);
          }
          
          data.push({
            date: date.toISOString(),
            value: Math.round(currentValue),
            benchmark: 50 // Example benchmark value
          });
        }
        
        setChartData(data);
      } else {
        toast({
          title: "Alert not found",
          description: "The requested alert does not exist",
          variant: "destructive"
        });
        navigate("/alerts");
      }
      
      setIsLoading(false);
    }, 500);
  }, [alertId, alerts, navigate, toast]);
  
  // Handle acknowledge alert
  const handleAcknowledge = (id: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, status: "acknowledged" as const } : alert
    );
    
    setAlerts(updatedAlerts);
    setCurrentAlert(prev => prev ? { ...prev, status: "acknowledged" as const } : null);
    
    toast({
      title: "Alert acknowledged",
      description: "The alert has been marked as read"
    });
  };
  
  // Handle resolve alert
  const handleResolve = (id: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, status: "resolved" as const } : alert
    );
    
    setAlerts(updatedAlerts);
    setCurrentAlert(prev => prev ? { ...prev, status: "resolved" as const } : null);
    
    toast({
      title: "Alert resolved",
      description: "The alert has been marked as resolved"
    });
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate("/alerts");
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-pulse">Loading alert details...</div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!currentAlert) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Alert not found</h2>
          <p className="text-muted-foreground mb-4">The alert you're looking for doesn't exist or was deleted.</p>
          <Button onClick={handleBack}>Go back to alerts</Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <AlertDetail
        alert={currentAlert}
        historyData={historyData}
        chartData={chartData}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
        onBack={handleBack}
      />
    </DashboardLayout>
  );
}
