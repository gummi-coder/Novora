import React from 'react';

interface WelcomePageProps {
  onStart: () => void;
  title: string;
  description: string;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStart,
  title,
  description,
}) => {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-lg text-gray-600 mb-8">{description}</p>
      <button
        onClick={onStart}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Start Survey
      </button>
    </div>
  );
}; 