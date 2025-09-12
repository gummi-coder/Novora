import { useQuery } from '@tanstack/react-query';
import { fetchEngagementData, fetchSurveyParticipationData } from '@/lib/services/dashboard';
import type { ChartData } from '@/lib/api';

export function useEngagementData() {
  return useQuery<ChartData>({
    queryKey: ['charts', 'engagement'],
    queryFn: fetchEngagementData,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useSurveyParticipationData() {
  return useQuery<ChartData>({
    queryKey: ['charts', 'survey-participation'],
    queryFn: fetchSurveyParticipationData,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
} 