import React from 'react';
import { Metric } from '../../lib/services/dashboard';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
  metric: Metric;
  isLoading?: boolean;
  error?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  metric, 
  isLoading = false, 
  error 
}) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getChangeColor = () => {
    if (metric.trend === 'up') return 'text-green-500';
    if (metric.trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <div className="flex items-center text-red-600">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 group relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
          <div className="ml-2 group-hover:opacity-100 opacity-0 transition-opacity">
            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
              {metric.description || `Shows ${metric.name.toLowerCase()} with ${metric.change}% change from last period`}
            </div>
            <InformationCircleIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {getTrendIcon()}
      </div>
      <div className="mt-2">
        <p className="text-3xl font-semibold text-gray-900">{metric.value}</p>
        <p className={`mt-2 text-sm ${getChangeColor()}`}>
          {metric.change > 0 ? '+' : ''}{metric.change}% from last period
        </p>
      </div>
    </div>
  );
}; 