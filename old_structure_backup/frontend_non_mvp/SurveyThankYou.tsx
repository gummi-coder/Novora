import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

const SurveyThankYou = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Complete</span>
            <span>100%</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>
      </div>

      {/* Survey Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You!
          </h1>
          <p className="text-gray-600">
            Your survey has been submitted successfully.
          </p>
        </div>

        {/* Completion Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                Your feedback helps us improve our workplace. Your responses are anonymous and have been recorded.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Optimization Notice */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Survey Complete:</strong> Thank you for taking the time to provide your feedback. 
              Your responses help us create a better workplace for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyThankYou;
