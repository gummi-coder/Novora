import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle } from "lucide-react";

const SurveyFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get survey answers from navigation state
  const surveyAnswers = location.state?.answers || {};

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // In a real app, this would submit to the backend
    console.log('Survey completed with answers:', surveyAnswers);
    console.log('Feedback:', feedback);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate to thank you page
      navigate('/survey/thank-you');
    }, 1000);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Final Step</span>
            <span>100%</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>
      </div>

      {/* Survey Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            One Last Thing
          </h1>
          <p className="text-gray-600">
            Is there something you want to say?
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your feedback helps us improve. This is completely optional and anonymous.
              </p>
              
              <Textarea
                placeholder="Share your thoughts, suggestions, or any additional feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              
              <div className="text-xs text-gray-500 text-right">
                {feedback.length}/500 characters
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              console.log('Navigating back with answers:', surveyAnswers);
              navigate('/survey/preview', { 
                state: { 
                  goToLastQuestion: true,
                  savedAnswers: surveyAnswers 
                } 
              });
            }}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Mobile Optimization Notice */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Mobile-Optimized:</strong> This feedback form is designed for mobile devices. 
              Your responses remain completely anonymous and help us improve the workplace experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyFeedback;
