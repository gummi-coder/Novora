import React, { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { WidgetConfig } from '../../types/dashboard';

interface WidgetToolbarProps {
  onWidgetAdd: (widget: WidgetConfig) => void;
}

export const WidgetToolbar: React.FC<WidgetToolbarProps> = ({ onWidgetAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentDashboard } = useDashboard();

  const handleAddWidget = (type: string) => {
    if (!currentDashboard) return;

    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
      config: getDefaultConfig(type),
      position: {
        x: 0,
        y: 0,
        w: 4,
        h: 4,
      },
    };

    onWidgetAdd(newWidget);
    setIsOpen(false);
  };

  const getDefaultConfig = (type: string): WidgetConfig['config'] => {
    switch (type) {
      case 'chart':
        return {
          chartType: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Dataset 1',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#4F46E5',
                backgroundColor: '#4F46E5',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        };
      // Add more widget types here
      default:
        return {};
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          className="-ml-1 mr-2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add Widget
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <button
              onClick={() => handleAddWidget('chart')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Chart
            </button>
            {/* Add more widget types here */}
          </div>
        </div>
      )}
    </div>
  );
}; 