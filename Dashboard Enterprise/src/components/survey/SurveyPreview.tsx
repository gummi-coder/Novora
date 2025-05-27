import React from 'react';
import { Survey } from './Survey';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating';
  options?: string[];
}

interface SurveyPreviewProps {
  title: string;
  description: string;
  questions: Question[];
  onClose: () => void;
}

export const SurveyPreview: React.FC<SurveyPreviewProps> = ({
  title,
  description,
  questions,
  onClose,
}) => {
  const handleComplete = (answers: Record<string, string>) => {
    console.log('Survey answers:', answers);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Survey Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <Survey
          title={title}
          description={description}
          questions={questions}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}; 