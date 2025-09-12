import React, { useEffect, useState } from 'react';
import { useAuthProtection } from '../middleware/frontend-security';
import { DashboardSurveyWidget, SurveyAnalytics } from '../types/survey';
import { secureApiRequest } from '../middleware/frontend-security';
import { LineChart, BarChart, PieChart, Table } from './charts';

interface SurveyWidgetProps {
  widget: DashboardSurveyWidget;
  onError?: (error: Error) => void;
}

export const SurveyWidget: React.FC<SurveyWidgetProps> = ({ widget, onError }) => {
  const { isAuthenticated } = useAuthProtection();
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await secureApiRequest<SurveyAnalytics>(`/api/survey/analytics/${widget.surveyId}`);
        setAnalytics(data);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch survey analytics');
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    if (widget.config.refreshInterval) {
      const interval = setInterval(fetchAnalytics, widget.config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [widget.surveyId, widget.config.refreshInterval, onError]);

  if (!isAuthenticated) {
    return <div>Please log in to view survey data</div>;
  }

  if (loading) {
    return <div>Loading survey data...</div>;
  }

  if (error) {
    return <div>Error loading survey data: {error.message}</div>;
  }

  if (!analytics) {
    return <div>No survey data available</div>;
  }

  const renderVisualization = () => {
    switch (widget.type) {
      case 'response_rate':
        return (
          <div>
            <h3>Response Rate</h3>
            <div>{(analytics.responseRate * 100).toFixed(1)}%</div>
          </div>
        );

      case 'sentiment_analysis':
        return (
          <div>
            <h3>Sentiment Analysis</h3>
            <PieChart
              data={Object.entries(analytics.questionAnalytics[0]?.sentiment || {}).map(([key, value]) => ({
                label: key,
                value: value * 100,
              }))}
            />
          </div>
        );

      case 'question_breakdown':
        return (
          <div>
            <h3>Question Breakdown</h3>
            <BarChart
              data={analytics.questionAnalytics.map(qa => ({
                label: qa.questionId,
                value: qa.averageRating || 0,
              }))}
            />
          </div>
        );

      case 'trend_analysis':
        return (
          <div>
            <h3>Trend Analysis</h3>
            <LineChart
              data={analytics.trends.map(trend => ({
                label: new Date(trend.timestamp).toLocaleDateString(),
                value: Object.values(trend.metrics)[0] || 0,
              }))}
            />
          </div>
        );

      default:
        return <div>Unsupported widget type</div>;
    }
  };

  return (
    <div className="survey-widget">
      <div className="widget-header">
        <h2>Survey Analytics</h2>
        {widget.config.timeRange && (
          <div className="time-range">
            {new Date(widget.config.timeRange.start).toLocaleDateString()} -{' '}
            {new Date(widget.config.timeRange.end).toLocaleDateString()}
          </div>
        )}
      </div>
      <div className="widget-content">
        {renderVisualization()}
      </div>
      <div className="widget-footer">
        <div>Last updated: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

// Example usage in a dashboard:
/*
import { SurveyWidget } from './components/SurveyWidget';

function Dashboard() {
  const widget: DashboardSurveyWidget = {
    id: '123',
    type: 'response_rate',
    surveyId: '456',
    config: {
      refreshInterval: 300000, // 5 minutes
      visualization: 'bar',
      timeRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      },
    },
  };

  return (
    <div className="dashboard">
      <SurveyWidget
        widget={widget}
        onError={(error) => console.error('Widget error:', error)}
      />
    </div>
  );
}
*/ 