import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { surveyService } from '../../services/survey';
import { SurveyAnalytics as SurveyAnalyticsType } from '../../types/survey';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { SkeletonLoader } from '../shared/SkeletonLoader';

export const SurveyAnalytics: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [analytics, setAnalytics] = useState<SurveyAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (surveyId) {
          const data = await surveyService.getSurveyAnalytics(surveyId);
          setAnalytics(data);
        }
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [surveyId]);

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      if (surveyId) {
        const blob = await surveyService.exportSurveyData(surveyId, format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survey-analytics.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Failed to export data');
    }
  };

  if (loading) {
    return <SkeletonLoader type="card" count={2} />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Survey Analytics</h1>
        <div className="space-x-4">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export PDF
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Responses</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.responseCount}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-green-600">
            {(analytics.completionRate * 100).toFixed(1)}%
          </p>
        </div>

        {analytics.averageRating && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Average Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {analytics.averageRating.toFixed(1)}/5
            </p>
          </div>
        )}

        {analytics.sentimentScore && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sentiment Score</h3>
            <p className="text-3xl font-bold text-purple-600">
              {(analytics.sentimentScore * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Additional analytics visualizations can be added here */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Response Trends</h3>
          {/* Add response trends chart here */}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Question Analysis</h3>
          {/* Add question analysis chart here */}
        </div>
      </div>
    </div>
  );
}; 