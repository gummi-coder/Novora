import { AlertRule } from '../types/alerts';

export const defaultAlertRules: AlertRule[] = [
  // 1. Score Drop Alerts
  {
    id: 'score_drop_points',
    type: 'score_drop',
    name: 'Score Drop Alert',
    description: 'Any driver score drops >1.0 points vs last month',
    severity: 'medium',
    enabled: true,
    thresholds: {
      scoreDropPoints: 1.0,
    },
  },
  {
    id: 'score_drop_percentage',
    type: 'score_drop',
    name: 'Score Drop Percentage Alert',
    description: 'Any driver score drops >15% relative',
    severity: 'medium',
    enabled: true,
    thresholds: {
      scoreDropPercentage: 15,
    },
  },

  // 2. Critical Low Score Alerts
  {
    id: 'critical_low_score',
    type: 'critical_low_score',
    name: 'Critical Low Score Alert',
    description: 'Any driver avg <6.0 (signals a "red zone" team health issue)',
    severity: 'high',
    enabled: true,
    thresholds: {
      criticalScore: 6.0,
    },
  },
  {
    id: 'critical_enps',
    type: 'critical_low_score',
    name: 'Critical eNPS Alert',
    description: 'Company eNPS <0 (means more detractors than promoters)',
    severity: 'high',
    enabled: true,
    thresholds: {
      criticalENPS: 0,
    },
  },

  // 3. Participation Alerts
  {
    id: 'low_participation',
    type: 'participation_drop',
    name: 'Low Participation Alert',
    description: 'Team participation <60% (means results may be skewed, signals disengagement)',
    severity: 'medium',
    enabled: true,
    thresholds: {
      participationThreshold: 60,
    },
  },
  {
    id: 'participation_drop',
    type: 'participation_drop',
    name: 'Participation Drop Alert',
    description: 'Drop of >20% participation vs previous survey',
    severity: 'medium',
    enabled: true,
    thresholds: {
      participationDropPercentage: 20,
    },
  },

  // 4. Sentiment / Comments Alerts
  {
    id: 'negative_sentiment_spike',
    type: 'sentiment_spike',
    name: 'Negative Sentiment Spike',
    description: 'Spike in Negative Comments (>30% of comments flagged negative in one survey)',
    severity: 'medium',
    enabled: true,
    thresholds: {
      negativeCommentsPercentage: 30,
    },
  },
  {
    id: 'flagged_comments',
    type: 'flagged_comment',
    name: 'Flagged Comments Alert',
    description: 'Flagged Comments present (urgent issues like "harassment," "burnout")',
    severity: 'high',
    enabled: true,
    thresholds: {},
  },

  // 5. Recurring Risk Alerts
  {
    id: 'recurring_low_score',
    type: 'recurring_risk',
    name: 'Recurring Low Score Alert',
    description: '3 consecutive months below threshold on any driver (signals chronic issue)',
    severity: 'high',
    enabled: true,
    thresholds: {
      consecutiveMonths: 3,
      criticalScore: 6.0,
    },
  },
  {
    id: 'unacknowledged_alerts',
    type: 'recurring_risk',
    name: 'Unacknowledged Alerts',
    description: 'No improvement after 2 alerts acknowledged (manager not acting)',
    severity: 'high',
    enabled: true,
    thresholds: {
      consecutiveMonths: 2,
    },
  },
];
