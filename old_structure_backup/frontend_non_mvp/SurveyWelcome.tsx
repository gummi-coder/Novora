import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';

const SurveyWelcome = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'is', name: 'Íslenska', flag: '🇮🇸' }
  ];

  const handleStartSurvey = () => {
    // Navigate to the survey preview with the selected language
    navigate('/survey/preview', { 
      state: { 
        language: selectedLanguage,
        isPreview: true // Always start in preview mode
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Welcome</span>
            <span>0%</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Novora
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Employee Survey
          </h2>
          <p className="text-gray-600 text-lg">
            Help us improve your workplace experience
          </p>
        </div>

        {/* Language Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Select Language
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`p-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  selectedLanguage === lang.code
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-2xl">{lang.flag}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Time Info */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">🔒</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Anonymous</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">⏱️</span>
              </div>
              <span className="text-sm font-medium text-gray-700">40 seconds</span>
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm">
            Your responses are completely anonymous and cannot be traced back to you.
          </p>
        </div>

        {/* Preview Notice */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👁️</span>
              </div>
              <span className="text-sm font-medium text-blue-800">Preview Mode</span>
            </div>
            <p className="text-xs text-blue-700 text-center">
              This is exactly how employees will see the survey. You can test the complete experience.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={handleStartSurvey}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            size="lg"
          >
            Start Survey Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SurveyWelcome;
