import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Eye,
  Save,
  ArrowLeft,
  Settings,
  Palette,
  Download,
  Share2,
  MoreHorizontal,
  Type,
  List,
  CheckSquare,
  MessageSquare,
  Star,
  Calendar,
  Hash,
  ToggleLeft,
  Image,
  FileText,
  Video,
  Link,
  Users,
  Target,
  BarChart3,
  Clock,
  Globe,
  Lock,
  Unlock,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Question types
const QUESTION_TYPES = [
  {
    id: "text",
    name: "Short Text",
    icon: Type,
    description: "Single line text input",
  },
  {
    id: "long_text",
    name: "Long Text",
    icon: FileText,
    description: "Multi-line text input",
  },
  {
    id: "multiple_choice",
    name: "Multiple Choice",
    icon: List,
    description: "Choose one from options",
  },
  {
    id: "checkbox",
    name: "Checkboxes",
    icon: CheckSquare,
    description: "Select multiple options",
  },
  {
    id: "rating",
    name: "Rating",
    icon: Star,
    description: "Rate on a scale",
  },
  {
    id: "date",
    name: "Date",
    icon: Calendar,
    description: "Select a date",
  },
  {
    id: "number",
    name: "Number",
    icon: Hash,
    description: "Numeric input",
  },
  {
    id: "email",
    name: "Email",
    icon: MessageSquare,
    description: "Email address input",
  },
  {
    id: "url",
    name: "URL",
    icon: Link,
    description: "Website URL input",
  },
];

// Form schema
const surveySchema = z.object({
  title: z.string().min(1, "Survey title is required"),
  description: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string().min(1, "Question title is required"),
    description: z.string().optional(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    settings: z.record(z.any()).optional(),
  })).min(1, "At least one question is required"),
});

type SurveyFormData = z.infer<typeof surveySchema>;

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  settings?: Record<string, any>;
}

