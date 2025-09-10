import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import MVPSurvey from '../components/MVPSurvey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CheckCircle, Globe } from 'lucide-react';

interface SurveyResponses {
  mood: number;
  secondary: number;
  improvement: string;
}

const MVPSurveyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);

  // Determine current week based on survey token
  useEffect(() => {
    if (token) {
      // Parse token to get survey ID: format is userId_surveyId_randomString
      const tokenParts = token.split('_');
      if (tokenParts.length >= 2) {
        const surveyId = parseInt(tokenParts[1]);
        // Map survey ID to week: 1=Week1, 2=Week2, 3=Week4
        switch (surveyId) {
          case 1:
            setCurrentWeek(1); // Week 1: Mood + Manager Support + Improvement
            break;
          case 2:
            setCurrentWeek(2); // Week 2: Mood + Workload + Balanced
            break;
          case 3:
            setCurrentWeek(4); // Week 4: Mood + Recognition + Keep/Change
            break;
          default:
            setCurrentWeek(1); // Default to Week 1
        }
      } else {
        // Fallback for demo tokens or invalid format
        setCurrentWeek(1);
      }
    } else {
      // No token, default to Week 1
      setCurrentWeek(1);
    }
  }, [token]);

  const handleSubmit = async (responses: SurveyResponses) => {
    try {
      // TODO: Submit to backend API
      console.log('Survey responses:', responses);
      
      // For now, just mark as submitted
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting survey:', error);
      
      // Handle submission limit error
      if (error?.response?.status === 429) {
        alert('Survey is closed. Maximum submissions reached for your company size.');
        return;
      }
      
      // Handle other errors
      alert('Error submitting survey. Please try again.');
    }
  };

  const handleStartSurvey = () => {
    setShowWelcome(false);
  };

  const handleBackToWelcome = () => {
    setShowWelcome(true);
  };

  // Welcome Screen
  if (showWelcome) {
    return (
      <div className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-col min-h-screen">
        {/* Progress indicator placeholder */}
        <div className="flex items-center justify-center gap-1 mb-4 sm:mb-6">
          <div className="h-2 w-6 sm:w-8 rounded-full bg-blue-600"></div>
          <div className="h-2 w-6 sm:w-8 rounded-full bg-gray-300"></div>
          <div className="h-2 w-6 sm:w-8 rounded-full bg-gray-300"></div>
        </div>

        {/* Welcome Card */}
        <Card className="shadow-lg border-0 mb-4 sm:mb-6 flex-1">
          <CardContent className="p-4 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                {t('mvp.survey.title')}
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                {currentWeek === 1 && "Week 1: Mood + Manager Support + Improvement"}
                {currentWeek === 2 && "Week 2: Mood + Workload + Balanced"}
                {currentWeek === 4 && "Week 4: Mood + Recognition + Keep/Change"}
              </p>
            </div>

            {/* Language Selection */}
            <div className="mb-6 sm:mb-8">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full h-10 sm:h-12 text-sm sm:text-base">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>🇬🇧</span>
                      <span>English</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="es">
                    <div className="flex items-center gap-2">
                      <span>🇪🇸</span>
                      <span>Español</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="is">
                    <div className="flex items-center gap-2">
                      <span>🇮🇸</span>
                      <span>Íslenska</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8">
              <p className="text-xs sm:text-sm text-blue-800">
                {t('mvp.survey.anonymous')}. Results shown when enough people participate.
              </p>
            </div>

            {/* Start Button */}
            <Button 
              onClick={handleStartSurvey}
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('mvp.survey.button.start')}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-500">
          <p>Step 1 of 3</p>
          <p className="mt-1">{t('mvp.survey.anonymous')}</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">{t('mvp.survey.thankyou.title')}</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {t('mvp.survey.thankyou.message')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-4 sm:p-6">
            {/* No return button - user stays on thank you page */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            {t('mvp.survey.title')}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Week {currentWeek} • {t('mvp.survey.anonymous')} • Takes 2 minutes
          </p>
        </div>
        
        <MVPSurvey 
          week={currentWeek}
          onSubmit={handleSubmit}
          onBackToWelcome={handleBackToWelcome}
        />
        
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
          <p>{t('mvp.survey.anonymous')} and will only be shown when enough team members participate.</p>
        </div>
      </div>
    </div>
  );
};

export default MVPSurveyPage;
