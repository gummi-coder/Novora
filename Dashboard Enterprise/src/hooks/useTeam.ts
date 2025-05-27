import { useState, useEffect } from 'react';
import { dashboardService, TeamMember } from '../lib/services/dashboard';

export const useTeam = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getTeamMembers();
      setTeamMembers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch team members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return { teamMembers, loading, error, refetch: fetchTeamMembers };
}; 