const CreateSurvey = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveySettings, setSurveySettings] = useState({
    allowAnonymous: true,
    requireEmail: false,
    reminderFrequency: 'weekly',
    category: 'general',
    showProgress: true,
    allowSaveProgress: false,
    timeLimit: 0,
    maxResponses: 0,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdSurveyId, setCreatedSurveyId] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [],
    },
  });

  const addQuestion = useCallback((type: string) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: "",
      description: "",
      required: false,
      options: type === "multiple_choice" || type === "checkbox" ? ["Option 1"] : undefined,
      settings: {},
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    form.setValue("questions", [...questions, newQuestion]);
  }, [questions, form]);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    setQuestions(updatedQuestions);
    form.setValue("questions", updatedQuestions);
  }, [questions, form]);

  const removeQuestion = useCallback((id: string) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    setQuestions(updatedQuestions);
    form.setValue("questions", updatedQuestions);
  }, [questions, form]);

  const duplicateQuestion = useCallback((id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      const newQuestion: Question = {
        ...question,
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${question.title} (Copy)`,
      };
      setQuestions(prev => [...prev, newQuestion]);
      form.setValue("questions", [...questions, newQuestion]);
    }
  }, [questions, form]);

  const addOption = useCallback((questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options, `Option ${question.options.length + 1}`];
      updateQuestion(questionId, { options: newOptions });
    }
  }, [questions, updateQuestion]);

  const removeOption = useCallback((questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 1) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  }, [questions, updateQuestion]);

  const updateOption = useCallback((questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  }, [questions, updateQuestion]);

  const onSubmit = async (data: SurveyFormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create surveys",
          variant: "destructive",
        });
        navigate('/auth/signin');
        return;
      }

      // Transform questions to match backend format
      const transformedQuestions = questions.map((question, index) => ({
        text: question.title,
        type: question.type,
        required: question.required,
        order: index,
        options: question.options ? { choices: question.options } : null,
        allow_comments: false,
      }));

      const response = await fetch('http://localhost:8000/api/v1/surveys/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          is_anonymous: surveySettings.allowAnonymous,
          allow_comments: surveySettings.requireEmail,
          reminder_frequency: null,
          category: 'general',
          questions: transformedQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create survey');
      }

      const result = await response.json();
      
      // Set success state and shareable link
      setCreatedSurveyId(result.id);
      const link = `${window.location.origin}/survey/${result.id}`;
      setShareableLink(link);
      setShowSuccessModal(true);
      
      toast({
        title: "Survey created!",
        description: "Your survey has been successfully created and is ready to share.",
      });
    } catch (error) {
      console.error('Survey creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create survey. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Link copied!",
        description: "Survey link has been copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const openSurveyLink = () => {
    window.open(shareableLink, '_blank');
  };

  const renderQuestionEditor = (question: Question) => {
    const questionType = QUESTION_TYPES.find(t => t.id === question.type);
    const Icon = questionType?.icon || Type;

    return (
      <Card key={question.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              <Icon className="h-4 w-4 text-gray-500" />
              <Badge variant="secondary">{questionType?.name}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => duplicateQuestion(question.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              placeholder="Enter your question"
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Add a description or help text"
              value={question.description || ""}
              onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
            />
          </div>

          {(question.type === "multiple_choice" || question.type === "checkbox") && (
            <div className="space-y-3">
              <Label>Options</Label>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(question.id, index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {question.options && question.options.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(question.id, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOption(question.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={question.required}
              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor={`required-${question.id}`}>Required question</Label>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold text-gray-900">Create Survey</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Survey Settings</DialogTitle>
                    <DialogDescription>
                      Configure your survey preferences and behavior.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Allow anonymous responses</Label>
                      <input
                        type="checkbox"
                        checked={surveySettings.allowAnonymous}
                        onChange={(e) => setSurveySettings(prev => ({
                          ...prev,
                          allowAnonymous: e.target.checked
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require email address</Label>
                      <input
                        type="checkbox"
                        checked={surveySettings.requireEmail}
                        onChange={(e) => setSurveySettings(prev => ({
                          ...prev,
                          requireEmail: e.target.checked
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show progress bar</Label>
                      <input
                        type="checkbox"
                        checked={surveySettings.showProgress}
                        onChange={(e) => setSurveySettings(prev => ({
                          ...prev,
                          showProgress: e.target.checked
                        }))}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={questions.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Survey
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Survey Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Survey Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Survey Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter survey title"
                        {...form.register("title")}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your survey (optional)"
                        {...form.register("description")}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Questions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
                    {questions.length === 0 && (
                      <p className="text-sm text-gray-500">Add your first question to get started</p>
                    )}
                  </div>
                  
                  {questions.map(renderQuestionEditor)}
                </div>
              </form>
            </Form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle>Add Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {QUESTION_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <Button
                          key={type.id}
                          variant="outline"
                          className="w-full justify-start h-auto p-3"
                          onClick={() => addQuestion(type.id)}
                        >
                          <Icon className="h-4 w-4 mr-3 text-gray-500" />
                          <div className="text-left">
                            <div className="font-medium">{type.name}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Survey Stats */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Survey Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Questions:</span>
                      <span className="font-medium">{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Required:</span>
                      <span className="font-medium">
                        {questions.filter(q => q.required).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated time:</span>
                      <span className="font-medium">
                        {Math.max(1, Math.ceil(questions.length * 0.5))} min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Survey Preview</DialogTitle>
            <DialogDescription>
              This is how your survey will appear to respondents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{form.watch("title") || "Untitled Survey"}</h2>
              {form.watch("description") && (
                <p className="text-gray-600 mt-2">{form.watch("description")}</p>
              )}
            </div>
            
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <div>
                  <h3 className="font-medium">
                    {index + 1}. {question.title || "Untitled Question"}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {question.description && (
                    <p className="text-sm text-gray-500 mt-1">{question.description}</p>
                  )}
                </div>
                
                                 <div className="space-y-2">
                   {question.type === "text" && (
                     <Input placeholder="Enter your answer" disabled />
                   )}
                   {question.type === "long_text" && (
                     <Textarea placeholder="Enter your answer" disabled />
                   )}
                   {question.type === "multiple_choice" && question.options && (
                     <div className="space-y-2">
                       {question.options.map((option, optionIndex) => (
                         <div key={optionIndex} className="flex items-center space-x-2">
                           <input type="radio" disabled />
                           <span className="text-sm">{option}</span>
                         </div>
                       ))}
                     </div>
                   )}
                   {question.type === "checkbox" && question.options && (
                     <div className="space-y-2">
                       {question.options.map((option, optionIndex) => (
                         <div key={optionIndex} className="flex items-center space-x-2">
                           <input type="checkbox" disabled />
                           <span className="text-sm">{option}</span>
                         </div>
                       ))}
                     </div>
                   )}
                   {question.type === "rating" && (
                     <div className="flex space-x-1">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <Star key={star} className="h-6 w-6 text-gray-300" />
                       ))}
                     </div>
                   )}
                   {question.type === "date" && (
                     <Input type="date" disabled />
                   )}
                   {question.type === "number" && (
                     <Input type="number" placeholder="Enter a number" disabled />
                   )}
                   {question.type === "email" && (
                     <Input type="email" placeholder="Enter your email" disabled />
                   )}
                   {question.type === "url" && (
                     <Input type="url" placeholder="Enter a URL" disabled />
                   )}
                 </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Survey Created Successfully!</span>
            </DialogTitle>
            <DialogDescription>
              Your survey is now live and ready to collect responses. Share the link below with your audience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="survey-link">Shareable Link</Label>
              <div className="flex space-x-2">
                <Input
                  id="survey-link"
                  value={shareableLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={openSurveyLink}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Survey
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Share this link via email, messaging, or social media</p>
              <p>• Responses will appear in your dashboard analytics</p>
              <p>• You can edit the survey anytime from your dashboard</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateSurvey; 