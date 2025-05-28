import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive';
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export const useTeam = (teamId?: string) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await api.get(teamId ? `/teams/${teamId}` : '/teams/current');
      setTeam(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch team data');
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const addMember = async (memberData: Omit<TeamMember, 'id'>) => {
    try {
      const response = await api.post(`/teams/${teamId}/members`, memberData);
      setTeam(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to add team member');
      console.error('Error adding team member:', err);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
      setTeam(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to remove team member');
      console.error('Error removing team member:', err);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await api.patch(`/teams/${teamId}/members/${memberId}`, { role: newRole });
      setTeam(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to update team member role');
      console.error('Error updating team member role:', err);
    }
  };

  return {
    team,
    loading,
    error,
    refetch: fetchTeam,
    addMember,
    removeMember,
    updateMemberRole,
  };
}; 