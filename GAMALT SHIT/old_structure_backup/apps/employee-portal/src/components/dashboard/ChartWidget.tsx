import React from 'react';
import { BaseWidget } from './BaseWidget';
import { WidgetConfig } from '../../types/dashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface ChartWidgetConfig extends WidgetConfig {
  config: {
    chartType: 'line' | 'bar' | 'pie';
    data: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        borderColor?: string;
        backgroundColor?: string;
      }[];
    };
    options?: {
      responsive?: boolean;
      maintainAspectRatio?: boolean;
    };
  };
}

interface ChartWidgetProps {
  widget: ChartWidgetConfig;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: widget.title,
      },
    },
  };

  const chartOptions = {
    ...defaultOptions,
    ...widget.config.options,
  };

  return (
    <BaseWidget widget={widget}>
      <div className="h-64">
        <Line data={widget.config.data} options={chartOptions} />
      </div>
    </BaseWidget>
  );
}; 