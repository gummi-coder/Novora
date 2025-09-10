import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { proService } from '../services/pro';
import { Team, Dashboard } from '../types/enterprise';

export const usePro = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [usageLimits, setUsageLimits] = useState({
    teamCount: 0,
    dashboardCount: 0,
    memberCount: 0,
    widgetCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProData = async () => {
      if (!user?.companyId) return;

      try {
        setLoading(true);
        const [teamsData, limitsData] = await Promise.all([
          proService.getTeams(user.companyId),
          proService.getUsageLimits(user.companyId)
        ]);

        setTeams(teamsData);
        setUsageLimits(limitsData);
      } catch (err) {
        setError('Failed to load Pro data');
      } finally {
        setLoading(false);
      }
    };

    fetchProData();
  }, [user?.companyId]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Pro-specific role permissions
    const rolePermissions: Record<string, string[]> = {
      pro_admin: ['manage_teams', 'manage_dashboards', 'manage_members'],
      team_admin: ['manage_team', 'manage_team_dashboards'],
      member: ['view_team', 'view_dashboards']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const checkUsageLimit = (type: 'team' | 'dashboard' | 'member' | 'widget'): boolean => {
    const limits = {
      team: 3,
      dashboard: 5,
      member: 10,
      widget: 20
    };

    const currentUsage = {
      team: usageLimits.teamCount,
      dashboard: usageLimits.dashboardCount,
      member: usageLimits.memberCount,
      widget: usageLimits.widgetCount
    };

    return currentUsage[type] < limits[type];
  };

  const getTeamDashboards = async (teamId: string) => {
    try {
      const data = await proService.getDashboards(teamId);
      setDashboards(data);
    } catch (err) {
      setError('Failed to load team dashboards');
    }
  };

  return {
    teams,
    dashboards,
    loading,
    error,
    hasPermission,
    checkUsageLimit,
    getTeamDashboards,
    usageLimits
  };
}; 