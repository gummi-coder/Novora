import React, { useState, useCallback } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { DashboardGrid } from './DashboardGrid';
import { WidgetToolbar } from './WidgetToolbar';
import { WidgetConfigPanel } from './WidgetConfigPanel';
import { WidgetConfig } from '../../types/dashboard';
import { GrafanaAPI } from './grafana';

export const Dashboard: React.FC = () => {
  const {
    currentDashboard,
    createDashboard,
    updateDashboard,
    addWidget,
    updateWidget,
    loading,
    error,
  } = useDashboard();

  const [configuringWidget, setConfiguringWidget] = useState<WidgetConfig | null>(null);

  const handleAddWidget = useCallback(
    async (widget: WidgetConfig) => {
      if (!currentDashboard) return;
      try {
        await addWidget(widget);
      } catch (err) {
        console.error('Failed to add widget:', err);
      }
    },
    [currentDashboard, addWidget]
  );

  const handleConfigChange = useCallback(
    async (config: WidgetConfig['config']) => {
      if (!configuringWidget) return;
      try {
        await updateWidget(configuringWidget.id, { config });
      } catch (err) {
        console.error('Failed to update widget config:', err);
      }
    },
    [configuringWidget, updateWidget]
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentDashboard) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No Dashboard Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a dashboard or create a new one.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() =>
                createDashboard({
                  title: 'New Dashboard',
                  layout: {
                    widgets: [],
                    grid: {
                      cols: 12,
                      rowHeight: 100,
                    },
                  },
                })
              }
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentDashboard.title}
            </h1>
            {currentDashboard.description && (
              <p className="mt-1 text-sm text-gray-500">
                {currentDashboard.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <WidgetToolbar onWidgetAdd={handleAddWidget} />
            <button
              type="button"
              onClick={() =>
                updateDashboard(currentDashboard.id, {
                  title: 'Updated Dashboard',
                })
              }
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-4rem)] overflow-auto">
        <DashboardGrid dashboard={currentDashboard} />
      </div>

      {configuringWidget && (
        <WidgetConfigPanel
          widget={configuringWidget}
          onConfigChange={handleConfigChange}
          onClose={() => setConfiguringWidget(null)}
        />
      )}
    </div>
  );
};

export async function setupGrafanaDashboards() {
  const grafana = new GrafanaAPI(monitoringConfig.grafana);

  // System Health Dashboard
  await grafana.createDashboard({
    title: 'System Health',
    panels: [
      {
        title: 'CPU Usage',
        type: 'graph',
        targets: [
          {
            expr: 'rate(process_cpu_seconds_total[5m])',
            legendFormat: 'CPU Usage',
          },
        ],
      },
      {
        title: 'Memory Usage',
        type: 'graph',
        targets: [
          {
            expr: 'process_resident_memory_bytes',
            legendFormat: 'Memory Usage',
          },
        ],
      },
      {
        title: 'API Response Times',
        type: 'graph',
        targets: [
          {
            expr: 'rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])',
            legendFormat: '{{route}}',
          },
        ],
      },
    ],
  });

  // Business Metrics Dashboard
  await grafana.createDashboard({
    title: 'Business Metrics',
    panels: [
      {
        title: 'Active Users',
        type: 'gauge',
        targets: [
          {
            expr: 'active_users_total',
          },
        ],
      },
      {
        title: 'Error Rate',
        type: 'graph',
        targets: [
          {
            expr: 'rate(error_count_total[5m])',
            legendFormat: '{{type}}',
          },
        ],
      },
    ],
  });
} 