import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { enterpriseService } from '../services/enterprise';
import { Team, Dashboard, Integration } from '../types/enterprise';

export const useEnterprise = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnterpriseData = async () => {
      if (!user?.companyId) return;

      try {
        setLoading(true);
        const [teamsData, integrationsData, flagsData] = await Promise.all([
          enterpriseService.getTeams(user.companyId),
          enterpriseService.getIntegrations(user.companyId),
          enterpriseService.getFeatureFlags()
        ]);

        setTeams(teamsData);
        setIntegrations(integrationsData);
        setFeatureFlags(flagsData);
      } catch (err) {
        setError('Failed to load enterprise data');
      } finally {
        setLoading(false);
      }
    };

    fetchEnterpriseData();
  }, [user?.companyId]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Check user role
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'],
      enterprise_admin: ['manage_teams', 'manage_dashboards', 'manage_integrations'],
      team_admin: ['manage_team', 'manage_team_dashboards'],
      member: ['view_team', 'view_dashboards']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const isFeatureEnabled = (feature: string): boolean => {
    return featureFlags[feature] || false;
  };

  const getTeamDashboards = async (teamId: string) => {
    try {
      const data = await enterpriseService.getDashboards(teamId);
      setDashboards(data);
    } catch (err) {
      setError('Failed to load team dashboards');
    }
  };

  return {
    teams,
    dashboards,
    integrations,
    loading,
    error,
    hasPermission,
    isFeatureEnabled,
    getTeamDashboards
  };
}; 