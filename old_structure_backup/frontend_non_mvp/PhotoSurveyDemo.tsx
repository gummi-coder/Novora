import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoBasedSurvey from '@/components/survey/PhotoBasedSurvey';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface SurveyQuestion {
  id: number;
  question: string;
  category: string;
}

interface SurveyAnswer {
  questionId: number;
  question: string;
  selectedNumber: number;
  photoName: string;
  emotion: string;
}

const PhotoSurveyDemo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const questions: SurveyQuestion[] = [
    {
      id: 1,
      question: "How satisfied are you with your current work environment?",
      category: "Work Environment"
    },
    {
      id: 2,
      question: "How would you rate your relationship with your manager?",
      category: "Management"
    },
    {
      id: 3,
      question: "How happy are you with your work-life balance?",
      category: "Work-Life Balance"
    },
    {
      id: 4,
      question: "How satisfied are you with your career growth opportunities?",
      category: "Career Development"
    },
    {
      id: 5,
      question: "How would you rate the overall company culture?",
      category: "Company Culture"
    }
  ];

  const handleAnswer = (selectedNumber: number) => {
    const currentQuestion = questions[currentStep - 1];
    const photoMapping = {
      0: { photoName: "111111", emotion: "Extremely Sad" },
      1: { photoName: "1010", emotion: "Sad" },
      2: { photoName: "999", emotion: "Unhappy" },
      3: { photoName: "888", emotion: "Neutral" },
      4: { photoName: "777", emotion: "Slightly Happy" },
      5: { photoName: "666", emotion: "Happy" },
      6: { photoName: "555", emotion: "Very Happy" },
      7: { photoName: "444", emotion: "Extremely Happy" },
      8: { photoName: "333", emotion: "Ecstatic" },
      9: { photoName: "222", emotion: "Overjoyed" },
      10: { photoName: "111", emotion: "Perfect" }
    };

    const answer: SurveyAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedNumber,
      photoName: photoMapping[selectedNumber as keyof typeof photoMapping].photoName,
      emotion: photoMapping[selectedNumber as keyof typeof photoMapping].emotion
    };

    setAnswers(prev => [...prev, answer]);

    if (currentStep < questions.length) {
      setCurrentStep(prev => prev + 1);
      toast({
        title: "Answer Saved!",
        description: `Moving to question ${currentStep + 1} of ${questions.length}`,
      });
    } else {
      setIsCompleted(true);
      toast({
        title: "Survey Completed!",
        description: "Thank you for your responses!",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setAnswers(prev => prev.slice(0, -1));
    } else {
      navigate('/dashboard');
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setAnswers([]);
    setIsCompleted(false);
  };

  const getAverageScore = () => {
    if (answers.length === 0) return 0;
    const total = answers.reduce((sum, answer) => sum + answer.selectedNumber, 0);
    return (total / answers.length).toFixed(1);
  };

  const getOverallEmotion = (score: number) => {
    if (score >= 8) return "😍 Perfect";
    if (score >= 6) return "😄 Very Happy";
    if (score >= 4) return "😊 Happy";
    if (score >= 2) return "😐 Neutral";
    return "😢 Unhappy";
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Survey Completed!
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Thank you for your responses. Here's a summary of your answers.
            </p>
          </div>

          {/* Summary Card */}
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-center text-green-900">
                Survey Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {answers.length}
                  </div>
                  <div className="text-gray-600">Questions Answered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {getAverageScore()}
                  </div>
                  <div className="text-gray-600">Average Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {getOverallEmotion(parseFloat(getAverageScore()))}
                  </div>
                  <div className="text-gray-600">Overall Sentiment</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Answers */}
          <div className="grid gap-4 mb-8">
            {answers.map((answer, index) => (
              <Card key={answer.questionId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="mb-2">
                        Question {index + 1}
                      </Badge>
                      <div className="text-2xl">
                        {answer.emotion === "Extremely Sad" && "😢"}
                        {answer.emotion === "Sad" && "😞"}
                        {answer.emotion === "Unhappy" && "😕"}
                        {answer.emotion === "Neutral" && "😐"}
                        {answer.emotion === "Slightly Happy" && "🙂"}
                        {answer.emotion === "Happy" && "😊"}
                        {answer.emotion === "Very Happy" && "😄"}
                        {answer.emotion === "Extremely Happy" && "😁"}
                        {answer.emotion === "Ecstatic" && "🤩"}
                        {answer.emotion === "Overjoyed" && "🥳"}
                        {answer.emotion === "Perfect" && "😍"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {answer.question}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Score: <strong>{answer.selectedNumber}</strong></span>
                        <span>Photo: <strong>{answer.photoName}</strong></span>
                        <span>Emotion: <strong>{answer.emotion}</strong></span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleRestart}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Take Survey Again
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PhotoBasedSurvey
      question={questions[currentStep - 1].question}
      onAnswer={handleAnswer}
      onBack={handleBack}
      currentStep={currentStep}
      totalSteps={questions.length}
    />
  );
};

export default PhotoSurveyDemo;
