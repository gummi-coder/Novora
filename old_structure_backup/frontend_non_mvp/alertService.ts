import { Alert, AlertRule, AlertType } from '../types/alerts';
import { defaultAlertRules } from '../data/alertRules';

export interface SurveyData {
  teamId: string;
  driverId?: string;
  currentScore: number;
  previousScore?: number;
  participationRate: number;
  previousParticipationRate?: number;
  negativeCommentsPercentage?: number;
  hasFlaggedComments?: boolean;
  consecutiveLowMonths?: number;
  unacknowledgedAlerts?: number;
}

export class AlertService {
  private rules: AlertRule[] = defaultAlertRules;

  setRules(rules: AlertRule[]) {
    this.rules = rules;
  }

  getRules(): AlertRule[] {
    return this.rules;
  }

  checkAlerts(surveyData: SurveyData): Alert[] {
    const alerts: Alert[] = [];
    const enabledRules = this.rules.filter(rule => rule.enabled);

    for (const rule of enabledRules) {
      const alert = this.checkRule(rule, surveyData);
      if (alert) {
        alerts.push(alert);
      }
    }

    return alerts;
  }

  private checkRule(rule: AlertRule, data: SurveyData): Alert | null {
    switch (rule.type) {
      case 'score_drop':
        return this.checkScoreDrop(rule, data);
      case 'critical_low_score':
        return this.checkCriticalLowScore(rule, data);
      case 'participation_drop':
        return this.checkParticipationDrop(rule, data);
      case 'sentiment_spike':
        return this.checkSentimentSpike(rule, data);
      case 'flagged_comment':
        return this.checkFlaggedComments(rule, data);
      case 'recurring_risk':
        return this.checkRecurringRisk(rule, data);
      default:
        return null;
    }
  }

  private checkScoreDrop(rule: AlertRule, data: SurveyData): Alert | null {
    if (!data.previousScore) return null;

    const scoreDrop = data.previousScore - data.currentScore;
    const scoreDropPercentage = (scoreDrop / data.previousScore) * 100;

    // Check points drop
    if (rule.thresholds.scoreDropPoints && scoreDrop >= rule.thresholds.scoreDropPoints) {
      return this.createAlert(rule, data, {
        title: `Score Drop Alert: ${data.driverId || 'Driver'} dropped ${scoreDrop.toFixed(1)} points`,
        description: `${data.driverId || 'Driver'} score dropped from ${data.previousScore.toFixed(1)} to ${data.currentScore.toFixed(1)}`,
        currentValue: data.currentScore,
        previousValue: data.previousScore,
      });
    }

    // Check percentage drop
    if (rule.thresholds.scoreDropPercentage && scoreDropPercentage >= rule.thresholds.scoreDropPercentage) {
      return this.createAlert(rule, data, {
        title: `Score Drop Alert: ${data.driverId || 'Driver'} dropped ${scoreDropPercentage.toFixed(1)}%`,
        description: `${data.driverId || 'Driver'} score dropped ${scoreDropPercentage.toFixed(1)}% from ${data.previousScore.toFixed(1)} to ${data.currentScore.toFixed(1)}`,
        currentValue: data.currentScore,
        previousValue: data.previousScore,
      });
    }

    return null;
  }

  private checkCriticalLowScore(rule: AlertRule, data: SurveyData): Alert | null {
    // Check critical score threshold
    if (rule.thresholds.criticalScore && data.currentScore < rule.thresholds.criticalScore) {
      return this.createAlert(rule, data, {
        title: `Critical Low Score: ${data.driverId || 'Driver'} at ${data.currentScore.toFixed(1)}`,
        description: `${data.driverId || 'Driver'} score of ${data.currentScore.toFixed(1)} is below critical threshold of ${rule.thresholds.criticalScore}`,
        currentValue: data.currentScore,
      });
    }

    // Check critical eNPS (assuming driverId is 'eNPS' for eNPS scores)
    if (rule.thresholds.criticalENPS && data.driverId === 'eNPS' && data.currentScore < rule.thresholds.criticalENPS) {
      return this.createAlert(rule, data, {
        title: `Critical eNPS Alert: Company eNPS at ${data.currentScore.toFixed(1)}`,
        description: `Company eNPS of ${data.currentScore.toFixed(1)} indicates more detractors than promoters`,
        currentValue: data.currentScore,
      });
    }

    return null;
  }

