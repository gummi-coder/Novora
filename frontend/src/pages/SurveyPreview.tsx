import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CustomSlider } from "@/components/ui/custom-slider";
import { QuestionImage } from "@/components/ui/question-image";
import { ChevronLeft, ChevronRight, CheckCircle, Star } from "lucide-react";

interface Question {
  id: string;
  text: string;
  category: string;
  order: number;
  required: boolean;
  image?: string;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);

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
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop"
        },
        {
          id: "q2", 
          text: "How satisfied are you with your current role?",
          category: "happiness",
          order: 1,
          required: true,
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop"
        },
        {
          id: "q3",
          text: "How well do you collaborate with your team members?",
          category: "peer_collaboration",
          order: 2,
          required: true,
          image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop"
        },
        {
          id: "q4",
          text: "How supported do you feel by your manager?",
          category: "manager_relationship",
          order: 3,
          required: true,
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop"
        },
        {
          id: "q5",
          text: "How satisfied are you with your career growth opportunities?",
          category: "career_growth",
          order: 4,
          required: true,
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
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // In real app, this would submit to backend
    console.log("Survey submitted:", answers);
    setIsComplete(true);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Preview Banner */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-yellow-800">
            <strong>Preview Mode:</strong> This is exactly how employees will see the survey
          </p>
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
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Survey Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {surveyData.title}
          </h1>
          {surveyData.description && (
            <p className="text-gray-600">{surveyData.description}</p>
          )}
        </div>

        {/* Question */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {currentQuestion.text}
                  {currentQuestion.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h2>
                <p className="text-sm text-gray-500">
                  Rate your response on a scale from 0 to 10
                </p>
              </div>

              {/* Question Image */}
              {currentQuestion.image && (
                <QuestionImage
                  src={currentQuestion.image}
                  alt={`Illustration for: ${currentQuestion.text}`}
                  className="mb-6"
                />
              )}

              {/* Rating Scale */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-500">
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
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0 = Very Poor</span>
                  <span>5 = Neutral</span>
                  <span>10 = Excellent</span>
                </div>
                
                <div className="text-center">
                  <span className="text-lg font-semibold text-blue-600">
                    {answers[currentQuestion.id] ?? 5}/10
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex === (surveyData.questions.length - 1) ? (
            <Button
              onClick={handleSubmit}
              disabled={!hasAnswer}
              className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Submit Survey
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Mobile Optimization Notice */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Mobile-Optimized:</strong> This survey is designed for mobile devices with single-question-per-screen layout. 
              Employees can complete it in under 60 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;
