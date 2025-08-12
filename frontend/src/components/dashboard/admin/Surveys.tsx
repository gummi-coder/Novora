import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Settings, 
  Bell, 
  Eye, 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Star,
  Target,
  Zap
} from "lucide-react";

interface SurveyQuestion {
  id: string;
  text: string;
  type: "rating" | "text" | "multiple_choice" | "yes_no";
  required: boolean;
  options?: string[];
}

interface SurveyResponse {
  employeeId: string;
  employeeName: string;
  team: string;
  submittedAt: string;
  answers: {
    questionId: string;
    answer: string | number;
  }[];
}

interface Survey {
  id: string;
  title: string;
  team: string;
  status: "Draft" | "Scheduled" | "Active" | "Completed" | "Archived";
  frequency: "One-time" | "Weekly" | "Monthly" | "Quarterly";
  nextSurvey?: string;
  lastSent?: string;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  responseRate: number;
  averageScore?: number;
  totalParticipants: number;
  description: string;
  reminderSettings: {
    enabled: boolean;
    frequency: "daily" | "weekly";
    message: string;
  };
}

const statusBadge = (s: Survey["status"]) => {
  switch (s) {
    case "Draft": return "bg-yellow-100 text-yellow-700";
    case "Scheduled": return "bg-blue-100 text-blue-700";
    case "Active": return "bg-green-100 text-green-700";
    case "Completed": return "bg-purple-100 text-purple-700";
    case "Archived": return "bg-gray-100 text-gray-700";
  }
};