  private checkParticipationDrop(rule: AlertRule, data: SurveyData): Alert | null {
    // Check low participation threshold
    if (rule.thresholds.participationThreshold && data.participationRate < rule.thresholds.participationThreshold) {
      return this.createAlert(rule, data, {
        title: `Low Participation Alert: ${data.participationRate.toFixed(1)}% participation`,
        description: `Team participation of ${data.participationRate.toFixed(1)}% is below threshold of ${rule.thresholds.participationThreshold}%`,
        currentValue: data.participationRate,
      });
    }

    // Check participation drop
    if (rule.thresholds.participationDropPercentage && data.previousParticipationRate) {
      const participationDrop = data.previousParticipationRate - data.participationRate;
      const participationDropPercentage = (participationDrop / data.previousParticipationRate) * 100;

      if (participationDropPercentage >= rule.thresholds.participationDropPercentage) {
        return this.createAlert(rule, data, {
          title: `Participation Drop Alert: ${participationDropPercentage.toFixed(1)}% drop`,
          description: `Team participation dropped ${participationDropPercentage.toFixed(1)}% from ${data.previousParticipationRate.toFixed(1)}% to ${data.participationRate.toFixed(1)}%`,
          currentValue: data.participationRate,
          previousValue: data.previousParticipationRate,
        });
      }
    }

    return null;
  }

  private checkSentimentSpike(rule: AlertRule, data: SurveyData): Alert | null {
    if (rule.thresholds.negativeCommentsPercentage && data.negativeCommentsPercentage) {
      if (data.negativeCommentsPercentage >= rule.thresholds.negativeCommentsPercentage) {
        return this.createAlert(rule, data, {
          title: `Negative Sentiment Spike: ${data.negativeCommentsPercentage.toFixed(1)}% negative comments`,
          description: `${data.negativeCommentsPercentage.toFixed(1)}% of comments flagged as negative, above threshold of ${rule.thresholds.negativeCommentsPercentage}%`,
          currentValue: data.negativeCommentsPercentage,
        });
      }
    }

    return null;
  }

  private checkFlaggedComments(rule: AlertRule, data: SurveyData): Alert | null {
    if (data.hasFlaggedComments) {
      return this.createAlert(rule, data, {
        title: 'Flagged Comments Detected',
        description: 'Urgent flagged comments detected (harassment, burnout, etc.) requiring immediate attention',
        currentValue: 1, // Binary flag
      });
    }

    return null;
  }

  private checkRecurringRisk(rule: AlertRule, data: SurveyData): Alert | null {
    // Check consecutive low months
    if (rule.thresholds.consecutiveMonths && data.consecutiveLowMonths) {
      if (data.consecutiveLowMonths >= rule.thresholds.consecutiveMonths) {
        const threshold = rule.thresholds.criticalScore || 6.0;
        return this.createAlert(rule, data, {
          title: `Recurring Risk: ${data.consecutiveLowMonths} consecutive months below ${threshold}`,
          description: `${data.driverId || 'Driver'} has been below ${threshold} for ${data.consecutiveLowMonths} consecutive months`,
          currentValue: data.consecutiveLowMonths,
        });
      }
    }

    // Check unacknowledged alerts
    if (rule.thresholds.consecutiveMonths && data.unacknowledgedAlerts) {
      if (data.unacknowledgedAlerts >= rule.thresholds.consecutiveMonths) {
        return this.createAlert(rule, data, {
          title: `Unacknowledged Alerts: ${data.unacknowledgedAlerts} alerts pending`,
          description: `${data.unacknowledgedAlerts} alerts have been acknowledged but no improvement shown`,
          currentValue: data.unacknowledgedAlerts,
        });
      }
    }

    return null;
  }

  private createAlert(rule: AlertRule, data: SurveyData, alertData: {
    title: string;
    description: string;
    currentValue: number;
    previousValue?: number;
  }): Alert {
    return {
      id: `${rule.id}_${data.teamId}_${Date.now()}`,
      ruleId: rule.id,
      type: rule.type,
      severity: rule.severity,
      title: alertData.title,
      description: alertData.description,
      teamId: data.teamId,
      driverId: data.driverId,
      currentValue: alertData.currentValue,
      previousValue: alertData.previousValue,
      timestamp: new Date(),
      acknowledged: false,
    };
  }
}
