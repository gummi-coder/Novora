export type AlertSeverity = 'low' | 'medium' | 'high';

export type AlertType = 
  | 'score_drop'
  | 'critical_low_score'
  | 'participation_drop'
  | 'sentiment_spike'
  | 'flagged_comment'
  | 'recurring_risk';

export interface AlertRule {
  id: string;
  type: AlertType;
  name: string;
  description: string;
  severity: AlertSeverity;
  enabled: boolean;
  thresholds: {
    scoreDropPoints?: number;
    scoreDropPercentage?: number;
    criticalScore?: number;
    criticalENPS?: number;
    participationThreshold?: number;
    participationDropPercentage?: number;
    negativeCommentsPercentage?: number;
    consecutiveMonths?: number;
  };
}

export interface Alert {
  id: string;
  ruleId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  teamId?: string;
  driverId?: string;
  currentValue: number;
  previousValue?: number;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface AlertConfiguration {
  rules: AlertRule[];
  globalSettings: {
    emailNotifications: boolean;
    dashboardNotifications: boolean;
    autoAcknowledge: boolean;
  };
}
