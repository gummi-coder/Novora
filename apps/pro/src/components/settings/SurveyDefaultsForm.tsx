
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SettingSection } from "./SettingSection";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Check, ChevronDown, Copy, Edit, EyeOff, Mail, MessageSquare, Phone, Plus, Save, Trash } from "lucide-react";

// Define form schema
const surveyDefaultsSchema = z.object({
  reminderDays: z.number().min(0).max(30),
  maxReminders: z.number().min(0).max(10),
  emailDelivery: z.boolean().default(true),
  smsDelivery: z.boolean().default(false),
  slackDelivery: z.boolean().default(false),
  msTeamsDelivery: z.boolean().default(false),
  defaultAnonymity: z.string(),
  defaultLanguage: z.string(),
  surveyIntroText: z.string().optional(),
  surveyThankYouText: z.string().optional(),
  aiSuggestions: z.boolean().default(true),
});

type SurveyDefaultsValues = z.infer<typeof surveyDefaultsSchema>;

// Template question types
const questionTypes = [
  { id: "likert5", name: "5-Point Scale", selected: true },
  { id: "likert7", name: "7-Point Scale", selected: false },
  { id: "openEnded", name: "Open-Ended", selected: true },
  { id: "multipleChoice", name: "Multiple Choice", selected: false },
  { id: "boolean", name: "Yes/No", selected: true },
  { id: "nps", name: "Net Promoter Score", selected: true },
];

// Mock template questions
const templateQuestions = [
  {
    id: "1",
    text: "How satisfied are you with your current role?",
    type: "likert5",
    category: "Job Satisfaction",
  },
  {
    id: "2",
    text: "Do you feel your work is meaningful and contributes to our mission?",
    type: "likert5",
    category: "Engagement",
  },
  {
    id: "3",
    text: "What changes would improve your work experience?",
    type: "openEnded",
    category: "Improvement",
  },
  {
    id: "4",
    text: "How likely are you to recommend our company as a place to work?",
    type: "nps",
    category: "eNPS",
  },
  {
    id: "5",
    text: "Do you have the resources you need to perform your job effectively?",
    type: "boolean",
    category: "Resources",
  },
];

