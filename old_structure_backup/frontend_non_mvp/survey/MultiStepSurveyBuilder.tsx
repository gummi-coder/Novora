import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { QuestionBankService, Metric, Question as QuestionBankQuestion } from "@/services/questionBank";
import {
  ArrowLeft, ArrowRight, Play, FileText, Settings, Calendar, Send, CheckCircle,
  RotateCcw, Users, TrendingUp, Heart, Award, MessageSquare, Target, Home, Star,
  Clock, Eye, Share2, Copy, Mail, Smartphone, Plus, Trash2, Loader2, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { autoPilotPlans, AutoPilotPlan } from "@/data/autoPilotPlans";
import { surveyTemplates } from "@/data/surveyTemplates";
import SurveyLaunchModal from "./SurveyLaunchModal";
import { surveyService } from "@/services/surveyService";

// Types
interface SurveyData {
  path: 'auto-pilot' | 'template' | 'custom';
  title: string;
  description: string;
  questions: Question[];
  schedule: {
    startDate: Date;
    frequency: string;
    channels: string[];
    reminders: string[];
  };
  branding: {
    language: string;
    primaryColor: string;
  };
}

interface Question {
  id: string;
  text: string;
  category: string;
  categoryName: string;
  required: boolean;
  order: number;
}

interface MultiStepSurveyBuilderProps {
  onComplete: (data: SurveyData) => void;
  onBack: () => void;
}

const MultiStepSurveyBuilder: React.FC<MultiStepSurveyBuilderProps> = ({
  onComplete,
  onBack
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    path: 'template',
    title: '',
    description: '',
    questions: [],
    schedule: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 10, 0),
      frequency: 'monthly',
      channels: ['email'],
      reminders: ['day3', 'day7']
    },
    branding: {
      language: 'en',
      primaryColor: '#3B82F6'
    }
  });

  const totalSteps = 5;

  // Step 1: Choose Your Path
  const renderStep1 = () => (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Header - Enhanced Dashboard Style */}
      <div className="text-center space-y-4 mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          <Target className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Survey Path
          </h1>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto">
            Select the perfect way to create your employee survey. Each path is designed for different needs and preferences.
          </p>
        </div>
      </div>

      {/* Path Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Auto-Pilot Option */}
        <Card 
          className={cn(
            "relative cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white",
            surveyData.path === 'auto-pilot' ? "ring-2 ring-blue-500 border-blue-200 shadow-lg" : ""
          )}
          onClick={() => setSurveyData(prev => ({ ...prev, path: 'auto-pilot' }))}
        >
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900">Auto-Pilot</CardTitle>
                <p className="text-sm text-gray-600">Set it and forget it</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">3, 6, or 12 months</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Surveys rotate automatically</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-gray-700">Consistent insights</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Recurring</span>
              </div>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                Best for ongoing measurement
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Template Option */}
        <Card 
          className={cn(
            "relative cursor-pointer border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 bg-white",
            surveyData.path === 'template' ? "ring-2 ring-green-500 border-green-200 shadow-lg" : ""
          )}
          onClick={() => setSurveyData(prev => ({ ...prev, path: 'template' }))}
        >
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900">Template</CardTitle>
                <p className="text-sm text-gray-600">Pre-built survey sets</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">6 proven questions</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-gray-700">HR expert designed</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-700">Optimized for results</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Ready to use</span>
              </div>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                Best for quick setup
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Build My Own Option */}
        <Card 
          className={cn(
            "relative cursor-pointer border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 bg-white",
            surveyData.path === 'custom' ? "ring-2 ring-orange-500 border-orange-200 shadow-lg" : ""
          )}
          onClick={() => setSurveyData(prev => ({ ...prev, path: 'custom' }))}
        >
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900">Build My Own</CardTitle>
                <p className="text-sm text-gray-600">Full customization</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Question bank access</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Drag-and-drop builder</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-gray-700">Complete control</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Custom</span>
              </div>
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                Best for power users
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Button 
          size="lg" 
          onClick={() => setCurrentStep(2)}
          disabled={!surveyData.path}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Step 2: Configure Your Survey
  const renderStep2 = () => {
    switch (surveyData.path) {
      case 'auto-pilot':
        return <AutoPilotConfig surveyData={surveyData} setSurveyData={setSurveyData} setCurrentStep={setCurrentStep} />;
      case 'template':
        return <TemplateConfig surveyData={surveyData} setSurveyData={setSurveyData} setCurrentStep={setCurrentStep} />;
      case 'custom':
        return <CustomBuilder surveyData={surveyData} setSurveyData={setSurveyData} setCurrentStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  // Step 3: Survey Summary
  const renderStep3 = () => (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Header - Dashboard Style */}
      <div className="text-center space-y-4 mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Survey Summary
          </h1>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto">
            Review what you're about to send to your team. Everything looks good!
          </p>
        </div>
      </div>

      {/* Survey Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{surveyData.questions.length}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{new Set(surveyData.questions.map(q => q.category)).size}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">~{Math.max(30, surveyData.questions.length * 10)}s</div>
            <div className="text-sm text-gray-600">Est. Time</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{surveyData.schedule.channels.length}</div>
            <div className="text-sm text-gray-600">Channels</div>
          </CardContent>
        </Card>
      </div>

      {/* Survey Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Survey Information */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Survey Info</CardTitle>
                <p className="text-sm text-gray-600">Basic details</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium">{surveyData.title || 'Employee Satisfaction Survey'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Type:</span>
              <Badge variant="outline" className="text-xs">
                {surveyData.path === 'auto-pilot' ? 'Auto-Pilot' : 
                 surveyData.path === 'template' ? 'Template' : 'Custom'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Required Qs:</span>
              <span className="font-medium">{surveyData.questions.filter(q => q.required).length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Schedule</CardTitle>
                <p className="text-sm text-gray-600">Timing & frequency</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">{surveyData.schedule.startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Frequency:</span>
              <Badge variant="outline" className="text-xs capitalize">{surveyData.schedule.frequency}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Reminders:</span>
              <span className="font-medium">{surveyData.schedule.reminders.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Channels */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Distribution</CardTitle>
                <p className="text-sm text-gray-600">Channels & settings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Channels:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {surveyData.schedule.channels.map((channel, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Card className="border border-gray-200 bg-white mt-6">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {surveyData.path === 'auto-pilot' ? 'Auto-Pilot Surveys' : 'Survey Questions'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {surveyData.path === 'auto-pilot' 
                    ? `${surveyData.path === 'auto-pilot' ? '3-12' : '0'} surveys in your plan` 
                    : `All ${surveyData.questions.length} questions`}
                </p>
              </div>
            </div>
            {(surveyData.path === 'auto-pilot' || surveyData.path === 'template') && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(2)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Survey
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {surveyData.path === 'auto-pilot' ? (
            // Auto-pilot surveys view
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Month 1: Core Pulse</h4>
                      <p className="text-sm text-gray-600">Core Pulse Template</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    6 questions
                  </Badge>
                </div>
                <div className="space-y-2">
                  {surveyData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="flex items-start space-x-2 text-sm">
                      <div className="w-4 h-4 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {qIndex + 1}
                      </div>
                      <span className="text-gray-700">{question.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Regular questions view
            <div className="space-y-3">
              {surveyData.questions.map((question, index) => (
                <div key={question.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{question.text}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs bg-blue-50">{question.categoryName}</Badge>
                      {question.required && <Badge variant="secondary" className="text-xs bg-red-50 text-red-700">Required</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep(2)} className="px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={() => setCurrentStep(4)} className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Continue to Schedule
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );



  // Step 4: Schedule & Settings
  const renderStep4 = () => (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Header - Dashboard Style */}
      <div className="text-center space-y-4 mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Schedule & Settings
          </h1>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto">
            Configure when and how to send your survey to your team
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Schedule Settings */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Schedule Settings</CardTitle>
                <p className="text-sm text-gray-600">When to send your survey</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Start Date</span>
              </label>
              <input 
                type="date" 
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={surveyData.schedule.startDate.toISOString().split('T')[0]}
                onChange={(e) => setSurveyData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, startDate: new Date(e.target.value) }
                }))}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-gray-400" />
                <span>Frequency</span>
              </label>
              <select 
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={surveyData.schedule.frequency}
                onChange={(e) => setSurveyData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, frequency: e.target.value }
                }))}
              >
                <option value="once">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Settings */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Distribution Settings</CardTitle>
                <p className="text-sm text-gray-600">How to reach your team</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            {/* Channels */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>Channels</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {['Email', 'Slack', 'Teams', 'WhatsApp', 'SMS'].map(channel => (
                  <label key={channel} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={surveyData.schedule.channels.includes(channel.toLowerCase())}
                      onChange={(e) => {
                        const channels = e.target.checked 
                          ? [...surveyData.schedule.channels, channel.toLowerCase()]
                          : surveyData.schedule.channels.filter(c => c !== channel.toLowerCase());
                        setSurveyData(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, channels }
                        }));
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reminders */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Bell className="w-4 h-4 text-gray-400" />
                <span>Reminders</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {['Day 3', 'Day 7', 'Weekly'].map(reminder => (
                  <label key={reminder} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={surveyData.schedule.reminders.includes(reminder.toLowerCase().replace(' ', ''))}
                      onChange={(e) => {
                        const reminders = e.target.checked 
                          ? [...surveyData.schedule.reminders, reminder.toLowerCase().replace(' ', '')]
                          : surveyData.schedule.reminders.filter(r => r !== reminder.toLowerCase().replace(' ', ''));
                        setSurveyData(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, reminders }
                        }));
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{reminder}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card className="border border-gray-200 bg-white mt-6">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Survey Preview</CardTitle>
              <p className="text-sm text-gray-600">See how your survey will look to employees</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{surveyData.questions.length} questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">~{Math.max(30, surveyData.questions.length * 10)} seconds</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                try {
                  // Check if we have questions
                  if (!surveyData.questions || surveyData.questions.length === 0) {
                    toast({
                      title: "No Questions Available",
                      description: "Please add some questions to your survey before previewing.",
                      variant: "destructive"
                    });
                    return;
                  }

                  const surveyDataForPreview = {
                    title: surveyData.title || 'Employee Satisfaction Survey',
                    description: surveyData.description || 'Help us understand how you feel about your work environment.',
                    questions: surveyData.questions.map(q => ({
                      id: q.id,
                      text: q.text,
                      category: q.category,
                      order: q.order,
                      required: q.required
                    })),
                    isAnonymous: true,
                    showProgress: true,
                    singleQuestionPerScreen: false
                  };
                  
                  console.log('Preview data:', surveyDataForPreview);
                  
                  const encodedData = encodeURIComponent(JSON.stringify(surveyDataForPreview));
                  const previewUrl = `${window.location.origin}/survey/preview?data=${encodedData}`;
                  
                  console.log('Opening preview URL:', previewUrl);
                  const newWindow = window.open(previewUrl, '_blank');
                  
                  // Check if popup was blocked
                  if (!newWindow) {
                    toast({
                      title: "Popup Blocked",
                      description: "Please allow popups for this site and try again, or copy the URL manually.",
                      variant: "destructive"
                    });
                    // Fallback: copy URL to clipboard
                    navigator.clipboard.writeText(previewUrl).then(() => {
                      toast({
                        title: "URL Copied",
                        description: "Preview URL copied to clipboard. Please paste it in a new tab.",
                      });
                    });
                  }
                } catch (error) {
                  console.error('Error opening preview:', error);
                  toast({
                    title: "Preview Error",
                    description: "Failed to open survey preview. Please try again.",
                    variant: "destructive"
                  });
                }
              }}
              disabled={!surveyData.questions || surveyData.questions.length === 0}
              className={`flex items-center space-x-2 ${
                !surveyData.questions || surveyData.questions.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview Survey
              {(!surveyData.questions || surveyData.questions.length === 0) && (
                <span className="text-xs text-gray-500 ml-1">(Add questions first)</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep(3)} className="px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={() => setCurrentStep(5)} className="px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          Continue to Launch
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );



  // Step 5: Launch Survey
  const renderStep5 = () => (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Header - Dashboard Style */}
      <div className="text-center space-y-4 mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <Send className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Launch Survey
          </h1>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto">
            Final confirmation before activating your survey. Everything looks perfect!
          </p>
        </div>
      </div>

      {/* Success Status */}
      <Card className="border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Survey Ready to Launch!</h3>
              <p className="text-green-700">Your survey is configured and ready to be activated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Survey Summary */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Survey Summary</CardTitle>
                  <p className="text-sm text-gray-600">
                    {surveyData.path === 'auto-pilot' ? 'Auto-Pilot Surveys' : 'Survey Questions'}
                  </p>
                </div>
              </div>
              {surveyData.path === 'auto-pilot' && autoPilotSurveys.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSurveyPreview(!showSurveyPreview)}
                  className="text-xs"
                >
                  {showSurveyPreview ? 'Hide Details' : 'View All Surveys'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {surveyData.path === 'auto-pilot' && autoPilotSurveys.length > 0 ? (
              showSurveyPreview ? (
                <div className="space-y-4">
                  {/* Survey Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSurveyIndex(Math.max(0, currentSurveyIndex - 1))}
                      disabled={currentSurveyIndex === 0}
                      className="text-xs"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-gray-600">
                      Survey {currentSurveyIndex + 1} of {autoPilotSurveys.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSurveyIndex(Math.min(autoPilotSurveys.length - 1, currentSurveyIndex + 1))}
                      disabled={currentSurveyIndex === autoPilotSurveys.length - 1}
                      className="text-xs"
                    >
                      Next
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>

                  {/* Current Survey Details */}
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        {autoPilotSurveys[currentSurveyIndex]?.name}
                      </h4>
                      <p className="text-sm text-blue-700">
                        Template: {autoPilotSurveys[currentSurveyIndex]?.template?.name}
                      </p>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Questions:</h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {autoPilotSurveys[currentSurveyIndex]?.template?.questionsList?.map((question: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                            <span className="text-xs font-medium text-gray-500 mt-0.5">{index + 1}.</span>
                            <span className="text-xs text-gray-700">{question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Surveys:</span>
                    <span className="font-medium">{autoPilotSurveys.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {surveyData.schedule.frequency === 'quarterly' ? '3 months' :
                       surveyData.schedule.frequency === 'half-year' ? '6 months' : '12 months'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Questions per Survey:</span>
                    <span className="font-medium">6</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSurveyPreview(true)}
                    className="w-full text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View All Surveys
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium">{surveyData.title || 'Employee Satisfaction Survey'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{surveyData.questions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Est. Time:</span>
                  <span className="font-medium">~{Math.max(30, surveyData.questions.length * 10)}s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline" className="text-xs">
                    {surveyData.path === 'auto-pilot' ? 'Auto-Pilot' : 
                     surveyData.path === 'template' ? 'Template' : 'Custom'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Details */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Schedule</CardTitle>
                <p className="text-sm text-gray-600">Timing & frequency</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">{surveyData.schedule.startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Frequency:</span>
              <Badge variant="outline" className="text-xs capitalize">{surveyData.schedule.frequency}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Reminders:</span>
              <span className="font-medium">{surveyData.schedule.reminders.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Channels */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Distribution</CardTitle>
                <p className="text-sm text-gray-600">Channels & settings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Channels:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {surveyData.schedule.channels.map((channel, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What Happens Next */}
      <Card className="border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 mt-6">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">What Happens Next</CardTitle>
              <p className="text-sm text-gray-600">After you launch your survey</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Survey Sent</div>
                <div className="text-sm text-gray-600">To your team via selected channels</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Responses Collected</div>
                <div className="text-sm text-gray-600">Anonymous feedback from employees</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Insights Generated</div>
                <div className="text-sm text-gray-600">Analytics and actionable insights</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep(4)} className="px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          size="lg" 
          onClick={() => setShowLaunchModal(true)}
          className="px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          Launch Survey
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );



// Auto-Pilot Configuration Component
const AutoPilotConfig: React.FC<{
  surveyData: SurveyData;
  setSurveyData: Dispatch<SetStateAction<SurveyData>>;
  setCurrentStep: (step: number) => void;
}> = ({ surveyData, setSurveyData, setCurrentStep }) => {
  // Convert auto-pilot plans to display format
  const plans = autoPilotPlans.map((plan) => {
    const getIcon = (planId: string) => {
      switch (planId) {
        case 'quarterly-plan': return '📊';
        case 'half-year-plan': return '🎯';
        case 'annual-plan': return '🚀';
        default: return '📋';
      }
    };

    const getColor = (planId: string) => {
      switch (planId) {
        case 'quarterly-plan': return 'from-blue-500 to-cyan-500';
        case 'half-year-plan': return 'from-purple-500 to-pink-500';
        case 'annual-plan': return 'from-green-500 to-emerald-500';
        default: return 'from-gray-500 to-gray-600';
      }
    };

    const features = plan.schedule.map((schedule) => {
      const template = surveyTemplates.find(t => t.id === schedule.templateId);
      return `Month ${schedule.month}: ${template?.name || schedule.templateName}`;
    });

    // For Annual plan, show a cleaner summary instead of all 12 months
    if (plan.id === 'annual-plan') {
      return {
        id: plan.id,
        name: plan.name,
        duration: `${plan.duration} months`,
        surveys: plan.schedule.length,
        description: plan.description,
        features: [
          'Months 1–6: All 6 templates in order',
          'Months 7–12: Repeat cycle',
          'Complete year-round measurement'
        ],
        icon: getIcon(plan.id),
        color: getColor(plan.id),
        popular: false,
        plan: plan // Keep reference to original plan
      };
    }

    return {
      id: plan.id,
      name: plan.name,
      duration: `${plan.duration} months`,
      surveys: plan.schedule.length,
      description: plan.description,
      features: features,
      icon: getIcon(plan.id),
      color: getColor(plan.id),
      popular: false,
      plan: plan // Keep reference to original plan
    };
  });

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Header - Enhanced */}
      <div className="text-center space-y-4 mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          <RotateCcw className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Auto-Pilot Plan
          </h1>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto">
            Set up recurring surveys that rotate automatically. Your team gets consistent insights while you focus on what matters.
          </p>
        </div>
      </div>

      {/* Plan Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={cn(
              "relative cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white",
              surveyData.schedule.frequency === plan.id 
                ? "ring-2 ring-blue-500 border-blue-200 shadow-lg" 
                : ""
            )}
            onClick={() => setSurveyData(prev => ({
              ...prev,
              schedule: { ...prev.schedule, frequency: plan.id }
            }))}
          >
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-sm",
                  `bg-gradient-to-r ${plan.color}`
                )}>
                  {plan.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              {/* Stats Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{plan.surveys} surveys</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{plan.duration}</span>
                </div>
              </div>

              {/* Survey Sequence */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Survey Sequence:</span>
                </div>
                <div className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <span className="flex-1">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection Indicator */}
              {surveyData.schedule.frequency === plan.id && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-blue-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Selected</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Bottom Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center mt-6 border border-blue-100">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">How Auto-Pilot Works</h3>
        </div>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Surveys are automatically sent on the 15th of each month • Questions rotate intelligently to prevent fatigue • 
          Core metrics (Happiness & eNPS) included in every survey
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={() => setCurrentStep(3)} className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Continue to Summary
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Template Configuration Component
const TemplateConfig: React.FC<{
  surveyData: SurveyData;
  setSurveyData: Dispatch<SetStateAction<SurveyData>>;
  setCurrentStep: (step: number) => void;
}> = ({ surveyData, setSurveyData, setCurrentStep }) => {
  const templates = [
    {
      id: 'core-pulse',
      name: 'Core Pulse',
      questions: 6,
      time: '45 seconds',
      description: 'Essential team pulse check with core metrics',
      categories: ['Job Satisfaction', 'eNPS', 'Manager Relationship', 'Peer Collaboration', 'Recognition', 'Communication'],
      icon: '💓',
      color: 'from-red-500 to-pink-500',
      bestFor: 'Regular team check-ins',
      questionsList: [
        'How happy and satisfied do you feel at work lately?',
        'How likely are you to recommend working here to a friend?',
        'Do you feel supported by your manager?',
        'How connected do you feel with your teammates?',
        'Do you feel your work is valued here?',
        'Do you get the information you need to do your job well?'
      ]
    },
    {
      id: 'team-health',
      name: 'Team Health Deep Dive',
      questions: 6,
      time: '45 seconds',
      description: 'Focused on team dynamics and relationships',
      categories: ['Job Satisfaction', 'eNPS', 'Peer Collaboration', 'Manager Relationship'],
      icon: '🏥',
      color: 'from-blue-500 to-cyan-500',
      bestFor: 'Team relationship assessment',
      questionsList: [
        'How happy and satisfied do you feel at work lately?',
        'How likely are you to recommend working here to a friend?',
        'Do your colleagues support you when needed?',
        'How strong is the sense of unity in your team?',
        'How approachable is your manager when you need help?',
        'Do you feel respected by your manager?'
      ]
    },
    {
      id: 'growth-engagement',
      name: 'Growth & Engagement',
      questions: 6,
      time: '45 seconds',
      description: 'Career development and motivation focus',
      categories: ['Job Satisfaction', 'eNPS', 'Career Growth', 'Engagement'],
      icon: '📈',
      color: 'from-green-500 to-emerald-500',
      bestFor: 'Career development reviews',
      questionsList: [
        'How happy and satisfied do you feel at work lately?',
        'How likely are you to recommend working here to a friend?',
        'Do you feel like you are growing and developing at work?',
        'Do you have opportunities to advance in your career here?',
        'How motivated are you to give your best at work?',
        'Do you feel excited about your work most days?'
      ]
    },
    {
      id: 'culture-collaboration',
      name: 'Culture & Collaboration Check',
      questions: 6,
      time: '45 seconds',
      description: 'Values alignment and communication focus',
      categories: ['Job Satisfaction', 'eNPS', 'Value Alignment', 'Communication'],
      icon: '🤝',
      color: 'from-purple-500 to-pink-500',
      bestFor: 'Culture and values assessment',
      questionsList: [
        'How happy and satisfied do you feel at work lately?',
        'How likely are you to recommend working here to a friend?',
        'Do you feel your values align with the company\'s values?',
        'How well do you believe in the company\'s mission?',
        'How openly do people share important updates here?',
        'Do you feel kept in the loop about changes that affect you?'
      ]
    },
    {
      id: 'wellness-environment',
      name: 'Wellness & Environment Focus',
      questions: 6,
      time: '45 seconds',
      description: 'Physical well-being and work environment',
      categories: ['Job Satisfaction', 'eNPS', 'Health & Wellness', 'Work Environment'],
      icon: '🌱',
      color: 'from-orange-500 to-yellow-500',
      bestFor: 'Wellness and environment assessment',
      questionsList: [
        'How happy and satisfied do you feel at work lately?',
        'How likely are you to recommend working here to a friend?',
        'Do you feel your physical well-being is looked after here?',
        'How manageable is your workload for maintaining balance?',
        'Do you have the tools and equipment you need to do your job well?',
        'Do you feel physically comfortable during your workday?'
      ]
    },
    {
      id: 'review-lite',
      name: 'Review Lite (Snapshot)',
      questions: 6,
      time: '45 seconds',
      description: 'Quick comprehensive overview',
      categories: ['Job Satisfaction', 'eNPS', 'Manager Relationship', 'Recognition', 'Career Growth', 'Engagement'],
      icon: '📸',
      color: 'from-indigo-500 to-purple-500',
      bestFor: 'Quick team snapshots',
      questionsList: [
        'How happy and satisfied do you feel at work lately?',
        'How likely are you to recommend working here to a friend?',
        'Does your manager listen to your ideas and concerns?',
        'Do you feel your work is valued here?',
        'Do you feel like you are growing and developing at work?',
        'How motivated are you to give your best at work?'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Header - Enhanced */}
      <div className="text-center space-y-4 mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Choose Your Template
          </h1>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto">
            Select a pre-built survey template designed by HR experts. Each template includes carefully crafted questions for optimal insights.
          </p>
        </div>
      </div>

      {/* Template Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="relative cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
            onClick={() => {
              // Add template questions using the questionsList
              const templateQuestions = template.questionsList?.map((questionText, index) => {
                // Map question text to categories based on the template
                let category = 'job_satisfaction';
                let categoryName = 'Job Satisfaction & Happiness';
                
                if (questionText.includes('recommend')) {
                  category = 'enps';
                  categoryName = 'eNPS (Employee Net Promoter Score)';
                } else if (questionText.includes('manager') || questionText.includes('supported by')) {
                  category = 'manager_relationship';
                  categoryName = 'Manager Relationship';
                } else if (questionText.includes('teammates') || questionText.includes('colleagues') || questionText.includes('unity')) {
                  category = 'peer_collaboration';
                  categoryName = 'Peer Collaboration';
                } else if (questionText.includes('valued') || questionText.includes('recognition')) {
                  category = 'recognition';
                  categoryName = 'Recognition';
                } else if (questionText.includes('information') || questionText.includes('updates') || questionText.includes('loop')) {
                  category = 'communication';
                  categoryName = 'Communication';
                } else if (questionText.includes('growing') || questionText.includes('developing') || questionText.includes('advance')) {
                  category = 'career_growth';
                  categoryName = 'Career Growth';
                } else if (questionText.includes('motivated') || questionText.includes('excited')) {
                  category = 'engagement';
                  categoryName = 'Engagement';
                } else if (questionText.includes('values') || questionText.includes('mission')) {
                  category = 'value_alignment';
                  categoryName = 'Value Alignment';
                } else if (questionText.includes('well-being') || questionText.includes('workload') || questionText.includes('balance')) {
                  category = 'health_wellness';
                  categoryName = 'Health & Wellness';
                } else if (questionText.includes('tools') || questionText.includes('equipment') || questionText.includes('comfortable')) {
                  category = 'work_environment';
                  categoryName = 'Work Environment';
                }
                
                return {
                  id: `template-${template.id}-${index}`,
                  text: questionText,
                  category: category,
                  categoryName: categoryName,
                  required: index < 2, // First two questions are always required
                  order: index
                };
              }) || [];
              
              setSurveyData(prev => ({
                ...prev,
                questions: templateQuestions,
                title: template.name
              }));
              setCurrentStep(3);
            }}
          >
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-sm",
                  `bg-gradient-to-r ${template.color}`
                )}>
                  {template.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              {/* Stats Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{template.questions} questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{template.time}</span>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Categories:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Best For */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Best for: {template.bestFor}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 text-center mt-6 border border-green-100">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Star className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Why Use Templates?</h3>
        </div>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Templates are designed by HR experts and tested for optimal response rates • Core metrics (Satisfaction & eNPS) included in every template • 
          Questions are proven to generate actionable insights
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" className="px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          Select Template
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Custom Builder Component
const CustomBuilder: React.FC<{
  surveyData: SurveyData;
  setSurveyData: Dispatch<SetStateAction<SurveyData>>;
  setCurrentStep: (step: number) => void;
}> = ({ surveyData, setSurveyData, setCurrentStep }) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomQuestion, setShowCustomQuestion] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [selectedQuestionPosition, setSelectedQuestionPosition] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [autoPilotSurveys, setAutoPilotSurveys] = useState<any[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customCategory, setCustomCategory] = useState('job_satisfaction');

  // Question bank state
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [questions, setQuestions] = useState<QuestionBankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0);
  const [showSurveyPreview, setShowSurveyPreview] = useState(false);

  // Load question bank data
  useEffect(() => {
    const loadQuestionBank = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load metrics and questions in parallel
        const [metricsData, questionsData] = await Promise.all([
          QuestionBankService.getMetrics(),
          QuestionBankService.getQuestions({ activeOnly: true })
        ]);
        
        setMetrics(metricsData);
        setQuestions(questionsData);

        // Auto-add required core questions if survey is empty
        if (surveyData.questions.length === 0) {
          const jobSatisfactionQuestions = questionsData.filter(q => q.metric_category === 'job_satisfaction');
          const enpsQuestions = questionsData.filter(q => q.metric_category === 'enps');
          
          if (jobSatisfactionQuestions.length > 0 && enpsQuestions.length > 0) {
            const requiredQuestions = [
              {
                id: 'required-1',
                text: jobSatisfactionQuestions[0].question_text,
                category: 'job_satisfaction',
                categoryName: 'Job Satisfaction & Happiness',
                required: true,
                order: 0
              },
              {
                id: 'required-2',
                text: enpsQuestions[0].question_text,
                category: 'enps',
                categoryName: 'eNPS (Employee Net Promoter Score)',
                required: true,
                order: 1
              }
            ];
            
            setSurveyData(prev => ({
              ...prev,
              questions: requiredQuestions
            }));
          }
        }
      } catch (err: any) {
        console.error('❌ Error loading question bank:', err);
        setError(`Failed to load question bank: ${err.message}`);
        toast({
          title: "Error",
          description: `Failed to load question bank: ${err.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestionBank();
  }, [toast, surveyData.questions.length]);

  // Get icon for metric category
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      'job_satisfaction': Heart,
      'enps': TrendingUp,
      'manager_relationship': Users,
      'peer_collaboration': Users,
      'recognition': Award,
      'career_growth': TrendingUp,
      'value_alignment': Star,
      'communication': MessageSquare,
      'work_environment': Home,
      'health_wellness': Heart,
      'engagement': Target
    };
    return iconMap[category] || FileText;
  };

  // Get color for metric category (simplified)
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'job_satisfaction': 'bg-red-500',
      'enps': 'bg-blue-500',
      'manager_relationship': 'bg-purple-500',
      'peer_collaboration': 'bg-indigo-500',
      'recognition': 'bg-yellow-500',
      'career_growth': 'bg-green-500',
      'value_alignment': 'bg-pink-500',
      'communication': 'bg-teal-500',
      'work_environment': 'bg-orange-500',
      'health_wellness': 'bg-emerald-500',
      'engagement': 'bg-cyan-500'
    };
    return colorMap[category] || 'bg-gray-500';
  };

  const categories = [
    { id: 'all', name: 'All Questions', icon: FileText, color: 'bg-gray-100 text-gray-800' },
    ...metrics.map(metric => ({
      id: metric.category,
      name: metric.name,
      icon: getCategoryIcon(metric.category),
      color: 'bg-blue-100 text-blue-800'
    }))
  ];

  const getFilteredQuestions = () => {
    let filteredQuestions = questions;
    
    if (selectedCategory !== 'all') {
      filteredQuestions = questions.filter(q => q.metric_category === selectedCategory);
    }
    
    if (searchTerm) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredQuestions;
  };

  const addQuestion = (questionBankQuestion: QuestionBankQuestion) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionBankQuestion.question_text,
      category: questionBankQuestion.metric_category,
      categoryName: questionBankQuestion.metric_name,
      required: false,
      order: surveyData.questions.length
    };
    setSurveyData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const addCustomQuestion = () => {
    if (!customQuestion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question text",
        variant: "destructive"
      });
      return;
    }

    const selectedMetric = metrics.find(m => m.category === customCategory);
    if (!selectedMetric) {
      toast({
        title: "Error",
        description: "Please select a valid category",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: Question = {
      id: `custom-${Date.now()}`,
      text: customQuestion.trim(),
      category: customCategory,
      categoryName: selectedMetric.name,
      required: false,
      order: surveyData.questions.length
    };

    setSurveyData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset form
    setCustomQuestion('');
    setCustomCategory('job_satisfaction');
    setShowCustomQuestion(false);

    toast({
      title: "Success",
      description: "Custom question added to your survey",
    });
  };

  const replaceRequiredQuestion = (position: number, questionBankQuestion: QuestionBankQuestion) => {
    setSurveyData(prev => {
      const updatedQuestions = [...prev.questions];
      const requiredQuestion = updatedQuestions.find(q => q.required && q.order === position);
      
      if (requiredQuestion) {
        requiredQuestion.text = questionBankQuestion.question_text;
        requiredQuestion.category = questionBankQuestion.metric_category;
        requiredQuestion.categoryName = questionBankQuestion.metric_name;
      }
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  // Generate auto-pilot surveys when auto-pilot is selected
  useEffect(() => {
    if (surveyData.path === 'auto-pilot' && surveyData.schedule.frequency) {
      const surveys = generateAutoPilotSurveys(surveyData.schedule.frequency);
      setAutoPilotSurveys(surveys);
    }
  }, [surveyData.path, surveyData.schedule.frequency]);

  // Generate auto-pilot surveys based on frequency
  const generateAutoPilotSurveys = (frequency: string) => {
    // Find the selected plan
    const selectedPlan = autoPilotPlans.find(plan => plan.id === frequency);
    if (!selectedPlan) return [];

    // Generate surveys based on the plan schedule
    const surveys = selectedPlan.schedule.map((schedule) => {
      const template = surveyTemplates.find(t => t.id === schedule.templateId);
      return {
        month: schedule.month,
        template: {
          id: template?.id || schedule.templateId,
          name: template?.name || schedule.templateName,
          questionsList: template?.questions.map(q => q.text) || []
        },
        name: `Month ${schedule.month}: ${template?.name || schedule.templateName}`
      };
    });
    
    return surveys;
  };



  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Header - Dashboard Style */}
      <div className="text-center space-y-4 mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Build Your Custom Survey
          </h1>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto">
            Start with required core questions, then add additional questions from our comprehensive question bank
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Question Bank */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Question Bank</CardTitle>
                    <p className="text-sm text-gray-600">Browse and select questions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    {getFilteredQuestions().length} filtered
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-gray-100">
                    {questions.length} total
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const categoryColor = category.id !== 'all' ? getCategoryColor(category.id) : 'bg-gray-500';
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`text-xs transition-all duration-200 ${
                        selectedCategory === category.id
                          ? `${categoryColor} text-white shadow-md`
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>

              {/* Search and Add Custom */}
              <div className="space-y-3">
                {surveyData.questions.length >= 6 && (
                  <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm text-yellow-800">
                        Maximum 6 questions reached. Remove a question to add more.
                      </p>
                    </div>
                  </div>
                )}
                                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="🔍 Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      />
                    </div>
                    <Button
                      onClick={() => setShowCustomQuestion(true)}
                      disabled={surveyData.questions.length >= 6}
                      className={`px-4 shadow-md ${
                        surveyData.questions.length >= 6
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Custom
                    </Button>
                  </div>
                </div>

              {/* Questions List */}
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                    <p className="text-gray-500">Loading question bank...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <>
                    {getFilteredQuestions().map((question) => (
                      <div 
                        key={question.id}
                        className={`p-4 border border-gray-200 rounded-lg transition-all duration-200 group ${
                          surveyData.questions.length >= 6
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer hover:bg-gray-50 hover:shadow-md'
                        }`}
                        onClick={() => {
                          if (surveyData.questions.length < 6) {
                            addQuestion(question);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                              {question.question_text}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                                {question.metric_name}
                              </Badge>
                              {question.sensitive && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                  Sensitive
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                    {getFilteredQuestions().length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No questions found. Try adjusting your search or filters.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Survey Canvas */}
        <div className="lg:col-span-1">
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Your Survey</CardTitle>
                    <p className="text-sm text-gray-600">Current questions</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  surveyData.questions.length >= 6 
                    ? 'bg-green-100 text-green-700 border-green-300' 
                    : 'bg-green-50'
                }`}>
                  {surveyData.questions.length}/6 questions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {surveyData.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Loading required questions...</h3>
                  <p className="text-xs text-gray-500">Setting up your core survey questions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Required Core Questions Section */}
                  {surveyData.questions.filter(q => q.required).length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-800 text-sm">Required Core Questions</h4>
                      </div>
                      <p className="text-xs text-gray-600 mb-4">
                        These questions are required for every survey. You can only select questions from Job Satisfaction and eNPS categories for positions 1 and 2.
                      </p>
                      <div className="space-y-2">
                        {surveyData.questions.filter(q => q.required).map((question, index) => (
                          <div key={question.id} className="group relative p-4 bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-start space-x-3">
                              <div className={`w-6 h-6 ${getCategoryColor(question.category)} text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm`}>
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-sm leading-relaxed">
                                  {question.text}
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-300 font-medium">
                                    {question.categoryName}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const categoryQuestions = questions.filter(q => q.metric_category === question.category);
                                  if (categoryQuestions.length > 1) {
                                    setSelectedQuestionPosition(index);
                                    setShowQuestionSelector(true);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                disabled={questions.filter(q => q.metric_category === question.category).length <= 1}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Questions Section */}
                  {surveyData.questions.filter(q => !q.required).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 text-sm">Additional Questions</h4>
                      <div className="space-y-2">
                        {surveyData.questions.filter(q => !q.required).map((question, index) => {
                          const actualIndex = surveyData.questions.filter(q => !q.required).findIndex(q => q.id === question.id) + surveyData.questions.filter(q => q.required).length;
                          return (
                            <div key={question.id} className="group relative p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                              <div className="flex items-start space-x-3">
                                <div className={`w-5 h-5 ${getCategoryColor(question.category)} text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0`}>
                                  {actualIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm">
                                    {question.text}
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                                      {question.categoryName}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSurveyData(prev => ({
                                    ...prev,
                                    questions: prev.questions.filter(q => q.id !== question.id)
                                  }))}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          size="lg" 
          onClick={() => setCurrentStep(3)}
          disabled={surveyData.questions.length === 0}
          className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Continue to Summary
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Custom Question Dialog */}
      <Dialog open={showCustomQuestion} onOpenChange={setShowCustomQuestion}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-green-600" />
              <span>Add Custom Question</span>
            </DialogTitle>
            <DialogDescription>
              Create your own question and assign it to a metric category for proper analytics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-text">Question Text</Label>
              <Input
                id="question-text"
                placeholder="Enter your custom question..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-category">Category</Label>
              <Select value={customCategory} onValueChange={setCustomCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((metric) => (
                    <SelectItem key={metric.category} value={metric.category}>
                      {metric.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCustomQuestion(false)}>
                Cancel
              </Button>
              <Button onClick={addCustomQuestion} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                Add Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Selector Dialog */}
      <Dialog open={showQuestionSelector} onOpenChange={setShowQuestionSelector}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              <span>Select Question</span>
            </DialogTitle>
            <DialogDescription>
              Choose a different question for this position. Only questions from the same category are shown.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedQuestionPosition !== null && (() => {
              const currentQuestion = surveyData.questions.find(q => q.required && q.order === selectedQuestionPosition);
              const availableQuestions = questions.filter(q => q.metric_category === currentQuestion?.category);
              
              return (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">
                      Position {selectedQuestionPosition + 1}: {currentQuestion?.categoryName}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Select from {availableQuestions.length} available questions
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {availableQuestions.map((question, index) => (
                      <div 
                        key={question.id}
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        onClick={() => {
                          replaceRequiredQuestion(selectedQuestionPosition, question);
                          setShowQuestionSelector(false);
                          setSelectedQuestionPosition(null);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 ${getCategoryColor(question.metric_category)} text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm leading-relaxed">
                              {question.question_text}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                                {question.metric_name}
                              </Badge>
                              {question.sensitive && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                  Sensitive
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setShowQuestionSelector(false);
                setSelectedQuestionPosition(null);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
  };

  // Launch survey function
  const handleLaunchSurvey = async () => {
    try {
      // Call the survey launch API
      const response = await surveyService.launchSurvey({
        title: surveyData.title,
        description: surveyData.description,
        questions: surveyData.questions,
        target_audience: surveyData.targetAudience || 'all',
        path: surveyData.path,
        schedule: surveyData.schedule,
        branding: surveyData.branding
      });
      
      console.log('Survey launched:', response);
      
      toast({
        title: "Survey Launched Successfully!",
        description: response.message,
      });
      
      onComplete(surveyData);
    } catch (error) {
      console.error('Launch failed:', error);
      toast({
        title: "Launch Failed",
        description: "There was an error launching your survey. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Main component return
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">
              {currentStep === 1 && 'Choose Path'}
              {currentStep === 2 && 'Configure Survey'}
              {currentStep === 3 && 'Review Summary'}
              {currentStep === 4 && 'Schedule & Settings'}
              {currentStep === 5 && 'Launch'}
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      {/* Survey Launch Modal */}
      <SurveyLaunchModal
        isOpen={showLaunchModal}
        onClose={() => setShowLaunchModal(false)}
        surveyData={surveyData}
        onLaunch={handleLaunchSurvey}
      />
    </div>
  );
};

export default MultiStepSurveyBuilder;
