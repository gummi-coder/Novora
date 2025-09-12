import React from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartWidgetProps {
  config: {
    chartType: 'line' | 'bar' | 'pie' | 'doughnut';
    data: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
      }[];
    };
    options?: {
      responsive?: boolean;
      maintainAspectRatio?: boolean;
      plugins?: {
        title?: {
          display?: boolean;
          text?: string;
        };
        legend?: {
          display?: boolean;
          position?: 'top' | 'bottom' | 'left' | 'right';
        };
      };
    };
  };
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ config }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const chartOptions = {
    ...defaultOptions,
    ...config.options,
  };

  const renderChart = () => {
    switch (config.chartType) {
      case 'line':
        return <Line data={config.data} options={chartOptions} />;
      case 'bar':
        return <Bar data={config.data} options={chartOptions} />;
      case 'pie':
        return <Pie data={config.data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={config.data} options={chartOptions} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full">
      {renderChart()}
    </div>
  );
}; 