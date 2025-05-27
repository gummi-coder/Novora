import React from 'react';

interface FinalPageProps {
  onRestart: () => void;
  onExit: () => void;
}

export const FinalPage: React.FC<FinalPageProps> = ({ onRestart, onExit }) => {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="mb-8">
        <svg
          className="mx-auto h-16 w-16 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Thank You for Completing the Survey!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Your responses have been recorded. We appreciate your time and feedback.
      </p>
      <div className="space-x-4">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start New Survey
        </button>
        <button
          onClick={onExit}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Exit
        </button>
      </div>
    </div>
  );
}; 