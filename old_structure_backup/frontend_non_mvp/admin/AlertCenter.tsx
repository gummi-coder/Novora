import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertSeverity } from '@/types/alerts';
import { AlertService, SurveyData } from '@/services/alertService';
import { Bell, AlertTriangle, CheckCircle, XCircle, TrendingDown, Users, MessageSquare, Clock } from 'lucide-react';

interface AlertCenterProps {
  surveyData?: SurveyData[];
}

const severityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
};

const severityIcons = {
  high: AlertTriangle,
  medium: TrendingDown,
  low: Bell,
};

const typeIcons = {
  score_drop: TrendingDown,
  critical_low_score: XCircle,
  participation_drop: Users,
  sentiment_spike: MessageSquare,
  flagged_comment: AlertTriangle,
  recurring_risk: Clock,
};

export const AlertCenter: React.FC<AlertCenterProps> = ({ surveyData = [] }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');

  const alertService = new AlertService();

  useEffect(() => {
    // Generate sample alerts for demonstration
    const sampleAlerts = generateSampleAlerts();
    setAlerts(sampleAlerts);
  }, []);

  const generateSampleAlerts = (): Alert[] => {
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
      {
        teamId: 'operations',
        driverId: 'Work-Life Balance',
        currentScore: 4.2,
        previousScore: 6.1,
        participationRate: 35,
        previousParticipationRate: 65,
        consecutiveLowMonths: 4,
      },
    ];

    const allAlerts: Alert[] = [];
    sampleData.forEach(data => {
      const teamAlerts = alertService.checkAlerts(data);
      allAlerts.push(...teamAlerts);
    });

    return allAlerts;
  };

  const acknowledgeAlert = (alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
  };

  const getFilteredAlerts = () => {
    let filtered = alerts.filter(alert => 
      showAcknowledged ? true : !acknowledgedAlerts.has(alert.id)
    );

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

    return filtered.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const getSeverityCount = (severity: AlertSeverity) => {
    return alerts.filter(alert => 
      alert.severity === severity && !acknowledgedAlerts.has(alert.id)
    ).length;
  };

  const filteredAlerts = getFilteredAlerts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alert Center</h2>
          <p className="text-gray-600">Monitor and manage engagement alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {getSeverityCount('high')} High
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {getSeverityCount('medium')} Medium
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {getSeverityCount('low')} Low
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Severity:</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | 'all')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAcknowledged(!showAcknowledged)}
        >
          {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">No active alerts</p>
                <p className="text-green-600 text-sm">All systems are running smoothly</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const SeverityIcon = severityIcons[alert.severity];
            const TypeIcon = typeIcons[alert.type];
            const isAcknowledged = acknowledgedAlerts.has(alert.id);

            return (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  isAcknowledged 
                    ? 'bg-gray-50 border-gray-300' 
                    : `border-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'yellow' : 'blue'}-500`
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        isAcknowledged 
                          ? 'bg-gray-100 text-gray-600' 
                          : severityColors[alert.severity]
                      }`}>
                        <SeverityIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${
                            isAcknowledged ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                            {alert.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`${
                              isAcknowledged 
                                ? 'bg-gray-100 text-gray-600 border-gray-300' 
                                : severityColors[alert.severity]
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                          {isAcknowledged && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        
                        <p className={`text-sm mb-3 ${
                          isAcknowledged ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          {alert.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />
                            {alert.type.replace('_', ' ')}
                          </div>
                          {alert.teamId && (
                            <span>Team: {alert.teamId}</span>
                          )}
                          {alert.driverId && (
                            <span>Driver: {alert.driverId}</span>
                          )}
                          <span>
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {!isAcknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="ml-4"
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
