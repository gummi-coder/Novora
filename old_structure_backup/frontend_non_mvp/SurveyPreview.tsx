import { useState, useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CustomSlider } from "@/components/ui/custom-slider";
import { QuestionImage } from "@/components/ui/question-image";
import { ChevronLeft, ChevronRight, CheckCircle, Star } from "lucide-react";
import CompactPhotoSurvey from "@/components/survey/CompactPhotoSurvey";

interface Question {
  id: string;
  text: string;
  category: string;
  order: number;
  required: boolean;
  image?: string;
  type?: 'slider' | 'photo'; // Add question type
}

interface SurveyData {
  title: string;
  description?: string;
  questions: Question[];
  isAnonymous: boolean;
  showProgress: boolean;
  singleQuestionPerScreen: boolean;
}

const SurveyPreview = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Get language from navigation state
  useEffect(() => {
    if (location.state?.language) {
      setSelectedLanguage(location.state.language);
    }
  }, [location.state]);

  // Handle coming back from feedback page
  useEffect(() => {
    if (location.state?.goToLastQuestion && surveyData) {
      console.log('Restoring answers from feedback page:', location.state.savedAnswers);
      setCurrentQuestionIndex(surveyData.questions.length - 1);
      if (location.state?.savedAnswers) {
        setAnswers(location.state.savedAnswers);
      }
    }
  }, [location.state, surveyData]);

  // Load survey data from URL parameters or use mock data
  useEffect(() => {
    const dataParam = searchParams.get('data');
    
    if (dataParam) {
      try {
        const parsedData = JSON.parse(dataParam);
        setSurveyData(parsedData);
      } catch (error) {
        console.error('Failed to parse survey data:', error);
        // Fall back to mock data
        loadMockData();
      }
    } else {
      // No data provided, use mock data
      loadMockData();
    }
  }, [searchParams]);

  const loadMockData = () => {
    const mockSurveyData: SurveyData = {
      title: "Employee Engagement Survey",
      description: "Help us understand how you feel about your work environment and experience.",
      questions: [
        {
          id: "q1",
          text: "How likely are you to recommend this company as a place to work?",
          category: "enps",
          order: 0,
          required: true,
          type: "photo",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop"
        },
        {
          id: "q2", 
          text: "How satisfied are you with your current role?",
          category: "happiness",
          order: 1,
          required: true,
          type: "photo",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop"
        },
        {
          id: "q3",
          text: "How well do you collaborate with your team members?",
          category: "peer_collaboration",
          order: 2,
          required: true,
          type: "photo",
          image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop"
        },
        {
          id: "q4",
          text: "How supported do you feel by your manager?",
          category: "manager_relationship",
          order: 3,
          required: true,
          type: "photo",
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop"
        },
        {
          id: "q5",
          text: "How satisfied are you with your career growth opportunities?",
          category: "career_growth",
          order: 4,
          required: true,
          type: "photo",
          image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop"
        }
      ],
      isAnonymous: true,
      showProgress: true,
      singleQuestionPerScreen: true
    };

    setSurveyData(mockSurveyData);
  };

  const currentQuestion = surveyData?.questions[currentQuestionIndex];
  const progress = surveyData ? ((currentQuestionIndex + 1) / surveyData.questions.length) * 100 : 0;
  const hasAnswer = currentQuestion ? answers[currentQuestion.id] !== undefined : false;

  // Debug logging
  console.log('Current question:', currentQuestion);
  console.log('Question type:', currentQuestion?.type);
  console.log('Current question index:', currentQuestionIndex);

  const handleAnswer = (rating: number) => {
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: rating
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < (surveyData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Navigate to feedback page instead of setting complete
      navigate('/survey/feedback', { 
        state: { answers: answers }
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Navigate to feedback page with survey answers
    navigate('/survey/feedback', { 
      state: { answers: answers }
    });
  };

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your responses have been submitted successfully. Your feedback helps us improve our workplace.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Preview Mode:</strong> This is how the completion screen will appear to employees.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                <p>Survey included {surveyData.questions.filter(q => q.type === 'photo').length} photo-based questions and {surveyData.questions.filter(q => q.type === 'slider').length} slider questions.</p>
              </div>
            </div>
            <Button 
              onClick={() => window.close()}
              className="w-full"
            >
              Close Preview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
          <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
        {/* Preview Banner - Hidden for cleaner look */}
        <div className="hidden">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center space-x-4 mt-2">
              <a href="/photo-test" className="text-blue-600 hover:underline text-xs">
                Test Photos Here
              </a>
              <button 
                onClick={() => navigate('/survey/welcome')}
                className="text-blue-600 hover:underline text-xs"
              >
                Back to Welcome
              </button>
              <span className="text-xs text-gray-600">
                Language: {selectedLanguage.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

      {/* Progress Bar */}
      {surveyData.showProgress && (
        <div className="bg-white border-b px-4 py-3">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestionIndex + 1} of {surveyData.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200" />
          </div>
        </div>
      )}

      {/* Survey Content */}
      <div className="max-w-md mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {surveyData.title}
          </h1>
          {surveyData.description && (
            <p className="text-gray-600 text-sm">{surveyData.description}</p>
          )}
        </div>

        {/* Question */}
        {currentQuestion && (
          <>
            <Card className="shadow-lg border-0 mb-6">
              <CardContent className="p-8">
                {/* Question Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {currentQuestion.text}
                    {currentQuestion.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Rate your response on a scale from 0 to 10
                  </p>
                </div>

                {/* Smiley Face Rating - Always shown on every question */}
                <div className="mb-8">
                  <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={`/survey-photos/${[
                        { number: 0, photoName: "111111" },
                        { number: 1, photoName: "1010" },
                        { number: 2, photoName: "999" },
                        { number: 3, photoName: "888" },
                        { number: 4, photoName: "777" },
                        { number: 5, photoName: "666" },
                        { number: 6, photoName: "555" },
                        { number: 7, photoName: "444" },
                        { number: 8, photoName: "333" },
                        { number: 9, photoName: "222" },
                        { number: 10, photoName: "111" }
                      ].find(opt => opt.number === (answers[currentQuestion.id] ?? 5))?.photoName}.png`}
                      alt={`Rating ${answers[currentQuestion.id] ?? 5}/10`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl hidden`}>
                      {(() => {
                        const rating = answers[currentQuestion.id] ?? 5;
                        if (rating <= 2) return "😢";
                        if (rating <= 4) return "😞";
                        if (rating <= 6) return "😐";
                        if (rating <= 8) return "😊";
                        return "😍";
                      })()}
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <span className="text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                      {answers[currentQuestion.id] ?? 5}/10
                    </span>
                  </div>
                </div>



                {/* Rating Scale - Same for both photo and slider questions */}
                <div className="space-y-6">
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>Poor</span>
                      <span>Average</span>
                      <span>Excellent</span>
                    </div>
                    
                    <CustomSlider
                      value={answers[currentQuestion.id] ?? 5}
                      onChange={(value) => handleAnswer(value)}
                      min={0}
                      max={10}
                      className="w-full"
                    />

                    {/* Rating Labels */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0 = Very Poor</span>
                      <span>5 = Neutral</span>
                      <span>10 = Excellent</span>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Navigation */}
        {currentQuestion && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-6 py-3 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={currentQuestionIndex === (surveyData.questions.length - 1) ? handleSubmit : handleNext}
              disabled={!hasAnswer}
              className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              {currentQuestionIndex === (surveyData.questions.length - 1) ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}


      </div>
    </div>
  );
};

export default SurveyPreview;
