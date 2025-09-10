import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MVPSurveyProps {
  week: number; // 1, 2, or 4 for rotation schedule
  onSubmit: (responses: SurveyResponses) => void;
  onBackToWelcome?: () => void;
}

interface SurveyResponses {
  mood: number;
  secondary: number;
  improvement: string;
}

interface Question {
  id: string;
  text: string;
  type: 'rating' | 'text';
}

const MVPSurvey: React.FC<MVPSurveyProps> = ({ week, onSubmit, onBackToWelcome }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<SurveyResponses>({
    mood: 5,
    secondary: 5,
    improvement: ''
  });

  // Photo mapping for smiley faces
  const photoOptions = [
    { number: 0, photoName: "111111", emotion: "Extremely Sad", description: "Very Dissatisfied" },
    { number: 1, photoName: "1010", emotion: "Sad", description: "Dissatisfied" },
    { number: 2, photoName: "999", emotion: "Unhappy", description: "Somewhat Dissatisfied" },
    { number: 3, photoName: "888", emotion: "Neutral", description: "Neutral" },
    { number: 4, photoName: "777", emotion: "Slightly Happy", description: "Somewhat Satisfied" },
    { number: 5, photoName: "666", emotion: "Happy", description: "Satisfied" },
    { number: 6, photoName: "555", emotion: "Very Happy", description: "Very Satisfied" },
    { number: 7, photoName: "444", emotion: "Extremely Happy", description: "Extremely Satisfied" },
    { number: 8, photoName: "333", emotion: "Ecstatic", description: "Outstanding" },
    { number: 9, photoName: "222", emotion: "Overjoyed", description: "Exceptional" },
    { number: 10, photoName: "111", emotion: "Perfect", description: "Perfect" }
  ];

  const getQuestions = (): Question[] => {
    const secondaryQuestion = (() => {
      switch (week) {
        case 1:
          return t('mvp.survey.manager.question');
        case 2:
          return t('mvp.survey.workload.question');
        case 4:
          return t('mvp.survey.recognition.question');
        default:
          return t('mvp.survey.manager.question');
      }
    })();

    const improvementQuestion = (() => {
      switch (week) {
        case 1:
          return t('mvp.survey.improvement.w1.question');
        case 2:
          return t('mvp.survey.balanced.w2.question');
        case 4:
          return t('mvp.survey.keepchange.w4.question');
        default:
          return t('mvp.survey.improvement.w1.question');
      }
    })();

    return [
      { id: 'mood', text: t('mvp.survey.mood.question'), type: 'rating' },
      { id: 'secondary', text: secondaryQuestion, type: 'rating' },
      { id: 'improvement', text: improvementQuestion, type: 'text' }
    ];
  };

  const questions = getQuestions();
  const currentQuestion = questions[currentStep];

  const handleAnswer = (value: number | string) => {
    const newResponses = { ...responses };
    
    if (currentQuestion.id === 'mood') {
      newResponses.mood = value as number;
    } else if (currentQuestion.id === 'secondary') {
      newResponses.secondary = value as number;
    } else if (currentQuestion.id === 'improvement') {
      newResponses.improvement = value as string;
    }
    
    setResponses(newResponses);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(newResponses);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (onBackToWelcome) {
      onBackToWelcome();
    }
  };

  const isCurrentQuestionAnswered = () => {
    if (currentQuestion.id === 'mood') return responses.mood >= 0;
    if (currentQuestion.id === 'secondary') return responses.secondary >= 0;
    if (currentQuestion.id === 'improvement') return true; // Text question is optional
    return false;
  };

  return (
    <div className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-col min-h-screen">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-1 mb-4 sm:mb-6">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 w-6 sm:w-8 rounded-full ${
              idx === currentStep ? 'bg-blue-600' :
              idx < currentStep ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <Card className="shadow-lg border-0 mb-4 sm:mb-6 flex-1">
        <CardContent className="p-4 sm:p-8">
          {/* Question Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              {currentQuestion.text}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              {currentQuestion.type === 'rating'
                ? t('mvp.survey.rating.instruction')
                : t('mvp.survey.text.instruction')
              }
            </p>
          </div>

          {/* Rating Question with Single Smiley Face and Scale */}
          {currentQuestion.type === 'rating' && (
            <div className="mb-6 sm:mb-8">
              {/* Single Large Smiley Face */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-2xl overflow-hidden shadow-lg mb-4 sm:mb-6">
                {(() => {
                  const currentValue = currentQuestion.id === 'mood' ? responses.mood : responses.secondary;
                  const selectedOption = photoOptions.find(opt => opt.number === currentValue) || photoOptions[5]; // Default to 5
                  
                  return (
                    <>
                      <img
                        src={`/survey-photos/${selectedOption.photoName}.png`}
                        alt={selectedOption.emotion}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl hidden`}>
                        {selectedOption.emotion === "Extremely Sad" && "😢"}
                        {selectedOption.emotion === "Sad" && "😞"}
                        {selectedOption.emotion === "Unhappy" && "😕"}
                        {selectedOption.emotion === "Neutral" && "😐"}
                        {selectedOption.emotion === "Slightly Happy" && "🙂"}
                        {selectedOption.emotion === "Happy" && "😊"}
                        {selectedOption.emotion === "Very Happy" && "😄"}
                        {selectedOption.emotion === "Extremely Happy" && "😁"}
                        {selectedOption.emotion === "Ecstatic" && "🤩"}
                        {selectedOption.emotion === "Overjoyed" && "🥳"}
                        {selectedOption.emotion === "Perfect" && "😍"}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Blue Scale Slider */}
              <div className="mb-3 sm:mb-4">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={currentQuestion.id === 'mood' ? responses.mood : responses.secondary}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (currentQuestion.id === 'mood') {
                        setResponses({...responses, mood: value});
                      } else {
                        setResponses({...responses, secondary: value});
                      }
                    }}
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentQuestion.id === 'mood' ? responses.mood : responses.secondary) / 10) * 100}%, #e5e7eb ${((currentQuestion.id === 'mood' ? responses.mood : responses.secondary) / 10) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  
                  {/* Scale Numbers */}
                  <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-600">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <span key={num} className="w-3 sm:w-4 text-center">{num}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Rating Display */}
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                  {currentQuestion.id === 'mood' ? responses.mood : responses.secondary}/10
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {(() => {
                    const currentValue = currentQuestion.id === 'mood' ? responses.mood : responses.secondary;
                    const selectedOption = photoOptions.find(opt => opt.number === currentValue);
                    return selectedOption?.description || "Select a rating";
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Text Question */}
          {currentQuestion.type === 'text' && (
            <div className="mb-6 sm:mb-8">
              <Textarea
                placeholder="Share your thoughts..."
                value={responses.improvement}
                onChange={(e) => setResponses({...responses, improvement: e.target.value})}
                className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                maxLength={800}
              />
              <div className="text-right text-xs sm:text-sm text-gray-500 mt-2">
                {responses.improvement.length}/800 characters
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              {t('mvp.survey.button.back')}
            </Button>

            {currentQuestion.type === 'rating' ? (
              <Button
                onClick={() => {
                  const currentValue = currentQuestion.id === 'mood' ? responses.mood : responses.secondary;
                  if (currentValue >= 0) {
                    handleAnswer(currentValue);
                  }
                }}
                disabled={!isCurrentQuestionAnswered()}
                className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:hover:bg-gray-400 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
              >
                {currentStep === questions.length - 1 ? t('mvp.survey.button.submit') : t('mvp.survey.button.next')}
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => handleAnswer(responses.improvement)}
                disabled={!isCurrentQuestionAnswered()}
                className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:hover:bg-gray-400 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
              >
                {t('mvp.survey.button.submit')}
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs sm:text-sm text-gray-500">
        <p>{t('mvp.survey.progress', { current: currentStep + 1, total: questions.length })}</p>
        <p className="mt-1">{t('mvp.survey.anonymous')}</p>
      </div>
    </div>
  );
};

export default MVPSurvey;
