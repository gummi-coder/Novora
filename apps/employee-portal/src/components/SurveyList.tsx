import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

interface Survey {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
}

export const SurveyList: React.FC = () => {
  const { loading, error, fetchSurveys } = useApi();
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    const loadSurveys = async () => {
      const data = await fetchSurveys();
      if (data) {
        setSurveys(data);
      }
    };
    loadSurveys();
  }, [fetchSurveys]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <div
          key={survey.id}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {survey.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{survey.description}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                survey.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : survey.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
            </span>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Created: {new Date(survey.createdAt).toLocaleDateString()}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => window.location.href = `/surveys/${survey.id}`}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View
              </button>
              <button
                onClick={() => window.location.href = `/surveys/${survey.id}/edit`}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
      {surveys.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No surveys found. Create your first survey to get started.
        </div>
      )}
    </div>
  );
}; 