import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const EmployeeSurvey: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSurvey(token);
    }
  }, [token]);

  const fetchSurvey = async (surveyToken: string) => {
    try {
      const response = await fetch(`http://localhost:8000/s/r/${surveyToken}`);
      if (!response.ok) {
        throw new Error('Survey not found or expired');
      }
      const data = await response.json();
      setSurveyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!token || !surveyData) return;

    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/s/r/${token}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Survey Not Available</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No survey data available</p>
        </div>
      </div>
    );
  }

  // Show completion message if already submitted
  if (surveyData.status === 'completed' || submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6 text-lg">
            {submitted 
              ? "Your survey response has been submitted successfully!"
              : "This survey has already been completed. Thank you for your response!"
            }
          </p>
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <span className="text-xl">🛡️</span>
              <span className="font-medium">Your response is anonymous and secure</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show active survey with emoji rating system
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {surveyData.title}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{surveyData.description}</p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Anonymous & Secure</h3>
              <p className="text-gray-600 text-sm">
                {surveyData.message}
              </p>
            </div>
          </div>
        </div>

        {/* Survey Questions */}
        <div className="space-y-8">
          {surveyData.questions?.map((question: any, index: number) => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {question.text}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
              </div>

              {question.type === 'rating' && question.options && (
                <div className="flex justify-center items-center space-x-4 flex-wrap gap-4">
                  {question.options.map((option: string, optionIndex: number) => {
                    // Map rating options to emojis
                    const emojiMap: { [key: string]: string } = {
                      'Very dissatisfied': '😞',
                      'Dissatisfied': '😕', 
                      'Neutral': '😐',
                      'Satisfied': '🙂',
                      'Very satisfied': '😊',
                      'Very unlikely': '😞',
                      'Unlikely': '😕',
                      'Likely': '🙂',
                      'Very likely': '😊'
                    };
                    
                    const emoji = emojiMap[option] || '😐';
                    
                    return (
                      <label 
                        key={optionIndex} 
                        className="flex flex-col items-center cursor-pointer group p-4 rounded-xl border-2 border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          className="sr-only"
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        />
                        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-200">
                          {emoji}
                        </div>
                        <span className="text-sm font-medium text-gray-700 text-center max-w-24">
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.type === 'text' && (
                <div className="max-w-2xl mx-auto">
                  <textarea
                    placeholder="Share your thoughts... (Optional)"
                    className="w-full min-h-[120px] border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none"
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-12 text-center">
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              <>Submit Survey 🚀</>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Powered by Novora • Your responses are completely anonymous
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSurvey;