const Surveys = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Modal states
  const [showSurveyDetails, setShowSurveyDetails] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  
  // Form states
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<"daily" | "weekly">("weekly");
  const [reminderMessage, setReminderMessage] = useState("");

  const surveys = useMemo<Survey[]>(
    () => [
      {
        id: "1",
        title: "Q1 Team Engagement Survey",
        team: "Engineering",
        status: "Scheduled",
        frequency: "Quarterly",
        nextSurvey: "2024-04-01",
        questions: [
          { id: "q1", text: "How satisfied are you with your current role?", type: "rating", required: true },
          { id: "q2", text: "How would you rate team collaboration?", type: "rating", required: true },
          { id: "q3", text: "What would improve your work experience?", type: "text", required: false },
          { id: "q4", text: "Do you feel valued by your manager?", type: "yes_no", required: true },
          { id: "q5", text: "Which areas need improvement?", type: "multiple_choice", required: true, options: ["Communication", "Processes", "Tools", "Leadership"] }
        ],
        responses: [],
        responseRate: 0,
        totalParticipants: 12,
        description: "Quarterly engagement survey to measure team satisfaction and identify improvement areas.",
        reminderSettings: {
          enabled: true,
          frequency: "weekly",
          message: "Please complete the Q1 Team Engagement Survey by Friday."
        }
      },
      {
        id: "2",
        title: "Monthly Pulse Check",
        team: "Sales",
        status: "Active",
        frequency: "Monthly",
        lastSent: "2024-01-15",
        questions: [
          { id: "q1", text: "How motivated are you this month?", type: "rating", required: true },
          { id: "q2", text: "Rate your work-life balance", type: "rating", required: true },
          { id: "q3", text: "Any concerns or suggestions?", type: "text", required: false }
        ],
        responses: [
          {
            employeeId: "1",
            employeeName: "Sarah Johnson",
            team: "Sales",
            submittedAt: "2024-01-16",
            answers: [
              { questionId: "q1", answer: 4 },
              { questionId: "q2", answer: 3 },
              { questionId: "q3", answer: "Great team support this month!" }
            ]
          },
          {
            employeeId: "2",
            employeeName: "Michael Chen",
            team: "Sales",
            submittedAt: "2024-01-17",
            answers: [
              { questionId: "q1", answer: 5 },
              { questionId: "q2", answer: 4 },
              { questionId: "q3", answer: "Could use more flexible hours" }
            ]
          }
        ],
        responseRate: 67,
        averageScore: 4.2,
        totalParticipants: 3,
        description: "Monthly pulse check to monitor team morale and identify quick wins.",
        reminderSettings: {
          enabled: true,
          frequency: "daily",
          message: "Don't forget to complete your monthly pulse check!"
        }
      },
      {
        id: "3",
        title: "Culture Assessment",
        team: "Marketing",
        status: "Completed",
        frequency: "One-time",
        lastSent: "2023-12-01",
        questions: [
          { id: "q1", text: "How well does our culture align with your values?", type: "rating", required: true },
          { id: "q2", text: "Rate the inclusivity of our workplace", type: "rating", required: true },
          { id: "q3", text: "What cultural aspects could be improved?", type: "text", required: false }
        ],
        responses: [
          {
            employeeId: "3",
            employeeName: "Emily Rodriguez",
            team: "Marketing",
            submittedAt: "2023-12-02",
            answers: [
              { questionId: "q1", answer: 5 },
              { questionId: "q2", answer: 4 },
              { questionId: "q3", answer: "More team building activities would be great" }
            ]
          }
        ],
        responseRate: 100,
        averageScore: 4.5,
        totalParticipants: 1,
        description: "One-time culture assessment to evaluate workplace environment and values alignment.",
        reminderSettings: {
          enabled: false,
          frequency: "weekly",
          message: ""
        }
      },
      {
        id: "4",
        title: "Weekly Check-in",
        team: "HR",
        status: "Draft",
        frequency: "Weekly",
        questions: [
          { id: "q1", text: "How was your week?", type: "rating", required: true },
          { id: "q2", text: "Any blockers or challenges?", type: "text", required: false },
          { id: "q3", text: "What are your priorities for next week?", type: "text", required: true }
        ],
        responses: [],
        responseRate: 0,
        totalParticipants: 2,
        description: "Weekly check-in to stay connected with team members and address concerns quickly.",
        reminderSettings: {
          enabled: true,
          frequency: "daily",
          message: "Time for your weekly check-in!"
        }
      }
    ],
    []
  );

  const handleSchedule = (survey: Survey) => {
    setSelectedSurvey(survey);
    setScheduleDate(survey.nextSurvey || "");
    setShowScheduleModal(true);
  };

  const handleCustomize = (survey: Survey) => {
    setSelectedSurvey(survey);
    setCustomTitle(survey.title);
    setCustomDescription(survey.description);
    setShowCustomizeModal(true);
  };

  const handleReminders = (survey: Survey) => {
    setSelectedSurvey(survey);
    setReminderEnabled(survey.reminderSettings.enabled);
    setReminderFrequency(survey.reminderSettings.frequency);
    setReminderMessage(survey.reminderSettings.message);
    setShowRemindersModal(true);
  };

  const handleViewDetails = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowSurveyDetails(true);
  };

  const handleSaveSchedule = () => {
    if (!selectedSurvey || !scheduleDate) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for the survey.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Survey Scheduled",
      description: `${selectedSurvey.title} has been scheduled for ${scheduleDate} at ${scheduleTime || "9:00 AM"}`,
    });
    setShowScheduleModal(false);
  };

  const handleSaveCustomize = () => {
    if (!selectedSurvey) return;

    toast({
      title: "Survey Updated",
      description: `${selectedSurvey.title} has been customized successfully.`,
    });
    setShowCustomizeModal(false);
  };

  const handleSaveReminders = () => {
    if (!selectedSurvey) return;

    toast({
      title: "Reminders Updated",
      description: `Reminder settings for ${selectedSurvey.title} have been saved.`,
    });
    setShowRemindersModal(false);
  };

  const getQuestionTypeLabel = (type: SurveyQuestion["type"]) => {
    switch (type) {
      case "rating": return "Rating Scale";
      case "text": return "Text Response";
      case "multiple_choice": return "Multiple Choice";
      case "yes_no": return "Yes/No";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Surveys</h1>
            <p className="text-gray-600">
              Manage scheduling, customization and reminders for team engagement surveys
            </p>
          </div>
          <Button 
            onClick={() => navigate('/surveys/create')} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create Survey
          </Button>
        </div>

        {/* Enhanced Surveys Table */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Upcoming & Past Surveys</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Team scheduling overview and survey management
                </CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                {surveys.length} survey{surveys.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-sm text-gray-600 font-medium">
                    <th className="py-4 px-6">Survey</th>
                    <th className="py-4 px-6">Team</th>
                    <th className="py-4 px-6">Next/Last Survey</th>
                    <th className="py-4 px-6">Frequency</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Response Rate</th>
                    <th className="py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((survey) => (
                    <tr key={survey.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="cursor-pointer" onClick={() => handleViewDetails(survey)}>
                          <div className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {survey.title}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{survey.team}</td>
                      <td className="py-4 px-6 text-gray-700">
                        {survey.nextSurvey ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{survey.nextSurvey}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{survey.lastSent}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-600">{survey.frequency}</td>
                      <td className="py-4 px-6">
                        <Badge className={`${statusBadge(survey.status)} px-2 py-1 text-xs font-medium`}>
                          {survey.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        {survey.status === "Completed" || survey.status === "Active" ? (
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">
                              {survey.responseRate}%
                            </div>
                            {survey.averageScore && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs text-gray-600">{survey.averageScore.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSchedule(survey)}
                            className="hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Schedule
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCustomize(survey)}
                            className="hover:bg-green-50 hover:border-green-200"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Customize
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReminders(survey)}
                            className="hover:bg-purple-50 hover:border-purple-200"
                          >
                            <Bell className="w-4 h-4 mr-1" />
                            Reminders
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {surveys.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No surveys found</p>
                <p className="text-gray-400 text-sm mt-1">Create your first survey to get started</p>
                <div className="mt-4">
                  <Button 
                    onClick={() => navigate('/surveys/create')} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Create Survey
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Survey Details Modal */}
      <Dialog open={showSurveyDetails} onOpenChange={setShowSurveyDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <span>{selectedSurvey?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedSurvey?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSurvey && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="responses">Responses</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold">{selectedSurvey.totalParticipants}</div>
                          <div className="text-sm text-gray-600">Participants</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold">{selectedSurvey.responseRate}%</div>
                          <div className="text-sm text-gray-600">Response Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {selectedSurvey.averageScore && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="text-2xl font-bold">{selectedSurvey.averageScore.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">Avg Score</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-2xl font-bold">{selectedSurvey.questions.length}</div>
                          <div className="text-sm text-gray-600">Questions</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Survey Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Team</Label>
                        <div className="text-gray-900">{selectedSurvey.team}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Frequency</Label>
                        <div className="text-gray-900">{selectedSurvey.frequency}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                        <Badge className={statusBadge(selectedSurvey.status)}>
                          {selectedSurvey.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          {selectedSurvey.nextSurvey ? "Next Survey" : "Last Sent"}
                        </Label>
                        <div className="text-gray-900">
                          {selectedSurvey.nextSurvey || selectedSurvey.lastSent}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="questions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Survey Questions</CardTitle>
                    <CardDescription>
                      {selectedSurvey.questions.length} questions in this survey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedSurvey.questions.map((question, index) => (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                                <Badge variant="outline" className="text-xs">
                                  {getQuestionTypeLabel(question.type)}
                                </Badge>
                                {question.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <div className="text-gray-900 font-medium">{question.text}</div>
                              {question.options && (
                                <div className="mt-2 space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="text-sm text-gray-600">
                                      • {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="responses" className="space-y-4">
                {selectedSurvey.responses.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Survey Responses</CardTitle>
                      <CardDescription>
                        {selectedSurvey.responses.length} responses received
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedSurvey.responses.map((response, index) => (
                          <div key={response.employeeId} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-medium text-gray-900">{response.employeeName}</div>
                                <div className="text-sm text-gray-600">{response.team} • {response.submittedAt}</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {response.answers.map((answer) => {
                                const question = selectedSurvey.questions.find(q => q.id === answer.questionId);
                                return (
                                  <div key={answer.questionId} className="text-sm">
                                    <div className="font-medium text-gray-700">{question?.text}</div>
                                    <div className="text-gray-900 mt-1">
                                      {typeof answer.answer === 'number' ? (
                                        <div className="flex items-center space-x-2">
                                          <div className="flex space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <Star 
                                                key={star} 
                                                className={`w-4 h-4 ${star <= answer.answer ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                              />
                                            ))}
                                          </div>
                                          <span className="text-gray-600">({answer.answer}/5)</span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-900">{answer.answer}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-500">No responses yet</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Responses will appear here once the survey is sent and completed
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                {selectedSurvey.responses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Response Rate Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-8 h-8 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold text-green-600">{selectedSurvey.responseRate}%</div>
                            <div className="text-sm text-gray-600">Response Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {selectedSurvey.averageScore && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Average Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <Star className="w-8 h-8 text-yellow-600" />
                            <div>
                              <div className="text-2xl font-bold text-yellow-600">
                                {selectedSurvey.averageScore.toFixed(1)}
                              </div>
                              <div className="text-sm text-gray-600">out of 5.0</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-500">No analytics available</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Analytics will appear here once responses are received
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span>Schedule Survey</span>
            </DialogTitle>
            <DialogDescription>
              Schedule {selectedSurvey?.title} for your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Survey Date</Label>
              <Input 
                type="date" 
                value={scheduleDate} 
                onChange={(e) => setScheduleDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Survey Time</Label>
              <Input 
                type="time" 
                value={scheduleTime} 
                onChange={(e) => setScheduleTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSchedule}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Schedule Survey
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customize Modal */}
      <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-green-600" />
              <span>Customize Survey</span>
            </DialogTitle>
            <DialogDescription>
              Update the title and description for {selectedSurvey?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Survey Title</Label>
              <Input 
                value={customTitle} 
                onChange={(e) => setCustomTitle(e.target.value)}
                className="mt-1"
                placeholder="Enter survey title"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea 
                value={customDescription} 
                onChange={(e) => setCustomDescription(e.target.value)}
                className="mt-1"
                placeholder="Enter survey description"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCustomizeModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCustomize}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminders Modal */}
      <Dialog open={showRemindersModal} onOpenChange={setShowRemindersModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="w-6 h-6 text-purple-600" />
              <span>Reminder Settings</span>
            </DialogTitle>
            <DialogDescription>
              Configure reminder settings for {selectedSurvey?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="reminder-enabled" 
                checked={reminderEnabled} 
                onCheckedChange={(checked) => setReminderEnabled(checked as boolean)}
              />
              <Label htmlFor="reminder-enabled" className="text-sm font-medium">
                Enable reminders
              </Label>
            </div>
            
            {reminderEnabled && (
              <>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Reminder Frequency</Label>
                  <Select value={reminderFrequency} onValueChange={(value: "daily" | "weekly") => setReminderFrequency(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Reminder Message</Label>
                  <Textarea 
                    value={reminderMessage} 
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className="mt-1"
                    placeholder="Enter custom reminder message"
                    rows={3}
                  />
                </div>
              </>
            )}
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRemindersModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveReminders}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Surveys;


