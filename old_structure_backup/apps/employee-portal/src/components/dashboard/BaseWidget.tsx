import React, { useState, useCallback } from 'react';
import { WidgetConfig } from '../../types/dashboard';
import { useDashboard } from '../../contexts/DashboardContext';

interface BaseWidgetProps {
  widget: WidgetConfig;
  onConfigChange?: (config: WidgetConfig['config']) => void;
  onRemove?: () => void;
  children: React.ReactNode;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  widget,
  onConfigChange,
  onRemove,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { updateWidget, removeWidget } = useDashboard();

  const handleConfigChange = useCallback(
    async (newConfig: WidgetConfig['config']) => {
      if (onConfigChange) {
        onConfigChange(newConfig);
      }
      try {
        await updateWidget(widget.id, { config: newConfig });
      } catch (error) {
        console.error('Failed to update widget config:', error);
      }
    },
    [widget.id, onConfigChange, updateWidget]
  );

  const handleRemove = useCallback(async () => {
    if (onRemove) {
      onRemove();
    }
    try {
      await removeWidget(widget.id);
    } catch (error) {
      console.error('Failed to remove widget:', error);
    }
  }, [widget.id, onRemove, removeWidget]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className={`relative rounded-lg border bg-white shadow-sm transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${isEditing ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        gridColumn: `span ${widget.position.w}`,
        gridRow: `span ${widget.position.h}`,
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <span className="sr-only">Edit widget</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
          >
            <span className="sr-only">Remove widget</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="widget-title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="widget-title"
                value={widget.title}
                onChange={(e) =>
                  updateWidget(widget.id, { title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            {children}
          </div>
        ) : (
          <div className="h-full">{children}</div>
        )}
      </div>
    </div>
  );
}; 