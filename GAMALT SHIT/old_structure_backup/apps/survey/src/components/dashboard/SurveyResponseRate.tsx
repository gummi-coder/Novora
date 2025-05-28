import React from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const ChartTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.primary};
`;

interface ResponseRateData {
  surveyId: string;
  surveyName: string;
  responseRate: number;
  totalResponses: number;
  targetResponses: number;
}

interface SurveyResponseRateProps {
  data: ResponseRateData[];
}

export const SurveyResponseRate: React.FC<SurveyResponseRateProps> = ({ data }) => {
  const chartData: ChartData<'bar'> = {
    labels: data.map(item => item.surveyName),
    datasets: [
      {
        label: 'Response Rate',
        data: data.map(item => item.responseRate),
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: '#4CAF50',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const item = data[index];
            return [
              `Response Rate: ${item.responseRate}%`,
              `Total Responses: ${item.totalResponses}`,
              `Target Responses: ${item.targetResponses}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Response Rate (%)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <ChartContainer>
      <ChartTitle>Survey Response Rates</ChartTitle>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </ChartContainer>
  );
}; 