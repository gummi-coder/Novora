import React, { useState } from 'react';
import { useCore } from '../../hooks/useCore';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { SkeletonLoader } from '../shared/SkeletonLoader';
import { ProWidget } from '../pro/ProWidget';
import { Widget } from '../../types/enterprise';

export const CoreDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    dashboard,
    widgets,
    stats,
    usageLimits,
    loading,
    error,
    addWidget,
    updateWidget,
    deleteWidget
  } = useCore();

  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleAddWidget = () => {
    if (usageLimits.widgetCount >= usageLimits.maxWidgets) {
      setShowUpgradeModal(true);
      return;
    }
    setShowAddWidgetModal(true);
  };

  if (loading) {
    return <SkeletonLoader type="card" count={3} />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Usage Stats Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Core Plan Usage: {usageLimits.widgetCount}/{usageLimits.maxWidgets} Widgets
            </p>
          </div>
        </div>
      </div>

      {/* Basic Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Views</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Last Active</h3>
          <p className="text-2xl font-bold text-blue-600">
            {new Date(stats.lastActive).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Widgets</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.widgetCount}</p>
        </div>
      </div>

      {/* Widgets Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Your Dashboard</h2>
          <button
            onClick={handleAddWidget}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Widget
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <ProWidget
              key={widget.id}
              widget={widget}
              onUpdate={(widgetId, config) => updateWidget(widgetId, { config })}
            />
          ))}
        </div>
      </div>

      {/* Add Widget Modal */}
      {showAddWidgetModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Widget</h3>
            <div className="space-y-4">
              <button
                onClick={() => {
                  addWidget({ type: 'METRIC', title: 'New Metric' });
                  setShowAddWidgetModal(false);
                }}
                className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-left hover:bg-gray-50"
              >
                Metric Widget
              </button>
              <button
                onClick={() => {
                  addWidget({ type: 'TABLE', title: 'New Table' });
                  setShowAddWidgetModal(false);
                }}
                className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-left hover:bg-gray-50"
              >
                Table Widget
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAddWidgetModal(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upgrade to Pro</h3>
            <p className="text-sm text-gray-500 mb-4">
              You've reached the widget limit for your Core plan. Upgrade to Pro for more widgets
              and advanced features.
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