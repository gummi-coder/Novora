import React, { useEffect, useState } from 'react';
import { usePro } from '../../hooks/usePro';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { SkeletonLoader } from '../shared/SkeletonLoader';
import { Team, Dashboard } from '../../types/enterprise';

export const ProDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    teams,
    dashboards,
    loading,
    error,
    hasPermission,
    checkUsageLimit,
    usageLimits
  } = usePro();

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]);
    }
  }, [teams, selectedTeam]);

  const handleCreateTeam = () => {
    if (!checkUsageLimit('team')) {
      setShowUpgradeModal(true);
      return;
    }
    // Implement team creation
  };

  const handleCreateDashboard = () => {
    if (!selectedTeam) return;
    if (!checkUsageLimit('dashboard')) {
      setShowUpgradeModal(true);
      return;
    }
    // Implement dashboard creation
  };

  if (loading) {
    return <SkeletonLoader type="card" count={3} />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Usage Limits Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Pro Plan Usage: {usageLimits.teamCount}/3 Teams, {usageLimits.dashboardCount}/5 Dashboards
            </p>
          </div>
        </div>
      </div>

      {/* Team Selection */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Teams</h2>
          {hasPermission('manage_teams') && (
            <button
              onClick={handleCreateTeam}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Team
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`bg-white shadow rounded-lg p-6 cursor-pointer ${
                selectedTeam?.id === team.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedTeam(team)}
            >
              <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-500">{team.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                {team.members?.length || 0} members
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Dashboards */}
      {selectedTeam && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Dashboards</h2>
            {hasPermission('manage_dashboards') && (
              <button
                onClick={handleCreateDashboard}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Dashboard
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="bg-white shadow rounded-lg p-6"
              >
                <h3 className="text-lg font-medium text-gray-900">{dashboard.name}</h3>
                <p className="text-sm text-gray-500">{dashboard.description}</p>
                <div className="mt-4 text-sm text-gray-500">
                  {dashboard.widgets?.length || 0} widgets
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upgrade to Enterprise</h3>
            <p className="text-sm text-gray-500 mb-4">
              You've reached the limit for your Pro plan. Upgrade to Enterprise for unlimited teams,
              dashboards, and advanced features.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 