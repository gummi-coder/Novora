import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle } from 'lucide-react';
import { Alert, AlertSeverity } from '@/types/alerts';
import { AlertService, SurveyData } from '@/services/alertService';

interface AlertNotificationProps {
  className?: string;
  showCount?: boolean;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({ 
  className = '', 
  showCount = true 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [highPriorityCount, setHighPriorityCount] = useState(0);

  useEffect(() => {
    // Generate sample alerts for demonstration
    const alertService = new AlertService();
    const sampleData: SurveyData[] = [
      {
        teamId: 'engineering',
        driverId: 'Collaboration',
        currentScore: 5.8,
        previousScore: 7.2,
        participationRate: 45,
        previousParticipationRate: 78,
        negativeCommentsPercentage: 35,
        hasFlaggedComments: true,
        consecutiveLowMonths: 3,
      },
      {
        teamId: 'sales',
        driverId: 'eNPS',
        currentScore: -5,
        previousScore: 15,
        participationRate: 55,
        previousParticipationRate: 82,
      },
    ];

    const allAlerts: Alert[] = [];
    sampleData.forEach(data => {
      const teamAlerts = alertService.checkAlerts(data);
      allAlerts.push(...teamAlerts);
    });

    setAlerts(allAlerts);
    setHighPriorityCount(allAlerts.filter(alert => alert.severity === 'high').length);
  }, []);

  if (!showCount || highPriorityCount === 0) {
    return (
      <Button variant="ghost" size="sm" className={className}>
        <Bell className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" className={className} relative>
      <Bell className="w-4 h-4" />
      <Badge 
        variant="destructive" 
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
      >
        {highPriorityCount > 9 ? '9+' : highPriorityCount}
      </Badge>
    </Button>
  );
};
