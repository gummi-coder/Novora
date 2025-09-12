import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAlerts, updateAlertStatus } from '@/lib/services/dashboard';
import type { Alert } from '@/lib/api';

export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ alertId, status }: { alertId: string; status: 'active' | 'resolved' }) =>
      updateAlertStatus(alertId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useAlert(id: string) {
  const { data: alerts, ...rest } = useAlerts();
  const alert = alerts?.find(a => a.id === id);
  
  return {
    data: alert,
    ...rest,
  };
} 