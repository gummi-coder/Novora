import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  RotateCcw,
  Bell,
  Users,
  Mail,
  Link,
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import {
  AutoPilotPlan,
  ReminderSettings,
  QuestionSet,
  autoPilotService
} from "@/services/autoPilot";

interface AutoPilotPlanBuilderProps {
  onSave: (plan: AutoPilotPlan) => void;
  onCancel: () => void;
  initialPlan?: AutoPilotPlan;
}

const AutoPilotPlanBuilder: React.FC<AutoPilotPlanBuilderProps> = ({
  onSave,
  onCancel,
  initialPlan
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Plan data
  const [plan, setPlan] = useState<AutoPilotPlan>({
    name: "",
    description: "",
    frequency: "weekly",
    startDate: new Date(),
    isActive: false,
    questionRotation: true,
    reminderSettings: {
      enabled: true,
      frequency: "weekly",
      maxReminders: 2,
      delayDays: 3,
      messageTemplate: "Hi! We noticed you haven't completed our survey yet. Your feedback is important to us. Please take a moment to share your thoughts.",
      excludeResponded: true,
      autoCloseAfterDays: 10,
      reminderDays: [3, 7]
    },
    distributionChannels: ["email"],
    targetAudience: ["all_employees"]
  });

  // Question sets
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<string>("");

  // Preview data
  const [previewData, setPreviewData] = useState({
    nextSurveyDate: new Date(),
    estimatedSurveys: 0,
    reminderSchedule: [] as Date[]
  });

  const frequencies = [
    { value: "daily", label: "Daily", description: "Every day" },
    { value: "weekly", label: "Weekly", description: "Every week" },
    { value: "biweekly", label: "Bi-weekly", description: "Every 2 weeks" },
    { value: "monthly", label: "Monthly", description: "Every month" },
    { value: "quarterly", label: "Quarterly", description: "Every 3 months" }
  ];

  const reminderFrequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-weekly" }
  ];

  const distributionChannels = [
    { id: "email", name: "Email", icon: Mail, description: "Send via email" },
    { id: "link", name: "Direct Link", icon: Link, description: "Shareable link" },
    { id: "qr", name: "QR Code", icon: Link, description: "QR code for mobile" }
  ];

  const targetAudiences = [
    { id: "all_employees", name: "All Employees", description: "Send to all employees" },
    { id: "managers", name: "Managers Only", description: "Send to managers only" },
    { id: "departments", name: "Specific Departments", description: "Select specific departments" },
    { id: "custom", name: "Custom List", description: "Upload custom email list" }
  ];

  // Load initial data
  useEffect(() => {
    if (initialPlan) {
      setPlan(initialPlan);
    }
    loadQuestionSets();
  }, [initialPlan]);

  // Calculate preview data when plan changes
  useEffect(() => {
    calculatePreviewData();
  }, [plan]);

  const loadQuestionSets = async () => {
    try {
      const sets = await autoPilotService.getQuestionSets();
      setQuestionSets(sets);
      if (sets.length > 0 && !selectedQuestionSet) {
        setSelectedQuestionSet(sets[0].id);
      }
    } catch (error) {
      console.error('Error loading question sets:', error);
    }
  };

  const calculatePreviewData = () => {
    const nextDate = autoPilotService.calculateNextSurveyDate(plan);
    const endDate = plan.endDate || addMonths(plan.startDate, 12);
    
    // Calculate estimated number of surveys
    let estimatedSurveys = 0;
    let currentDate = new Date(plan.startDate);
    
    while (currentDate <= endDate) {
      estimatedSurveys++;
      currentDate = autoPilotService.calculateNextSurveyDate(plan, currentDate);
    }

    // Calculate reminder schedule for first survey
    const reminderSchedule: Date[] = [];
    if (plan.reminderSettings.enabled) {
      for (const reminderDay of plan.reminderSettings.reminderDays) {
        const reminderDate = autoPilotService.calculateReminderDate(nextDate, reminderDay);
        reminderSchedule.push(reminderDate);
      }
    }

    setPreviewData({
      nextSurveyDate: nextDate,
      estimatedSurveys,
      reminderSchedule
    });
  };

  const handleSave = async () => {
    try {
      const validation = autoPilotService.validatePlan(plan);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(", "),
          variant: "destructive"
        });
        return;
      }

      onSave(plan);
      toast({
        title: "Plan Saved",
        description: "Auto-pilot plan saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!plan.id) return;
    
    try {
      await autoPilotService.deletePlan(plan.id);
      setShowDeleteDialog(false);
      toast({
        title: "Plan Deleted",
        description: "Auto-pilot plan deleted successfully.",
      });
      onCancel();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input
                    value={plan.name}
                    onChange={(e) => setPlan(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Monthly Employee Pulse"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={plan.description}
                    onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your auto-pilot plan..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Scheduling</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency *</Label>
                    <Select
                      value={plan.frequency}
                      onValueChange={(value: any) => setPlan(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            <div>
                              <div className="font-medium">{freq.label}</div>
                              <div className="text-sm text-gray-500">{freq.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {plan.startDate ? format(plan.startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={plan.startDate}
                          onSelect={(date) => date && setPlan(prev => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {plan.endDate ? format(plan.endDate, "PPP") : "Pick a date (optional)"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={plan.endDate}
                        onSelect={(date) => setPlan(prev => ({ ...prev, endDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Question Rotation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5" />
                  <span>Question Rotation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="questionRotation"
                    checked={plan.questionRotation}
                    onChange={(e) => setPlan(prev => ({ ...prev, questionRotation: e.target.checked }))}
                  />
                  <Label htmlFor="questionRotation">Enable question rotation</Label>
                </div>
                
                {plan.questionRotation && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Set</Label>
                      <Select
                        value={selectedQuestionSet}
                        onValueChange={setSelectedQuestionSet}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a question set" />
                        </SelectTrigger>
                        <SelectContent>
                          {questionSets.map((set) => (
                            <SelectItem key={set.id} value={set.id}>
                              <div>
                                <div className="font-medium">{set.name}</div>
                                <div className="text-sm text-gray-500">{set.questions.length} questions</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedQuestionSet && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium mb-2">Selected Questions:</h4>
                        <div className="space-y-2">
                          {questionSets.find(s => s.id === selectedQuestionSet)?.questions.map((q, index) => (
                            <div key={q.id} className="text-sm">
                              <span className="font-medium">{index + 1}.</span> {q.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Distribution Channels</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {distributionChannels.map((channel) => {
                      const Icon = channel.icon;
                      const isSelected = plan.distributionChannels.includes(channel.id);
                      
                      return (
                        <div
                          key={channel.id}
                          className={cn(
                            "border-2 rounded-lg p-4 cursor-pointer transition-all",
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          onClick={() => {
                            if (isSelected) {
                              setPlan(prev => ({
                                ...prev,
                                distributionChannels: prev.distributionChannels.filter(c => c !== channel.id)
                              }));
                            } else {
                              setPlan(prev => ({
                                ...prev,
                                distributionChannels: [...prev.distributionChannels, channel.id]
                              }));
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5" />
                            <div>
                              <h3 className="font-medium">{channel.name}</h3>
                              <p className="text-sm text-gray-500">{channel.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select
                    value={plan.targetAudience[0] || ""}
                    onValueChange={(value) => setPlan(prev => ({ ...prev, targetAudience: [value] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudiences.map((audience) => (
                        <SelectItem key={audience.id} value={audience.id}>
                          <div>
                            <div className="font-medium">{audience.name}</div>
                            <div className="text-sm text-gray-500">{audience.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Reminder Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Reminder Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remindersEnabled"
                    checked={plan.reminderSettings.enabled}
                    onChange={(e) => setPlan(prev => ({
                      ...prev,
                      reminderSettings: { ...prev.reminderSettings, enabled: e.target.checked }
                    }))}
                  />
                  <Label htmlFor="remindersEnabled">Enable automated reminders</Label>
                </div>
                
                {plan.reminderSettings.enabled && (
                  <div className="space-y-4">
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                           <Label>Reminder Days</Label>
                           <div className="text-sm text-gray-600 mb-2">
                             Send reminders on specific days after survey is sent
                           </div>
                           <div className="space-y-2">
                             <div className="flex items-center space-x-2">
                               <input
                                 type="checkbox"
                                 id="day3"
                                 checked={plan.reminderSettings.reminderDays.includes(3)}
                                 onChange={(e) => {
                                   const newDays = e.target.checked 
                                     ? [...plan.reminderSettings.reminderDays, 3]
                                     : plan.reminderSettings.reminderDays.filter(d => d !== 3);
                                   setPlan(prev => ({
                                     ...prev,
                                     reminderSettings: { 
                                       ...prev.reminderSettings, 
                                       reminderDays: newDays,
                                       maxReminders: newDays.length
                                     }
                                   }));
                                 }}
                               />
                               <Label htmlFor="day3">Day 3: Reminder to non-responders</Label>
                             </div>
                             <div className="flex items-center space-x-2">
                               <input
                                 type="checkbox"
                                 id="day7"
                                 checked={plan.reminderSettings.reminderDays.includes(7)}
                                 onChange={(e) => {
                                   const newDays = e.target.checked 
                                     ? [...plan.reminderSettings.reminderDays, 7]
                                     : plan.reminderSettings.reminderDays.filter(d => d !== 7);
                                   setPlan(prev => ({
                                     ...prev,
                                     reminderSettings: { 
                                       ...prev.reminderSettings, 
                                       reminderDays: newDays,
                                       maxReminders: newDays.length
                                     }
                                   }));
                                 }}
                               />
                               <Label htmlFor="day7">Day 7: Final reminder before closing survey</Label>
                             </div>
                             <div className="flex items-center space-x-2">
                               <input
                                 type="checkbox"
                                 id="day10"
                                 checked={plan.reminderSettings.reminderDays.includes(10)}
                                 onChange={(e) => {
                                   const newDays = e.target.checked 
                                     ? [...plan.reminderSettings.reminderDays, 10]
                                     : plan.reminderSettings.reminderDays.filter(d => d !== 10);
                                   setPlan(prev => ({
                                     ...prev,
                                     reminderSettings: { 
                                       ...prev.reminderSettings, 
                                       reminderDays: newDays,
                                       maxReminders: newDays.length
                                     }
                                   }));
                                 }}
                               />
                               <Label htmlFor="day10">Day 10: Extended reminder (for 10+ day cycles)</Label>
                             </div>
                           </div>
                         </div>
                                               <div className="space-y-2">
                          <Label>Auto-Close After (Days)</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant={plan.reminderSettings.autoCloseAfterDays === 7 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPlan(prev => ({
                                ...prev,
                                reminderSettings: { ...prev.reminderSettings, autoCloseAfterDays: 7 }
                              }))}
                            >
                              Fast Cycle (7 days)
                            </Button>
                            <Button
                              type="button"
                              variant={plan.reminderSettings.autoCloseAfterDays === 10 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPlan(prev => ({
                                ...prev,
                                reminderSettings: { ...prev.reminderSettings, autoCloseAfterDays: 10 }
                              }))}
                            >
                              Standard (10 days)
                            </Button>
                          </div>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={plan.reminderSettings.autoCloseAfterDays}
                            onChange={(e) => setPlan(prev => ({
                              ...prev,
                              reminderSettings: { ...prev.reminderSettings, autoCloseAfterDays: parseInt(e.target.value) }
                            }))}
                          />
                          <div className="text-sm text-gray-500">
                            Survey will automatically close after this many days. Choose fast cycle for quick feedback or standard for more time.
                          </div>
                        </div>
                     </div>
                    
                    <div className="space-y-2">
                      <Label>Reminder Message Template</Label>
                      <Textarea
                        value={plan.reminderSettings.messageTemplate}
                        onChange={(e) => setPlan(prev => ({
                          ...prev,
                          reminderSettings: { ...prev.reminderSettings, messageTemplate: e.target.value }
                        }))}
                        rows={4}
                        placeholder="Customize your reminder message..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="excludeResponded"
                        checked={plan.reminderSettings.excludeResponded}
                        onChange={(e) => setPlan(prev => ({
                          ...prev,
                          reminderSettings: { ...prev.reminderSettings, excludeResponded: e.target.checked }
                        }))}
                      />
                      <Label htmlFor="excludeResponded">Exclude users who have already responded</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Next Survey Date</Label>
                      <div className="text-sm font-medium">
                        {format(previewData.nextSurveyDate, "PPP")}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Surveys</Label>
                      <div className="text-sm font-medium">
                        {previewData.estimatedSurveys} surveys
                      </div>
                    </div>
                  </div>
                  
                                     {plan.reminderSettings.enabled && previewData.reminderSchedule.length > 0 && (
                     <div className="space-y-2">
                       <Label>Reminder Schedule (First Survey)</Label>
                       <div className="space-y-1">
                         {previewData.reminderSchedule.map((date, index) => (
                           <div key={index} className="text-sm">
                             Day {plan.reminderSettings.reminderDays[index]}: {format(date, "PPP")}
                             {plan.reminderSettings.reminderDays[index] === 7 && " (Final reminder)"}
                           </div>
                         ))}
                       </div>
                       <div className="text-sm text-gray-500 mt-2">
                         Survey will auto-close on: {format(
                           new Date(previewData.nextSurveyDate.getTime() + plan.reminderSettings.autoCloseAfterDays * 24 * 60 * 60 * 1000),
                           "PPP"
                         )}
                       </div>
                     </div>
                   )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { id: 1, title: "Basic Setup", description: "Plan name and scheduling" },
    { id: 2, title: "Questions & Distribution", description: "Question rotation and channels" },
    { id: 3, title: "Reminders & Preview", description: "Reminder settings and preview" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {initialPlan ? 'Edit Auto-Pilot Plan' : 'Create Auto-Pilot Plan'}
          </h2>
          <p className="text-gray-600 mt-1">
            Set up automated survey sending with smart scheduling and reminders
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {initialPlan && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
              <Button
                variant={plan.isActive ? "outline" : "default"}
                onClick={async () => {
                  try {
                    if (plan.isActive) {
                      await autoPilotService.deactivatePlan(plan.id!);
                      setPlan(prev => ({ ...prev, isActive: false }));
                    } else {
                      await autoPilotService.activatePlan(plan.id!);
                      setPlan(prev => ({ ...prev, isActive: true }));
                    }
                  } catch (error) {
                    console.error('Error toggling plan status:', error);
                  }
                }}
                className="flex items-center space-x-2"
              >
                {plan.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{plan.isActive ? 'Pause' : 'Activate'}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2",
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <div className="flex items-center space-x-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          
          {currentStep < steps.length ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Plan
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Auto-Pilot Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this auto-pilot plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutoPilotPlanBuilder;
