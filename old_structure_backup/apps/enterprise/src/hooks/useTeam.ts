import { useQuery } from '@tanstack/react-query';
import { fetchTeamPerformance } from '@/lib/services/dashboard';
import type { TeamMember } from '@/lib/api';

export function useTeamPerformance() {
  return useQuery<TeamMember[]>({
    queryKey: ['team', 'performance'],
    queryFn: fetchTeamPerformance,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useTeamMember(id: string) {
  const { data: teamMembers, ...rest } = useTeamPerformance();
  const member = teamMembers?.find(m => m.id === id);
  
  return {
    data: member,
    ...rest,
  };
} 