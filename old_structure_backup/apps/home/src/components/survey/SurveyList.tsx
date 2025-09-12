import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { surveyService } from '../../services/survey';
import { Survey } from '../../types/survey';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { SkeletonLoader } from '../shared/SkeletonLoader';

export const SurveyList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        if (user?.companyId) {
          const data = await surveyService.getSurveys(user.companyId);
          setSurveys(data);
        }
      } catch (err) {
        setError('Failed to load surveys');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [user?.companyId]);

  const handleCreateSurvey = () => {
    navigate('/surveys/create');
  };

  const handleViewSurvey = (id: string) => {
    navigate(`/surveys/${id}`);
  };

  if (loading) {
    return <SkeletonLoader type="card" count={3} />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
        <button
          onClick={handleCreateSurvey}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Survey
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <div
            key={survey.id}
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewSurvey(survey.id)}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">{survey.title}</h3>
            <p className="text-gray-500 mb-4">{survey.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span className={`px-2 py-1 rounded-full ${
                survey.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                survey.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {survey.status}
              </span>
              <span>
                {survey.responses?.length || 0} responses
              </span>
            </div>
          </div>
        ))}
      </div>

      {surveys.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys yet</h3>
          <p className="text-gray-500 mb-4">Create your first survey to get started</p>
          <button
            onClick={handleCreateSurvey}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Survey
          </button>
        </div>
      )}
    </div>
  );
}; 