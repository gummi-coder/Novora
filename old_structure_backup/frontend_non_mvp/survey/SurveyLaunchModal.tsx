import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Send, Users, Clock, Shield, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface SurveyLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyData: any;
  onLaunch: () => Promise<void>;
}

const SurveyLaunchModal: React.FC<SurveyLaunchModalProps> = ({
  isOpen,
  onClose,
  surveyData,
  onLaunch
}) => {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      await onLaunch();
      setLaunchSuccess(true);
    } catch (error) {
      console.error('Launch failed:', error);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
    onClose();
  };

  const getEmployeeCount = () => {
    // This would come from the actual employee data
    return surveyData.targetAudience === 'all' ? 'All Employees' : 'Selected Teams';
  };

  const getSurveyType = () => {
    return surveyData.path === 'auto-pilot' ? 'Auto-Pilot Survey Series' : 'Single Survey';
  };

  if (launchSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Survey Launched Successfully! 🎉</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 py-4">
            {/* Success Animation */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            {/* Success Message */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Your survey is now live!
              </h3>
              <p className="text-sm text-gray-600">
                Unique, anonymous links have been sent to all employees. 
                Responses will start appearing in your dashboard.
              </p>
            </div>

            {/* Key Features Highlight */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Anonymous & Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">One-time links sent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Real-time responses</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleGoToDashboard}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Create Another Survey
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Launch Survey Confirmation</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Survey Summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Survey Type</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {getSurveyType()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Target Audience</span>
                  <span className="text-sm text-blue-700">{getEmployeeCount()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Questions</span>
                  <span className="text-sm text-blue-700">
                    {surveyData.path === 'auto-pilot' 
                      ? `${surveyData.autoPilotSurveys?.length || 0} surveys` 
                      : `${surveyData.questions?.length || 0} questions`
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">What happens when you launch:</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Unique links generated</p>
                  <p className="text-xs text-gray-600">Each employee gets a one-time, anonymous survey link</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Emails sent automatically</p>
                  <p className="text-xs text-gray-600">Survey invitations sent to all target employees</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Responses start flowing</p>
                  <p className="text-xs text-gray-600">Real-time analytics appear in your dashboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Privacy & Anonymity Guaranteed</p>
                  <p className="text-xs text-orange-700 mt-1">
                    All responses are completely anonymous. We never track who answered what - 
                    only aggregate results are shown in your dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isLaunching}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLaunch}
              disabled={isLaunching}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isLaunching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Launching...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Launch Survey
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyLaunchModal;
