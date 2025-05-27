import { API_BASE_URL, handleResponse } from '../api';
import type { Metric, ChartData, TeamMember, Alert } from '../api';

// Fetch all metrics
export async function fetchMetrics(): Promise<Metric[]> {
  const response = await fetch(`${API_BASE_URL}/metrics`);
  return handleResponse<Metric[]>(response);
}

// Fetch engagement chart data
export async function fetchEngagementData(): Promise<ChartData> {
  const response = await fetch(`${API_BASE_URL}/charts/engagement`);
  return handleResponse<ChartData>(response);
}

// Fetch survey participation data
export async function fetchSurveyParticipationData(): Promise<ChartData> {
  const response = await fetch(`${API_BASE_URL}/charts/survey-participation`);
  return handleResponse<ChartData>(response);
}

// Fetch team performance data
export async function fetchTeamPerformance(): Promise<TeamMember[]> {
  const response = await fetch(`${API_BASE_URL}/team/performance`);
  return handleResponse<TeamMember[]>(response);
}

// Fetch active alerts
export async function fetchAlerts(): Promise<Alert[]> {
  const response = await fetch(`${API_BASE_URL}/alerts`);
  return handleResponse<Alert[]>(response);
}

// Update alert status
export async function updateAlertStatus(alertId: string, status: 'active' | 'resolved'): Promise<Alert> {
  const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Alert>(response);
} 