export function SurveyDefaultsForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isQuestionOpen, setIsQuestionOpen] = React.useState(false);
  const [selectedQuestion, setSelectedQuestion] = React.useState<string | null>(null);
  const [templateQuestionsState, setTemplateQuestionsState] = React.useState(templateQuestions);

  // Setup form
  const form = useForm<SurveyDefaultsValues>({
    resolver: zodResolver(surveyDefaultsSchema),
    defaultValues: {
      reminderDays: 2,
      maxReminders: 3,
      emailDelivery: true,
      smsDelivery: false,
      slackDelivery: false,
      msTeamsDelivery: false,
      defaultAnonymity: "partial",
      defaultLanguage: "en-US",
      surveyIntroText: "We value your feedback. This survey will help us improve your work experience.",
      surveyThankYouText: "Thank you for completing the survey. Your feedback is important to us.",
      aiSuggestions: true,
    },
  });

  // Handle form submission
  const onSubmit = (data: SurveyDefaultsValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Survey defaults:", data);
      console.log("Template questions:", templateQuestionsState);
      toast({
        title: "Survey defaults updated",
        description: "Your survey default settings have been saved.",
      });
      setIsLoading(false);
    }, 1000);
  };

  // Handle adding a new template question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: `new-${Date.now()}`,
      text: "New question",
      type: "likert5",
      category: "General",
    };
    
    setTemplateQuestionsState([...templateQuestionsState, newQuestion]);
    setSelectedQuestion(newQuestion.id);
    toast({
      title: "Question added",
      description: "New template question has been added.",
    });
  };

  // Handle editing a template question
  const handleEditQuestion = (id: string) => {
    setSelectedQuestion(id);
    toast({
      description: "Edit the question in the form below.",
    });
  };

  // Handle deleting a template question
  const handleDeleteQuestion = (id: string) => {
    setTemplateQuestionsState(templateQuestionsState.filter(q => q.id !== id));
    if (selectedQuestion === id) {
      setSelectedQuestion(null);
    }
    toast({
      title: "Question deleted",
      description: "Template question has been removed.",
    });
  };

  // Handle copying a template question
  const handleCopyQuestion = (id: string) => {
    const questionToCopy = templateQuestionsState.find(q => q.id === id);
    if (questionToCopy) {
      const newQuestion = {
        ...questionToCopy,
        id: `copy-${Date.now()}`,
        text: `${questionToCopy.text} (Copy)`,
      };
      setTemplateQuestionsState([...templateQuestionsState, newQuestion]);
      toast({
        title: "Question duplicated",
        description: "Template question has been copied.",
      });
    }
  };

  // Toggle question type selection
  const toggleQuestionType = (id: string) => {
    const updatedTypes = questionTypes.map(type => 
      type.id === id ? { ...type, selected: !type.selected } : type
    );
    console.log("Updated question types:", updatedTypes);
    toast({
      description: `${id} question type ${updatedTypes.find(t => t.id === id)?.selected ? "enabled" : "disabled"}.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Reminder Settings */}
          <SettingSection
            title="Reminder Settings"
            description="Configure default settings for survey reminders"
          >
            <div className="space-y-6 max-w-xl">
              <FormField
                control={form.control}
                name="reminderDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Before First Reminder</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of days to wait before sending the first reminder
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxReminders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Number of Reminders</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of reminders to send for unanswered surveys
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SettingSection>

          {/* Delivery Channels */}
          <SettingSection
            title="Delivery Channels"
            description="Select default channels for survey distribution"
          >
            <div className="space-y-4 max-w-xl">
              <FormField
                control={form.control}
                name="emailDelivery"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <FormLabel>Email Delivery</FormLabel>
                        <FormDescription>
                          Send surveys via email
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smsDelivery"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <FormLabel>SMS Delivery</FormLabel>
                        <FormDescription>
                          Send surveys via text message
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slackDelivery"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <FormLabel>Slack Delivery</FormLabel>
                        <FormDescription>
                          Send surveys via Slack messages
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="msTeamsDelivery"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <FormLabel>Microsoft Teams Delivery</FormLabel>
                        <FormDescription>
                          Send surveys via Microsoft Teams
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </SettingSection>

          {/* Survey Configuration */}
          <SettingSection
            title="Survey Configuration"
            description="Set default options for new surveys"
          >
            <div className="space-y-6 max-w-xl">
              <FormField
                control={form.control}
                name="defaultAnonymity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Anonymity Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select anonymity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full">Fully Anonymous</SelectItem>
                        <SelectItem value="partial">Partially Anonymous</SelectItem>
                        <SelectItem value="identified">Identified Responses</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default level of anonymity for new surveys
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Survey Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default language for new surveys
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surveyIntroText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Introduction Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter default survey introduction text"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Default text shown at the beginning of surveys
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surveyThankYouText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Thank You Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter default thank you text"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Default text shown after survey completion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SettingSection>

          {/* AI Features */}
          <SettingSection
            title="AI Features"
            description="Configure AI-powered features for survey creation and analysis"
          >
            <div className="space-y-4 max-w-xl">
              <FormField
                control={form.control}
                name="aiSuggestions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>AI Question Suggestions</FormLabel>
                      <FormDescription>
                        Allow AI to suggest follow-up questions based on responses
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </SettingSection>

          {/* Template Questions */}
          <SettingSection
            title="Template Questions"
            description="Configure default question templates for surveys"
            footer={
              <Button 
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question Template</span>
              </Button>
            }
            isLoading={isLoading}
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Question Types</h3>
                <div className="flex flex-wrap gap-2">
                  {questionTypes.map((type) => (
                    <Button
                      key={type.id}
                      type="button"
                      variant={type.selected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleQuestionType(type.id)}
                      className="flex items-center gap-1"
                    >
                      {type.selected && <Check className="h-3 w-3" />}
                      <span>{type.name}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Select which question types to include in your surveys by default
                </p>
              </div>

              <Collapsible
                open={isQuestionOpen}
                onOpenChange={setIsQuestionOpen}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Default Question Templates</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {isQuestionOpen ? "Hide" : "Show"} All
                      <ChevronDown className={`h-4 w-4 ml-1 ${isQuestionOpen ? 'rotate-180' : ''} transition-transform`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="mt-4 space-y-2">
                    {templateQuestionsState.map((question) => (
                      <div 
                        key={question.id} 
                        className={`border rounded-md p-3 ${selectedQuestion === question.id ? 'border-primary ring-1 ring-primary' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{question.text}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="bg-muted text-xs px-2 py-0.5 rounded">
                                {question.type}
                              </span>
                              <span className="bg-muted text-xs px-2 py-0.5 rounded">
                                {question.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditQuestion(question.id)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyQuestion(question.id)}
                            >
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {templateQuestionsState.length === 0 && (
                      <div className="border border-dashed rounded-md p-6 text-center text-muted-foreground">
                        <p>No template questions defined yet.</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={handleAddQuestion}
                        >
                          Add Your First Template
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {selectedQuestion && (
                <div className="border rounded-md p-4 mt-4 bg-muted/30">
                  <h3 className="font-medium mb-3">Edit Question Template</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Question Text
                      </label>
                      <Textarea 
                        value={templateQuestionsState.find(q => q.id === selectedQuestion)?.text || ''}
                        onChange={(e) => {
                          const updatedQuestions = templateQuestionsState.map(q => 
                            q.id === selectedQuestion ? { ...q, text: e.target.value } : q
                          );
                          setTemplateQuestionsState(updatedQuestions);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Question Type
                        </label>
                        <Select
                          value={templateQuestionsState.find(q => q.id === selectedQuestion)?.type || ''}
                          onValueChange={(value) => {
                            const updatedQuestions = templateQuestionsState.map(q => 
                              q.id === selectedQuestion ? { ...q, type: value } : q
                            );
                            setTemplateQuestionsState(updatedQuestions);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="likert5">5-Point Scale</SelectItem>
                            <SelectItem value="likert7">7-Point Scale</SelectItem>
                            <SelectItem value="openEnded">Open-Ended</SelectItem>
                            <SelectItem value="multipleChoice">Multiple Choice</SelectItem>
                            <SelectItem value="boolean">Yes/No</SelectItem>
                            <SelectItem value="nps">Net Promoter Score</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Category
                        </label>
                        <Select
                          value={templateQuestionsState.find(q => q.id === selectedQuestion)?.category || ''}
                          onValueChange={(value) => {
                            const updatedQuestions = templateQuestionsState.map(q => 
                              q.id === selectedQuestion ? { ...q, category: value } : q
                            );
                            setTemplateQuestionsState(updatedQuestions);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engagement">Engagement</SelectItem>
                            <SelectItem value="Job Satisfaction">Job Satisfaction</SelectItem>
                            <SelectItem value="Improvement">Improvement</SelectItem>
                            <SelectItem value="eNPS">eNPS</SelectItem>
                            <SelectItem value="Resources">Resources</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedQuestion(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedQuestion(null);
                          toast({
                            title: "Question updated",
                            description: "Template question has been saved.",
                          });
                        }}
                        className="flex items-center gap-1"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Question</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SettingSection>
        </div>
      </form>
    </Form>
  );
}
