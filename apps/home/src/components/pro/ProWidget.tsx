import React, { useEffect, useState } from 'react';
import { Widget } from '../../types/enterprise';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ProWidgetProps {
  widget: Widget;
  onUpdate?: (widgetId: string, config: any) => void;
}

export const ProWidget: React.FC<ProWidgetProps> = ({ widget, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchWidgetData = async () => {
      setLoading(true);
      try {
        // Implement basic data fetching based on widget type
        switch (widget.type) {
          case 'CHART':
            // Fetch basic chart data
            break;
          case 'METRIC':
            // Fetch simple metric data
            break;
          case 'TABLE':
            // Fetch basic table data
            break;
          default:
            throw new Error('Unsupported widget type');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load widget data');
      } finally {
        setLoading(false);
      }
    };

    fetchWidgetData();
  }, [widget]);

  const renderWidgetContent = () => {
    if (loading) {
      return <LoadingSpinner size="small" />;
    }

    if (error) {
      return (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      );
    }

    switch (widget.type) {
      case 'CHART':
        return (
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Basic Chart Widget</p>
          </div>
        );
      case 'METRIC':
        return (
          <div className="p-4 bg-white rounded shadow">
            <h4 className="text-lg font-medium text-gray-900">
              {widget.config.metricName || 'Metric'}
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {data?.value || '0'}
            </p>
          </div>
        );
      case 'TABLE':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {widget.config.columns?.map((column: string) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.rows?.map((row: any, index: number) => (
                  <tr key={index}>
                    {widget.config.columns?.map((column: string) => (
                      <td
                        key={column}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return (
          <div className="text-gray-500">
            Unsupported widget type
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {widget.title}
        </h3>
        {onUpdate && (
          <button
            onClick={() => onUpdate(widget.id, widget.config)}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}
      </div>
      {renderWidgetContent()}
    </div>
  );
}; 