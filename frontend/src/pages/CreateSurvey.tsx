import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  Save,
  ArrowLeft,
  Settings,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  Share2,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Star,
  TrendingUp,
  Heart,
  Target,
  BarChart3,
  Users,
  Users2,
  Award,
  Home,
  MessageCircle,
  CheckCircle,
  ExternalLink,
  Mail,
  MessageSquare,
  Smartphone,
  Link,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format, addDays, addMonths, setHours, setMinutes, getDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Measurement Framework Categories
const MEASUREMENT_CATEGORIES = [
  {
    id: "participation",
    name: "Participation",
    icon: Users,
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "happiness",
    name: "Happiness & Satisfaction", 
    icon: Heart,
    color: "bg-green-100 text-green-800",
  },
  {
    id: "enps",
    name: "eNPS & Engagement",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-800", 
  },
  {
    id: "value_alignment",
    name: "Value Alignment",
    icon: Target,
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "communication",
    name: "Communication",
    icon: MessageCircle,
    color: "bg-cyan-100 text-cyan-800",
  },
  {
    id: "career_growth",
    name: "Career & Growth",
    icon: TrendingUp,
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "manager_relationship",
    name: "Manager Relationship",
    icon: Users2,
    color: "bg-pink-100 text-pink-800",
  },
  {
    id: "peer_collaboration",
    name: "Peer Collaboration",
    icon: Users,
    color: "bg-teal-100 text-teal-800",
  },
  {
    id: "recognition",
    name: "Recognition",
    icon: Award,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "well_being",
    name: "Well-being",
    icon: Heart,
    color: "bg-red-100 text-red-800",
  },
  {
    id: "environment",
    name: "Environment",
    icon: Home,
    color: "bg-gray-100 text-gray-800",
  }
];

// Template Question Sets - Each template has exactly 6 questions
const TEMPLATE_QUESTIONS = {
  // Time-Based Templates
  monthly_pulse: [
    {
      id: "satisfaction",
      text: "How satisfied are you with your current role?",
      category: "happiness",
      required: true
    },
    {
      id: "enps",
      text: "How likely are you to recommend this company as a place to work?",
      category: "enps",
      required: true
    },
    {
      id: "communication",
      text: "How effective is communication within your team?",
      category: "communication",
      required: true
    },
    {
      id: "recognition",
      text: "How well do you feel recognized for your contributions?",
      category: "recognition",
      required: true
    },
    {
      id: "well_being",
      text: "How would you rate your work-life balance?",
      category: "well_being",
      required: true
    },
    {
      id: "environment",
      text: "How comfortable do you feel expressing your opinions at work?",
      category: "environment",
      required: true
    }
  ],
  
  quarterly_deep_dive: [
    {
      id: "satisfaction",
      text: "How satisfied are you with your current role?",
      category: "happiness",
      required: true
    },
    {
      id: "enps",
      text: "How likely are you to recommend this company as a place to work?",
      category: "enps",
      required: true
    },
    {
      id: "communication",
      text: "How clear and effective is communication from leadership?",
      category: "communication",
      required: true
    },
    {
      id: "manager_relationship",
      text: "How supported do you feel by your manager?",
      category: "manager_relationship",
      required: true
    },
    {
      id: "career_growth",
      text: "How satisfied are you with your career growth opportunities?",
      category: "career_growth",
      required: true
    },
    {
      id: "peer_collaboration",
      text: "How well do you collaborate with your team members?",
      category: "peer_collaboration",
      required: true
    }
  ],
  
  half_year_culture: [
    {
      id: "satisfaction",
      text: "How satisfied are you with your current role?",
      category: "happiness",
      required: true
    },
    {
      id: "enps",
      text: "How likely are you to recommend this company as a place to work?",
      category: "enps",
      required: true
    },
    {
      id: "value_alignment",
      text: "How aligned do you feel with the company's values and mission?",
      category: "value_alignment",
      required: true
    },
    {
      id: "peer_collaboration",
      text: "How supported do you feel by your colleagues?",
      category: "peer_collaboration",
      required: true
    },
    {
      id: "recognition",
      text: "How well do you feel recognized for your contributions?",
      category: "recognition",
      required: true
    },
    {
      id: "environment",
      text: "How would you rate your work environment and culture?",
      category: "environment",
      required: true
    }
  ],
  
  annual_full_review: [
    {
      id: "satisfaction",
      text: "How satisfied are you with your current role?",
      category: "happiness",
      required: true
    },
    {
      id: "enps",
      text: "How likely are you to recommend this company as a place to work?",
      category: "enps",
      required: true
    },
    {
      id: "value_alignment",
      text: "How aligned do you feel with the company's values and mission?",
      category: "value_alignment",
      required: true
    },
    {
      id: "communication",
      text: "How effective is communication within the organization?",
      category: "communication",
      required: true
    },
    {
      id: "career_growth",
      text: "How satisfied are you with your career growth opportunities?",
      category: "career_growth",
      required: true
    },
    {
      id: "well_being",
      text: "How would you rate your overall well-being at work?",
      category: "well_being",
      required: true
    }
  ],
  
  // Scenario-Based Templates
  new_leadership: [
    {
      id: "manager_relationship",
      text: "How supported do you feel by your new manager?",
      category: "manager_relationship",
      required: true
    },
    {
      id: "communication",
      text: "How clear is communication from your new leadership?",
      category: "communication",
      required: true
    },
    {
      id: "recognition",
      text: "How well do you feel recognized by your new manager?",
      category: "recognition",
      required: true
    },
    {
      id: "enps",
      text: "How has the new leadership affected your likelihood to recommend this company?",
      category: "enps",
      required: true
    },
    {
      id: "peer_collaboration",
      text: "How has the team dynamic changed with the new leadership?",
      category: "peer_collaboration",
      required: true
    },
    {
      id: "happiness",
      text: "How has the new leadership affected your job satisfaction?",
      category: "happiness",
      required: true
    }
  ],
  
  post_change_reorg: [
    {
      id: "value_alignment",
      text: "How aligned do you feel with the company's direction after the changes?",
      category: "value_alignment",
      required: true
    },
    {
      id: "communication",
      text: "How clear was communication about the organizational changes?",
      category: "communication",
      required: true
    },
    {
      id: "environment",
      text: "How has the work environment changed since the reorganization?",
      category: "environment",
      required: true
    },
    {
      id: "career_growth",
      text: "How do you feel about your career opportunities after the changes?",
      category: "career_growth",
      required: true
    },
    {
      id: "enps",
      text: "How have the changes affected your likelihood to recommend this company?",
      category: "enps",
      required: true
    },
    {
      id: "happiness",
      text: "How has the reorganization affected your job satisfaction?",
      category: "happiness",
      required: true
    }
  ],
  
  project_wrap_up: [
    {
      id: "peer_collaboration",
      text: "How well did the team collaborate during this project?",
      category: "peer_collaboration",
      required: true
    },
    {
      id: "communication",
      text: "How effective was communication throughout the project?",
      category: "communication",
      required: true
    },
    {
      id: "recognition",
      text: "How well were team contributions recognized during the project?",
      category: "recognition",
      required: true
    },
    {
      id: "environment",
      text: "How supportive was the work environment during this project?",
      category: "environment",
      required: true
    },
    {
      id: "enps",
      text: "How has this project affected your likelihood to recommend this company?",
      category: "enps",
      required: true
    },
    {
      id: "happiness",
      text: "How satisfied are you with the project outcomes and your role?",
      category: "happiness",
      required: true
    }
  ],
  
  remote_work_health: [
    {
      id: "communication",
      text: "How effective is communication in our remote work environment?",
      category: "communication",
      required: true
    },
    {
      id: "peer_collaboration",
      text: "How well do you collaborate with colleagues in a remote setting?",
      category: "peer_collaboration",
      required: true
    },
    {
      id: "environment",
      text: "How would you rate your remote work environment and setup?",
      category: "environment",
      required: true
    },
    {
      id: "well_being",
      text: "How would you rate your work-life balance while working remotely?",
      category: "well_being",
      required: true
    },
    {
      id: "enps",
      text: "How likely are you to recommend remote work at this company?",
      category: "enps",
      required: true
    },
    {
      id: "happiness",
      text: "How satisfied are you with your remote work experience?",
      category: "happiness",
      required: true
    }
  ]
};

// Individual Question Templates (for custom questions)
const QUESTION_TEMPLATES = [
  {
    id: "core_engagement",
    name: "Core Engagement",
    category: "enps",
    icon: TrendingUp,
    questions: [
      "How likely are you to recommend this company as a place to work?",
      "How satisfied are you with your current role?",
      "Do you see yourself working here in 2 years?"
    ]
  },
  {
    id: "team_collaboration", 
    name: "Team Collaboration",
    category: "peer_collaboration",
    icon: Users,
    questions: [
      "How well do you collaborate with your team members?",
      "How supported do you feel by your colleagues?",
      "How effective is communication within your team?"
    ]
  },
  {
    id: "manager_support",
    name: "Manager Support",
    category: "manager_relationship", 
    icon: Users2,
    questions: [
      "How supported do you feel by your manager?",
      "How clear is the feedback you receive from your manager?",
      "How well does your manager help you grow professionally?"
    ]
  },
  {
    id: "work_environment",
    name: "Work Environment",
    category: "environment",
    icon: Home,
    questions: [
      "How would you rate your work environment?",
      "How comfortable do you feel expressing your opinions?",
      "How inclusive is your workplace culture?"
    ]
  },
  {
    id: "growth_opportunities",
    name: "Growth Opportunities",
    category: "career_growth",
    icon: TrendingUp,
    questions: [
      "How satisfied are you with your career growth opportunities?",
      "How well does the company support your professional development?",
      "How clear is your career progression path?"
    ]
  }
];

// Auto-pilot survey plans
const AUTO_PILOT_PLANS = [
  {
    id: "quarterly",
    name: "Quarterly Plan",
    duration: "3 months",
    surveys: 3,
    description: "3 surveys, one per month",
    icon: CalendarIcon,
    color: "bg-blue-50 border-blue-200",
    sequence: [
      {
        month: 1,
        template: "monthly_pulse",
        name: "Core Pulse",
        description: "Satisfaction + eNPS + Manager + Recognition + Communication + Wellness"
      },
      {
        month: 2,
        template: "quarterly_deep_dive",
        name: "Team Health Deep Dive",
        description: "Broader range of focused metrics"
      },
      {
        month: 3,
        template: "half_year_culture",
        name: "Growth & Engagement Check",
        description: "Culture and team dynamics assessment"
      }
    ]
  },
  {
    id: "half_year",
    name: "Half-Year Plan",
    duration: "6 months",
    surveys: 6,
    description: "6 surveys, one per month",
    icon: CalendarDays,
    color: "bg-green-50 border-green-200",
    sequence: [
      {
        month: 1,
        template: "monthly_pulse",
        name: "Core Pulse",
        description: "Satisfaction + eNPS + 4 rotating theme questions"
      },
      {
        month: 2,
        template: "quarterly_deep_dive",
        name: "Team Health Deep Dive",
        description: "Broader range of focused metrics"
      },
      {
        month: 3,
        template: "half_year_culture",
        name: "Growth & Engagement Check",
        description: "Culture and team dynamics assessment"
      },
      {
        month: 4,
        template: "new_leadership",
        name: "Culture & Collaboration Check",
        description: "Team collaboration and communication focus"
      },
      {
        month: 5,
        template: "remote_work_health",
        name: "Wellness & Environment Focus",
        description: "Distributed team well-being and connection"
      },
      {
        month: 6,
        template: "annual_full_review",
        name: "Annual-style Review Lite",
        description: "6 key questions covering all categories"
      }
    ]
  },
  {
    id: "annual",
    name: "Annual Plan",
    duration: "12 months",
    surveys: 12,
    description: "12 surveys, one per month",
    icon: CalendarRange,
    color: "bg-purple-50 border-purple-200",
    sequence: [
      // First 6 months (same as half-year)
      {
        month: 1,
        template: "monthly_pulse",
        name: "Core Pulse",
        description: "Satisfaction + eNPS + 4 rotating theme questions"
      },
      {
        month: 2,
        template: "quarterly_deep_dive",
        name: "Team Health Deep Dive",
        description: "Broader range of focused metrics"
      },
      {
        month: 3,
        template: "half_year_culture",
        name: "Growth & Engagement Check",
        description: "Culture and team dynamics assessment"
      },
      {
        month: 4,
        template: "new_leadership",
        name: "Culture & Collaboration Check",
        description: "Team collaboration and communication focus"
      },
      {
        month: 5,
        template: "remote_work_health",
        name: "Wellness & Environment Focus",
        description: "Distributed team well-being and connection"
      },
      {
        month: 6,
        template: "annual_full_review",
        name: "Annual-style Review Lite",
        description: "6 key questions covering all categories"
      },
      // Second 6 months (repeat with variations)
      {
        month: 7,
        template: "monthly_pulse",
        name: "Core Pulse",
        description: "Satisfaction + eNPS + 4 rotating theme questions"
      },
      {
        month: 8,
        template: "quarterly_deep_dive",
        name: "Team Health Deep Dive",
        description: "Broader range of focused metrics"
      },
      {
        month: 9,
        template: "half_year_culture",
        name: "Growth & Engagement Check",
        description: "Culture and team dynamics assessment"
      },
      {
        month: 10,
        template: "post_change_reorg",
        name: "Culture & Collaboration Check",
        description: "Team collaboration and communication focus"
      },
      {
        month: 11,
        template: "project_wrap_up",
        name: "Wellness & Environment Focus",
        description: "Distributed team well-being and connection"
      },
      {
        month: 12,
        template: "annual_full_review",
        name: "Annual-style Review Lite",
        description: "6 key questions covering all categories"
      }
    ]
  }
];

// Survey Templates - All Fixed at 6 Questions
const SURVEY_TEMPLATES = [
  // Time-Based Templates
  {
    id: "monthly_pulse",
    name: "Monthly Pulse",
    description: "Quick check-in on core health metrics",
    category: "time-based",
    questions: 6,
    estimatedTime: "60 seconds",
    icon: Heart,
    color: "bg-red-50 border-red-200",
    structure: "Satisfaction + eNPS + 4 rotating theme questions"
  },
  {
    id: "quarterly_deep_dive",
    name: "Quarterly Deep-Dive",
    description: "Richer insight into broader range of metrics",
    category: "time-based",
    questions: 6,
    estimatedTime: "60 seconds",
    icon: TrendingUp,
    color: "bg-blue-50 border-blue-200",
    structure: "Satisfaction + eNPS + 4 theme-specific deep-dive questions"
  },
  {
    id: "half_year_culture",
    name: "Half-Year Culture Check",
    description: "Assess alignment, collaboration, recognition, and environment",
    category: "time-based",
    questions: 6,
    estimatedTime: "60 seconds",
    icon: Users,
    color: "bg-green-50 border-green-200",
    structure: "Satisfaction + eNPS + Value Alignment + Peer Collaboration + Recognition + Work Environment"
  },
  {
    id: "annual_full_review",
    name: "Annual Full Review",
    description: "Comprehensive baseline of entire measurement framework",
    category: "time-based",
    questions: 6,
    estimatedTime: "60 seconds",
    icon: BarChart3,
    color: "bg-purple-50 border-purple-200",
    structure: "6 high-impact metrics from across all categories"
  },
  
  // Scenario-Based Templates
  {
    id: "new_leadership",
    name: "New Leadership Check",
    description: "Gauge sentiment after new manager/exec joins",
    category: "scenario-based",
    questions: 6,
    estimatedTime: "60 seconds",
    icon: Users2,
    color: "bg-orange-50 border-orange-200",
    structure: "Manager Relationship + Communication + Recognition + Engagement + Peer Collaboration + Happiness"
  },
  {
    id: "post_change_reorg",
    name: "Post-Change / Reorg Check",
    description: "Understand team impact after structural change",
    category: "scenario-based",
    questions: 6,
    estimatedTime: "60 seconds",
    icon: RotateCcw,
    color: "bg-yellow-50 border-yellow-200",
    structure: "Value Alignment + Communication + Work Environment + Career Growth + Engagement + Happiness"
  },
  {
    id: "project_wrap_up",
    name: "Project Team Wrap-Up",
    description: "Review collaboration & delivery after big project",
    category: "scenario-based",
    questions: 6,
    estimatedTime: "60 seconds",
    icon: CheckCircle,
    color: "bg-teal-50 border-teal-200",
    structure: "Peer Collaboration + Communication + Recognition + Work Environment + Engagement + Happiness"
  },
  {
    id: "remote_work_health",
    name: "Remote Work Health Check",
    description: "Focused on distributed team well-being and connection",
    category: "scenario-based",
    questions: 6,
    estimatedTime: "60 seconds",
    icon: Home,
    color: "bg-indigo-50 border-indigo-200",
    structure: "Communication + Peer Collaboration + Work Environment + Well-being + Engagement + Happiness"
  }
];

// Form schema
const surveySchema = z.object({
  title: z.string().min(1, "Survey title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  language: z.string().default("en"),
  schedule: z.object({
    frequency: z.string().default("once"),
    autoRotate: z.boolean().default(false),
    launchDate: z.date().optional()
  }),
  distribution: z.object({
    channels: z.array(z.string()).default(["email"]),
    reminderFrequency: z.string().default("weekly")
  })
});

type SurveyFormData = z.infer<typeof surveySchema>;

interface Question {
  id: string;
  text: string;
  category: string;
  order: number;
  required: boolean;
}

interface SurveySettings {
  isAnonymous: boolean;
  showProgress: boolean;
  mobileFirst: boolean;
  singleQuestionPerScreen: boolean;
  allowComments: boolean;
  maxQuestions: number;
}

const CreateSurvey = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Get tab from URL parameter or default to templates
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "templates");

  // Handle URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    
    // Handle questions parameter from Question Bank
    const questionsParam = searchParams.get('questions');
    if (questionsParam && questionsParam !== '') {
      const questionIds = questionsParam.split(',');
      
      // Map Question Bank question IDs to actual question text
      const questionBankMap: { [key: string]: string } = {
        // Job Satisfaction + Happiness (8 questions)
        'sat_1': 'How happy and satisfied do you feel at work lately?',
        'sat_2': 'Overall, how satisfied are you with your job right now?',
        'sat_3': 'How positive is your daily experience at work?',
        'sat_4': 'Do you feel good about coming to work each day?',
        'sat_5': 'How content are you with your current role?',
        'sat_6': 'How well does your work bring you a sense of fulfillment?',
        'sat_7': 'How enjoyable do you find your work most days?',
        'sat_8': 'How satisfied are you with your current responsibilities?',
        
        // eNPS (Employee Net Promoter Score) (8 questions)
        'enps_1': 'How likely are you to recommend working here to a friend?',
        'enps_2': 'Would you tell a friend this is a good place to work?',
        'enps_3': 'How likely are you to encourage others to join this company?',
        'enps_4': 'If a friend was job-hunting, would you suggest they apply here?',
        'enps_5': 'Would you speak positively about working here to others?',
        'enps_6': 'How likely are you to promote this company as a workplace?',
        'enps_7': 'Would you tell people this is a great team to join?',
        'enps_8': 'How likely are you to refer someone for a job here?',
        
        // Manager Relationship (8 questions)
        'mgr_1': 'Do you feel supported by your manager?',
        'mgr_2': 'How well does your manager help you succeed?',
        'mgr_3': 'Do you trust your manager\'s leadership?',
        'mgr_4': 'Does your manager listen to your ideas and concerns?',
        'mgr_5': 'How approachable is your manager when you need help?',
        'mgr_6': 'Do you feel respected by your manager?',
        'mgr_7': 'Does your manager provide helpful feedback regularly?',
        'mgr_8': 'Do you feel your manager values your input?',
        
        // Peer Collaboration (8 questions)
        'col_1': 'How connected do you feel with your teammates?',
        'col_2': 'Do you feel like you belong in your team?',
        'col_3': 'How well do you and your teammates work together?',
        'col_4': 'Do your colleagues support you when needed?',
        'col_5': 'How good is the teamwork in your department?',
        'col_6': 'Do you feel encouraged to collaborate with others?',
        'col_7': 'Do you trust your teammates to deliver quality work?',
        'col_8': 'How strong is the sense of unity in your team?',
        
        // Recognition (8 questions)
        'rec_1': 'Do you feel your work is valued here?',
        'rec_2': 'How often do you feel appreciated for what you do?',
        'rec_3': 'Do you get enough recognition when you do good work?',
        'rec_4': 'How recognized do you feel for your contributions?',
        'rec_5': 'Does your manager/team acknowledge your efforts regularly?',
        'rec_6': 'Do you feel unseen or underappreciated for your work?',
        'rec_7': 'How good is the company at celebrating success?',
        'rec_8': 'Do you feel your contributions make a difference?',
        
        // Career Growth (8 questions)
        'grw_1': 'Do you feel like you are growing and developing at work?',
        'grw_2': 'How much progress have you made in your skills lately?',
        'grw_3': 'Do you have opportunities to advance in your career here?',
        'grw_4': 'Do you feel challenged in a way that helps you grow?',
        'grw_5': 'Does your work help you learn new things?',
        'grw_6': 'Are you building the skills you want for your career?',
        'grw_7': 'Do you have a clear career path here?',
        'grw_8': 'How much support do you get for professional growth?',
        
        // Value Alignment (8 questions)
        'val_1': 'Do you feel your values align with the company\'s values?',
        'val_2': 'How well do you believe in the company\'s mission?',
        'val_3': 'Do you agree with the direction the company is heading?',
        'val_4': 'Do you feel the company acts in line with its stated values?',
        'val_5': 'Does the company\'s purpose inspire you?',
        'val_6': 'Do you feel proud to be part of this company?',
        'val_7': 'Do you share the same priorities as the company leadership?',
        'val_8': 'Do you feel connected to the company\'s goals?',
        
        // Communication (8 questions)
        'com_1': 'How clear is communication within your team?',
        'com_2': 'Do you get the information you need to do your job well?',
        'com_3': 'How openly do people share important updates here?',
        'com_4': 'Do you feel kept in the loop about changes that affect you?',
        'com_5': 'How well does leadership communicate with the team?',
        'com_6': 'Are you comfortable raising concerns openly?',
        'com_7': 'Do you get feedback that helps you improve?',
        'com_8': 'How effective is the flow of information in the company?',
        
        // Work Environment (8 questions)
        'env_1': 'Do you have the tools and equipment you need to do your job well?',
        'env_2': 'How comfortable is your workspace?',
        'env_3': 'Does the company provide a safe work environment?',
        'env_4': 'Do you have the resources you need to be effective?',
        'env_5': 'How well does your work environment help you focus?',
        'env_6': 'Do you feel physically comfortable during your workday?',
        'env_7': 'How satisfied are you with the office setup or remote tools?',
        'env_8': 'Do you have access to the technology you need for your role?',
        
        // Health & Wellness (8 questions)
        'wel_1': 'How well does the company support your mental health?',
        'wel_2': 'Do you feel your physical well-being is looked after here?',
        'wel_3': 'How manageable is your workload for maintaining balance?',
        'wel_4': 'Does the company care about your health and wellness?',
        'wel_5': 'Do you have enough flexibility to manage personal needs?',
        'wel_6': 'How much does work negatively affect your well-being?',
        'wel_7': 'Do you feel supported during stressful periods?',
        'wel_8': 'Does the company encourage healthy work habits?',
        
        // Engagement (8 questions)
        'eng_1': 'How motivated are you to give your best at work?',
        'eng_2': 'Do you feel excited about your work most days?',
        'eng_3': 'How committed are you to helping the company succeed?',
        'eng_4': 'Do you put extra effort into your work because you want to?',
        'eng_5': 'How connected do you feel to the company\'s success?',
        'eng_6': 'Do you feel energized by your daily tasks?',
        'eng_7': 'Are you motivated to contribute beyond your core duties?',
        'eng_8': 'How often do you go above and beyond at work?'
      };
      
      const newQuestions = questionIds.map((id, index) => ({
        id: `q_${Date.now()}_${index}`,
        text: questionBankMap[id] || `Question from Question Bank (ID: ${id})`,
        category: id.startsWith('sat') ? 'satisfaction' : 
                  id.startsWith('enps') ? 'enps' : 
                  id.startsWith('mgr') ? 'manager' :
                  id.startsWith('col') ? 'collaboration' :
                  id.startsWith('rec') ? 'recognition' :
                  id.startsWith('grw') ? 'growth' :
                  id.startsWith('val') ? 'value' :
                  id.startsWith('com') ? 'communication' :
                  id.startsWith('env') ? 'environment' :
                  id.startsWith('wel') ? 'wellbeing' :
                  id.startsWith('eng') ? 'engagement' : 'custom',
        order: questions.length + index,
        required: true
      }));
      
      setQuestions(prev => [...prev, ...newQuestions]);
      
      // Clear the questions parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('questions');
      setSearchParams(newSearchParams);
      
      toast({
        title: "Questions Added",
        description: `${newQuestions.length} questions have been added to your survey.`,
      });
    }
  }, [searchParams, activeTab, questions.length, toast]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdSurveyId, setCreatedSurveyId] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: '', category: 'custom' });

  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed to:', showAddQuestionModal);
  }, [showAddQuestionModal]);

  // Auto-pilot plan state
  const [selectedAutoPilotPlan, setSelectedAutoPilotPlan] = useState<string | null>(null);
  const [autoPilotStartDate, setAutoPilotStartDate] = useState<Date | undefined>(undefined);
  const [showAutoPilotModal, setShowAutoPilotModal] = useState(false);

  const [surveySettings, setSurveySettings] = useState<SurveySettings>({
    isAnonymous: true,
    showProgress: true,
    mobileFirst: true,
    singleQuestionPerScreen: true,
    allowComments: false,
    maxQuestions: 6 // Fixed at 6 questions for all surveys (2 core + 4 additional)
  });

  // Core question variations for rotation
  const coreQuestionVariations = {
    satisfaction: [
      "How satisfied are you with your current role?",
      "Overall, how satisfied are you with your job right now?",
      "How positive is your daily experience at work?",
      "Do you feel good about coming to work each day?",
      "How content are you with your current responsibilities?",
      "How well does your work bring you a sense of fulfillment?",
      "How enjoyable do you find your work most days?",
      "How satisfied are you with your current role and responsibilities?"
    ],
    enps: [
      "How likely are you to recommend working here to a friend?",
      "Would you tell a friend this is a good place to work?",
      "How likely are you to encourage others to join this company?",
      "If a friend was job-hunting, would you suggest they apply here?",
      "Would you speak positively about working here to others?",
      "How likely are you to promote this company as a workplace?",
      "Would you tell people this is a great team to join?",
      "How likely are you to refer someone for a job here?"
    ]
  };

  // Get random core question variations
  const getRandomCoreQuestions = () => {
    const satisfactionVariation = coreQuestionVariations.satisfaction[
      Math.floor(Math.random() * coreQuestionVariations.satisfaction.length)
    ];
    const enpsVariation = coreQuestionVariations.enps[
      Math.floor(Math.random() * coreQuestionVariations.enps.length)
    ];
    return { satisfaction: satisfactionVariation, enps: enpsVariation };
  };

  const [currentCoreQuestions, setCurrentCoreQuestions] = useState(getRandomCoreQuestions());

  const [launchDate, setLaunchDate] = useState<Date | undefined>(undefined);

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: "",
      description: "",
      category: "general",
      language: "en",
      schedule: {
        frequency: "once",
        autoRotate: false
      },
      distribution: {
        channels: ["email"],
        reminderFrequency: "weekly"
      }
    },
  });

  // Add question from template
  const addQuestionFromTemplate = useCallback((templateId: string) => {
    const template = QUESTION_TEMPLATES.find(t => t.id === templateId);
    if (template && questions.length < surveySettings.maxQuestions) {
      const newQuestions = template.questions.map((question, index) => ({
        id: `q_${Date.now()}_${index}`,
        text: question,
        category: template.category,
        order: questions.length + index,
        required: true
      }));
      setQuestions(prev => [...prev, ...newQuestions]);
    } else if (questions.length >= surveySettings.maxQuestions) {
      toast({
        title: "Question limit reached",
        description: `Maximum ${surveySettings.maxQuestions} questions allowed for optimal completion rates.`,
        variant: "destructive"
      });
    }
  }, [questions, surveySettings.maxQuestions, toast]);

  // Add custom question
  const addCustomQuestion = useCallback(() => {
    if (newQuestion.text.trim() === '') {
      toast({
        title: "Question text required",
        description: "Please enter a question before adding it.",
        variant: "destructive"
      });
      return;
    }

    if (questions.length >= surveySettings.maxQuestions - 2) { // -2 for core questions
      toast({
        title: "Question limit reached",
        description: `Maximum ${surveySettings.maxQuestions} questions allowed for optimal completion rates.`,
        variant: "destructive"
      });
      return;
    }

    const question: Question = {
      id: `q_${Date.now()}`,
      text: newQuestion.text.trim(),
      category: newQuestion.category,
      order: questions.length,
      required: true
    };

    setQuestions(prev => [...prev, question]);
    setNewQuestion({ text: '', category: 'custom' });
    setShowAddQuestionModal(false);

    toast({
      title: "Question added",
      description: "Your custom question has been added to the survey.",
    });
  }, [newQuestion, questions.length, surveySettings.maxQuestions, toast]);

  // Add question by category (for sidebar buttons)
  const addQuestionByCategory = useCallback((category: string) => {
    if (questions.length >= surveySettings.maxQuestions - 2) { // -2 for core questions
      toast({
        title: "Question limit reached",
        description: `Maximum ${surveySettings.maxQuestions} questions allowed for optimal completion rates.`,
        variant: "destructive"
      });
      return;
    }

    // Default question text based on category
    const defaultQuestions = {
      'manager': 'How well does your manager support your growth and development?',
      'collaboration': 'How effectively do you collaborate with your team members?',
      'recognition': 'How well do you feel recognized for your contributions?',
      'growth': 'How satisfied are you with your career growth opportunities?',
      'communication': 'How clear and effective is communication within your team?',
      'happiness': 'How satisfied are you with your current role?',
      'enps': 'How likely are you to recommend this company as a place to work?',
      'custom': 'Enter your custom question here...'
    };

    const question: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: defaultQuestions[category as keyof typeof defaultQuestions] || 'Enter your question here...',
      category,
      order: questions.length,
      required: true
    };

    setQuestions(prev => [...prev, question]);
  }, [questions.length, surveySettings.maxQuestions, toast]);

  // Update question
  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  }, []);

  // Remove question
  const removeQuestion = useCallback((questionId: string) => {
    console.log('Removing question with ID:', questionId);
    console.log('Current questions:', questions);
    
    setQuestions(prev => {
      const filtered = prev.filter(q => q.id !== questionId);
      console.log('Questions after filtering:', filtered);
      
      // Update order for remaining questions
      const updated = filtered.map((q, index) => ({
        ...q,
        order: index
      }));
      
      console.log('Questions after updating order:', updated);
      return updated;
    });
    
    toast({
      title: "Question removed",
      description: "The question has been removed from your survey.",
    });
  }, [questions, toast]);

  // Load template
  const loadTemplate = useCallback((templateId: string) => {
    const template = SURVEY_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      form.setValue("title", template.name);
      form.setValue("description", template.description);
      
      // Load template questions from TEMPLATE_QUESTIONS
      const templateQuestions = TEMPLATE_QUESTIONS[templateId as keyof typeof TEMPLATE_QUESTIONS] || [];
      
      const questions = templateQuestions.map((q, index) => ({
        id: `q_${Date.now()}_${index}`,
        text: q.text,
        category: q.category,
        order: index,
        required: q.required
      }));
      
      setQuestions(questions);
      
      // Don't add core questions when loading a template since they're already included
      // setCurrentCoreQuestions(getRandomCoreQuestions());
      
      toast({
        title: "Template loaded",
        description: `${template.name} template has been loaded with ${questions.length} questions.`
      });
    }
  }, [form, toast]);

  // Load auto-pilot plan
  const loadAutoPilotPlan = useCallback((planId: string) => {
    const plan = AUTO_PILOT_PLANS.find(p => p.id === planId);
    if (plan) {
      setSelectedAutoPilotPlan(planId);
      form.setValue("title", `${plan.name} - Auto-Pilot Survey Series`);
      form.setValue("description", `${plan.description} - Automated survey sequence with ${plan.surveys} surveys over ${plan.duration}`);
      
      // Set schedule to recurring
      form.setValue("schedule.frequency", "monthly");
      form.setValue("schedule.autoRotate", true);
      
      toast({
        title: "Auto-pilot plan loaded",
        description: `${plan.name} has been configured with ${plan.surveys} automated surveys.`
      });
    }
  }, [form, toast]);

  // Helper functions for auto-pilot timing
  const getNextBusinessDay = (date: Date): Date => {
    const dayOfWeek = getDay(date);
    // If it's Saturday (6) or Sunday (0), move to next Monday
    if (dayOfWeek === 6) { // Saturday
      return addDays(date, 2);
    } else if (dayOfWeek === 0) { // Sunday
      return addDays(date, 1);
    }
    return date;
  };

  const getDefaultSendDate = (baseDate: Date): Date => {
    // Set to 15th of the month at 10:00 AM
    const sendDate = new Date(baseDate);
    sendDate.setDate(15);
    sendDate.setHours(10, 0, 0, 0);
    
    // If 15th falls on weekend, move to next business day
    return getNextBusinessDay(sendDate);
  };

  const getReminderDates = (sendDate: Date) => {
    return {
      firstReminder: addDays(sendDate, 3), // 3 days later
      secondReminder: addDays(sendDate, 7), // 7 days later
    };
  };

  const getCloseDate = (sendDate: Date): Date => {
    // Close at end of month, or after 10 days if you want faster cycles
    const endOfMonth = new Date(sendDate);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0); // Last day of current month
    endOfMonth.setHours(23, 59, 59, 999);
    
    const tenDaysLater = addDays(sendDate, 10);
    tenDaysLater.setHours(23, 59, 59, 999);
    
    // Use the earlier of the two (end of month or 10 days)
    return tenDaysLater < endOfMonth ? tenDaysLater : endOfMonth;
  };

  // Generate auto-pilot schedule
  const generateAutoPilotSchedule = useCallback((planId: string, startDate: Date) => {
    const plan = AUTO_PILOT_PLANS.find(p => p.id === planId);
    if (!plan) return [];

    const schedule = [];
    for (let i = 0; i < plan.sequence.length; i++) {
      const survey = plan.sequence[i];
      const baseDate = new Date(startDate);
      baseDate.setMonth(startDate.getMonth() + i);
      
      // Calculate timing for this survey
      const sendDate = getDefaultSendDate(baseDate);
      const reminders = getReminderDates(sendDate);
      const closeDate = getCloseDate(sendDate);
      
      schedule.push({
        month: i + 1,
        sendDate: sendDate,
        firstReminder: reminders.firstReminder,
        secondReminder: reminders.secondReminder,
        closeDate: closeDate,
        template: survey.template,
        name: survey.name,
        description: survey.description
      });
    }
    return schedule;
  }, []);

  // Create auto-pilot plan
  const createAutoPilotPlan = useCallback(async (planId: string, startDate: Date) => {
    const plan = AUTO_PILOT_PLANS.find(p => p.id === planId);
    if (!plan || !startDate) return;

    const schedule = generateAutoPilotSchedule(planId, startDate);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create auto-pilot plans",
          variant: "destructive",
        });
        navigate('/auth/signin');
        return;
      }

      // Create auto-pilot plan in backend
      const response = await fetch('/api/v1/surveys/auto-pilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId,
          startDate: startDate.toISOString(),
          schedule,
          distribution: form.getValues("distribution"),
          settings: surveySettings
        })
      });

      if (response.ok) {
        const result = await response.json();
        setShowAutoPilotModal(false);
        setSelectedAutoPilotPlan(null);
        setAutoPilotStartDate(undefined);
        
        toast({
          title: "Auto-pilot plan created",
          description: `${plan.name} has been scheduled with ${plan.surveys} surveys starting ${format(startDate, 'PPP')}.`
        });
        
        // Navigate to dashboard to see the plan
        navigate('/dashboard');
      } else {
        throw new Error('Failed to create auto-pilot plan');
      }
    } catch (error) {
      toast({
        title: "Error creating auto-pilot plan",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  }, [form, surveySettings, navigate, toast, generateAutoPilotSchedule]);

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

      if (questions.length === 0) {
        toast({
          title: "No questions added",
          description: "Please add at least one question to your survey.",
          variant: "destructive"
        });
        return;
      }

      // Transform questions to match backend format
      const transformedQuestions = questions.map((question, index) => ({
        text: question.text,
        type: "rating", // All questions are 0-10 scale
        required: question.required,
        order: index,
        category: question.category,
        options: { min: 0, max: 10, labels: { 0: "Poor", 5: "Average", 10: "Excellent" } },
        allow_comments: surveySettings.allowComments,
      }));

      const API_ROOT = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_ROOT}/api/v1/surveys/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          language: data.language,
          is_anonymous: surveySettings.isAnonymous,
          allow_comments: surveySettings.allowComments,
          schedule: {
            ...data.schedule,
            launchDate: launchDate?.toISOString()
          },
          distribution: data.distribution,
          questions: transformedQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create survey');
      }

      const result = await response.json();
      
      setCreatedSurveyId(result.id);
      const link = `${window.location.origin}/survey/${result.id}`;
      setShareableLink(link);
      setShowSuccessModal(true);
      
      toast({
        title: "Survey created!",
        description: "Your survey has been successfully created and is ready to share.",
      });

      // Navigate to My Surveys after a short delay
      setTimeout(() => {
        navigate('/surveys');
      }, 2000);
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

  const openPreview = () => {
    // Create a temporary survey URL for preview with survey data
    const surveyData = {
      title: form.watch("title") || "Untitled Survey",
      description: form.watch("description") || "",
      questions: questions,
      isAnonymous: surveySettings.isAnonymous,
      showProgress: surveySettings.showProgress,
      singleQuestionPerScreen: surveySettings.singleQuestionPerScreen
    };
    
    // Encode survey data as URL parameters
    const params = new URLSearchParams({
      data: JSON.stringify(surveyData)
    });
    
    const previewUrl = `${window.location.origin}/survey/preview?${params.toString()}`;
    window.open(previewUrl, '_blank');
  };

  const estimatedTime = useMemo(() => {
    const baseTime = questions.length * 10; // 10 seconds per question
    return Math.ceil(baseTime / 60); // Convert to minutes
  }, [questions.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create Survey</h1>
                <p className="text-sm text-gray-500">Build powerful employee surveys in minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openPreview}
                disabled={questions.length === 0}
              >
                <Eye className="h-4 w-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={questions.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Survey
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value);
            setSearchParams({ tab: value });
          }} 
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="auto-pilot">Auto-Pilot</TabsTrigger>
            <TabsTrigger value="builder">Survey Builder</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="distribute">Distribute</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose a Template</h2>
              <p className="text-gray-600">All templates are fixed at 6 questions for data consistency and optimal completion rates</p>
            </div>
            
            {/* Time-Based Templates */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Time-Based Templates</h3>
              <p className="text-gray-600">Regular surveys for ongoing measurement and trend tracking</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {SURVEY_TEMPLATES.filter(t => t.category === "time-based").map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${template.color} ${selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => loadTemplate(template.id)}
                    >
                      <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-gray-600" />
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Questions:</span>
                            <span className="font-medium">{template.questions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time:</span>
                            <span className="font-medium">{template.estimatedTime}</span>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          {template.structure}
                        </div>
                        <Button 
                          className="w-full mt-4"
                          variant={selectedTemplate === template.id ? "default" : "outline"}
                        >
                          {selectedTemplate === template.id ? "Selected" : "Use Template"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Scenario-Based Templates */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Scenario-Based Templates</h3>
              <p className="text-gray-600">Specialized surveys for specific business situations and events</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {SURVEY_TEMPLATES.filter(t => t.category === "scenario-based").map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${template.color} ${selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => loadTemplate(template.id)}
                    >
                      <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-gray-600" />
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Questions:</span>
                            <span className="font-medium">{template.questions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time:</span>
                            <span className="font-medium">{template.estimatedTime}</span>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          {template.structure}
                        </div>
                        <Button 
                          className="w-full mt-4"
                          variant={selectedTemplate === template.id ? "default" : "outline"}
                        >
                          {selectedTemplate === template.id ? "Selected" : "Use Template"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Template Structure Info */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Template Structure</h4>
              <p className="text-sm text-blue-700 mb-4">
                All templates follow a consistent 6-question structure to ensure data comparability and optimal completion rates:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">Time-Based Templates</h5>
                  <ul className="text-blue-700 space-y-1">
                    <li>• <strong>Monthly Pulse:</strong> Core health metrics with rotating themes</li>
                    <li>• <strong>Quarterly Deep-Dive:</strong> Broader range of focused metrics</li>
                    <li>• <strong>Half-Year Culture:</strong> Culture and team dynamics assessment</li>
                    <li>• <strong>Annual Full Review:</strong> Comprehensive baseline measurement</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">Scenario-Based Templates</h5>
                  <ul className="text-blue-700 space-y-1">
                    <li>• <strong>New Leadership:</strong> Post-manager change assessment</li>
                    <li>• <strong>Post-Change/Reorg:</strong> Organizational change impact</li>
                    <li>• <strong>Project Wrap-Up:</strong> Project team collaboration review</li>
                    <li>• <strong>Remote Work Health:</strong> Distributed team well-being</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Auto-Pilot Tab */}
          <TabsContent value="auto-pilot" className="space-y-8">
            {/* Header Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Auto-Pilot Survey Series</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Set up recurring surveys that run automatically. Choose a plan, pick your start date, and let Novora handle the rest.
              </p>
            </div>

            {/* Plan Selection Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Plan</h3>
                <p className="text-gray-600">Select the duration and frequency that works best for your team</p>
                <p className="text-sm text-gray-500 mt-1">We recommend sending surveys on the 15th of each month at 10:00 AM (local time)</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AUTO_PILOT_PLANS.map((plan) => {
                  const Icon = plan.icon;
                  const isSelected = selectedAutoPilotPlan === plan.id;
                  
                  return (
                    <Card 
                      key={plan.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${plan.color} ${
                        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                      onClick={() => loadAutoPilotPlan(plan.id)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                          <Icon className="h-8 w-8 text-gray-600" />
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </CardHeader>
                      <CardContent className="text-center pt-0">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-semibold text-gray-900">{plan.duration}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Surveys:</span>
                            <span className="font-semibold text-gray-900">{plan.surveys}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Frequency:</span>
                            <span className="font-semibold text-gray-900">Monthly</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-2">Survey Sequence:</div>
                          <div className="space-y-1">
                            {plan.sequence.slice(0, 3).map((survey, index) => (
                              <div key={index} className="text-xs text-gray-600">
                                Month {survey.month}: {survey.name}
                              </div>
                            ))}
                            {plan.sequence.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{plan.sequence.length - 3} more surveys...
                              </div>
                            )}
                          </div>
                        </div>

                        <Button 
                          className={`w-full mt-6 ${
                            isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''
                          }`}
                          variant={isSelected ? "default" : "outline"}
                        >
                          {isSelected ? "✓ Selected" : "Choose Plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Start Date Section - Only show if plan is selected */}
            {selectedAutoPilotPlan && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Start Date</h3>
                  <p className="text-gray-600">Choose when you want your auto-pilot series to begin</p>
                </div>
                
                <Card className="max-w-md mx-auto">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Start Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-12",
                                !autoPilotStartDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {autoPilotStartDate ? format(autoPilotStartDate, "PPP") : <span>Pick a start date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                              mode="single"
                              selected={autoPilotStartDate}
                              onSelect={setAutoPilotStartDate}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      {autoPilotStartDate && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-900">
                            <div className="font-medium mb-1">Your auto-pilot series will start:</div>
                            <div className="text-blue-700 mb-2">{format(autoPilotStartDate, 'EEEE, MMMM do, yyyy')}</div>
                            <div className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
                              <div className="font-medium mb-1">Recommended Timing:</div>
                              <div>• First survey: 15th of {format(autoPilotStartDate, 'MMMM yyyy')} at 10:00 AM</div>
                              <div>• Subsequent surveys: 15th of each month at 10:00 AM</div>
                              <div>• Weekend dates will be moved to the next business day</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Create Button Section - Only show if both plan and date are selected */}
            {selectedAutoPilotPlan && autoPilotStartDate && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 p-6 rounded-lg max-w-2xl mx-auto">
                  <h4 className="font-semibold text-green-900 mb-2">Ready to Launch Auto-Pilot</h4>
                  <p className="text-sm text-green-700 mb-4">
                    Your survey series is configured and ready to go. Click below to create your auto-pilot plan.
                  </p>
                  <Button
                    onClick={() => setShowAutoPilotModal(true)}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Create Auto-Pilot Series
                  </Button>
                </div>
              </div>
            )}

            {/* Benefits Section */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Why Auto-Pilot?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Zero Effort</h4>
                  <p className="text-sm text-gray-600">Set up once and let Novora handle everything automatically</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Better Data</h4>
                  <p className="text-sm text-gray-600">Consistent measurement for accurate trend analysis</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Engaged Teams</h4>
                  <p className="text-sm text-gray-600">Varied questions prevent survey fatigue</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            {/* Header Section - Matching other pages style */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Survey Builder</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Create engaging surveys that drive actionable insights. Core metrics are automatically included for consistent tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Builder */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Survey Information</CardTitle>
                        <CardDescription>
                          Set up your survey details and questions
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save Draft
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form className="space-y-6">
                        {/* Survey Info */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title" className="text-sm font-medium">Survey Title *</Label>
                            <Input
                              id="title"
                              placeholder="e.g., Q4 Employee Engagement Survey"
                              {...form.register("title")}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Brief description of what this survey covers..."
                              {...form.register("description")}
                              className="mt-1"
                              rows={3}
                            />
                            <p className="text-xs text-gray-500 mt-1">Helps employees understand the survey purpose</p>
                          </div>
                        </div>

                        {/* Core Metrics Section - Always Included */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900">Core Metrics</h3>
                              <Badge variant="default" className="bg-blue-600">Always Included</Badge>
                            </div>
                                                         <div className="flex items-center space-x-2">
                               <input 
                                 type="checkbox" 
                                 id="include-core-metrics" 
                                 checked={true}
                                 onChange={(e) => {
                                   if (!e.target.checked) {
                                     // Show warning dialog
                                     if (confirm("Removing core metrics will break trend tracking and benchmarking. Are you sure?")) {
                                       // Handle removal
                                     } else {
                                       e.target.checked = true;
                                     }
                                   }
                                 }}
                                 className="rounded border-gray-300" 
                               />
                               <label htmlFor="include-core-metrics" className="text-sm font-medium">Include Core Metrics</label>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => setCurrentCoreQuestions(getRandomCoreQuestions())}
                                 title="Rotate core question variations"
                               >
                                 <RotateCcw className="h-4 w-4" />
                               </Button>
                             </div>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">1</span>
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-blue-100 text-blue-800">
                                        <Heart className="h-3 w-3 mr-1" />
                                        Satisfaction
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">Core</Badge>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                      {currentCoreQuestions.satisfaction}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                  <div>Required</div>
                                  <div>0-10 scale</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">2</span>
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-green-100 text-green-800">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        eNPS
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">Core</Badge>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                      {currentCoreQuestions.enps}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                  <div>Required</div>
                                  <div>0-10 scale</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-white text-xs">i</span>
                                </div>
                                <div className="text-xs text-blue-800">
                                  <strong>Why Core Metrics?</strong> These questions enable consistent tracking, industry benchmarking, and trend analysis across all surveys. Removing them breaks data continuity.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Questions Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Additional Questions</h3>
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Add recommended mix logic
                                  addQuestionByCategory('manager');
                                  addQuestionByCategory('collaboration');
                                  addQuestionByCategory('recognition');
                                  addQuestionByCategory('growth');
                                }}
                                disabled={questions.length >= surveySettings.maxQuestions}
                              >
                                <Target className="h-4 w-4 mr-2" />
                                Recommended Mix (4 questions)
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Add Question button clicked');
                                  console.log('Current modal state:', showAddQuestionModal);
                                  setShowAddQuestionModal(true);
                                  console.log('Modal state set to true');
                                  console.log('New modal state should be:', true);
                                  // Force a re-render check
                                  setTimeout(() => {
                                    console.log('Modal state after timeout:', showAddQuestionModal);
                                  }, 100);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                              </Button>
                            </div>
                          </div>
                          
                          {questions.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">No additional questions yet</h3>
                              <p className="mt-1 text-sm text-gray-500 mb-4">
                                Add questions from the sidebar to build your survey. Core metrics are already included.
                              </p>
                              <div className="flex items-center justify-center space-x-4">
                                <Button type="button" variant="outline" size="sm">
                                  <Target className="h-4 w-4 mr-2" />
                                  Use Template
                                </Button>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Navigate to question bank page
                                    navigate('/question-bank');
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add from Bank
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {questions.map((question, index) => {
                                const category = MEASUREMENT_CATEGORIES.find(c => c.id === question.category);
                                const Icon = category?.icon || Target;
                                
                                console.log(`Rendering question ${index}:`, question.id, question.text);
                                
                                return (
                                  <Card key={question.id} className="relative">
                                    <CardContent className="p-4">
                                      <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-600">{index + 3}</span>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <Badge className={category?.color}>
                                              <Icon className="h-3 w-3 mr-1" />
                                              {category?.name}
                                            </Badge>
                                          </div>
                                          <Input
                                            value={question.text}
                                            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                                            placeholder="Enter your question..."
                                            className="font-medium"
                                          />
                                          <div className="mt-2 text-sm text-gray-500">
                                            Respondents will rate this on a 0-10 scale
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              console.log('Remove button clicked for question:', question.id);
                                              removeQuestion(question.id);
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Core Metrics Info */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-blue-600" />
                      <span>Core Metrics</span>
                      <Badge variant="default" className="bg-blue-600 text-xs">Always Included</Badge>
                    </CardTitle>
                    <CardDescription>
                      Satisfaction + eNPS for consistent tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            <Heart className="h-3 w-3 mr-1" />
                            Satisfaction
                          </Badge>
                          <Badge variant="outline" className="text-xs">Core</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{currentCoreQuestions.satisfaction}</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-green-100 text-green-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            eNPS
                          </Badge>
                          <Badge variant="outline" className="text-xs">Core</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{currentCoreQuestions.enps}</p>
                      </div>
                      
                      <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                        <strong>Benefits:</strong> Consistent tracking, industry benchmarks, trend analysis
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Question Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Question Categories</span>
                    </CardTitle>
                    <CardDescription>
                      Add questions from proven categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { id: "manager", name: "Manager Relationship", icon: Users, color: "bg-pink-100 text-pink-800", desc: "Leadership effectiveness" },
                        { id: "collaboration", name: "Peer Collaboration", icon: Users, color: "bg-teal-100 text-teal-800", desc: "Team dynamics" },
                        { id: "recognition", name: "Recognition", icon: Award, color: "bg-yellow-100 text-yellow-800", desc: "Appreciation & value" },
                        { id: "growth", name: "Career Growth", icon: TrendingUp, color: "bg-indigo-100 text-indigo-800", desc: "Development opportunities" },
                        { id: "communication", name: "Communication", icon: MessageSquare, color: "bg-orange-100 text-orange-800", desc: "Information flow" },
                        { id: "value", name: "Value Alignment", icon: Target, color: "bg-purple-100 text-purple-800", desc: "Company mission fit" },
                        { id: "wellbeing", name: "Well-being", icon: Heart, color: "bg-red-100 text-red-800", desc: "Health & wellness" },
                        { id: "environment", name: "Work Environment", icon: Home, color: "bg-gray-100 text-gray-800", desc: "Tools & resources" }
                      ].map((category) => {
                        const Icon = category.icon;
                        return (
                          <Button
                            key={category.id}
                            variant="outline"
                            className="w-full justify-start h-auto p-3"
                            onClick={() => addQuestionByCategory(category.id)}
                            disabled={questions.length >= surveySettings.maxQuestions}
                          >
                            <Icon className="h-4 w-4 mr-3 text-gray-500" />
                            <div className="text-left flex-1">
                              <div className="font-medium text-sm">{category.name}</div>
                              <div className="text-xs text-gray-500">{category.desc}</div>
                            </div>
                            <Badge className={`text-xs ${category.color}`}>
                              Add
                            </Badge>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          addQuestionByCategory('manager');
                          addQuestionByCategory('collaboration');
                          addQuestionByCategory('recognition');
                          addQuestionByCategory('growth');
                        }}
                        disabled={questions.length >= surveySettings.maxQuestions}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Recommended Mix (4 questions)
                      </Button>
                                             <Button
                         variant="outline"
                         size="sm"
                         className="w-full"
                         onClick={() => {
                           // Navigate to question bank page
                           navigate('/question-bank');
                         }}
                       >
                         <Plus className="h-4 w-4 mr-2" />
                         Browse Question Bank
                       </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Load template
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Survey Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Survey Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                                                 <div className="flex justify-between text-sm">
                           <span>Total Questions:</span>
                           <span className="font-medium">{questions.length + 2}/6</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2">
                           <div 
                             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                             style={{ width: `${Math.min(((questions.length + 2) / 6) * 100, 100)}%` }}
                           ></div>
                         </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Core Metrics:</span>
                          <span className="font-medium text-green-600">✓ Included (2)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Additional:</span>
                          <span className="font-medium">{questions.length}/6</span>
                        </div>
                                                 <div className="flex justify-between">
                           <span>Categories:</span>
                           <span className="font-medium">
                             {new Set(questions.map(q => q.category)).size}/6
                           </span>
                         </div>
                        <div className="flex justify-between">
                          <span>Est. Time:</span>
                          <span className="font-medium">~{Math.max((questions.length + 2) * 10, 45)}s</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-8">
            {/* Header Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Survey Scheduling</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Set up automated survey distribution with smart scheduling and rotation to keep your data fresh and engaging.
              </p>
            </div>

            {/* Frequency Selection */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Frequency</h3>
                <p className="text-gray-600">Select how often you want to send surveys to your team</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "once", name: "One-time", description: "Send once", icon: CalendarIcon, color: "bg-gray-50 border-gray-200" },
                  { id: "monthly", name: "Monthly", description: "Every month", icon: CalendarIcon, color: "bg-green-50 border-green-200" },
                  { id: "quarterly", name: "Quarterly", description: "Every 3 months", icon: CalendarIcon, color: "bg-purple-50 border-purple-200" }
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = form.watch("schedule.frequency") === option.id;
                  
                  return (
                    <Card 
                      key={option.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${option.color} ${
                        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                      onClick={() => form.setValue("schedule.frequency", option.id)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                          <Icon className="h-6 w-6 text-gray-600" />
                        </div>
                        <CardTitle className="text-lg">{option.name}</CardTitle>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </CardHeader>
                      <CardContent className="text-center pt-0">
                        <Button 
                          className={`w-full ${
                            isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''
                          }`}
                          variant={isSelected ? "default" : "outline"}
                        >
                          {isSelected ? "✓ Selected" : "Choose"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Launch Date Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Launch Date</h3>
                <p className="text-gray-600">Choose when you want your survey to be sent to employees</p>
              </div>
              
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Launch Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-12",
                              !launchDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {launchDate ? format(launchDate, "PPP") : <span>Pick a launch date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            mode="single"
                            selected={launchDate}
                            onSelect={setLaunchDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {launchDate && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-900">
                          <div className="font-medium mb-1">Your survey will launch:</div>
                          <div className="text-blue-700">{format(launchDate, 'EEEE, MMMM do, yyyy')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Auto-rotation Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto-rotation Settings</h3>
                <p className="text-gray-600">Keep surveys fresh and engaging with intelligent question rotation</p>
              </div>
              
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <RotateCcw className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">Auto-rotation System</h4>
                          <p className="text-sm text-gray-600">Automatically cycle through different question sets</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            {...form.register("schedule.autoRotate")}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">Enable</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">How it works:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Surveys automatically cycle through different question variations</li>
                          <li>• Prevents repetition and survey fatigue</li>
                          <li>• Maintains data quality and engagement</li>
                          <li>• Perfect for ongoing pulse surveys</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scheduling Summary */}
            {launchDate && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Schedule Summary</h3>
                </div>
                
                <Card className="max-w-2xl mx-auto bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CalendarIcon className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900 mb-2">Survey Successfully Scheduled</h4>
                        <div className="space-y-2 text-sm text-green-700">
                          <div>
                            <strong>Launch Date:</strong> {format(launchDate, "EEEE, MMMM do, yyyy")}
                          </div>
                          <div>
                            <strong>Frequency:</strong> {form.watch("schedule.frequency") === "once" ? "One-time" : 
                              form.watch("schedule.frequency") === "monthly" ? "Monthly" : "Quarterly"}
                          </div>
                          {form.watch("schedule.autoRotate") && (
                            <div>
                              <strong>Auto-rotation:</strong> Enabled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Distribute Tab */}
          <TabsContent value="distribute" className="space-y-8">
            {/* Header Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Distribution Channels</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose how to share your survey with employees. Reach your team wherever they work best.
              </p>
            </div>

            {/* Channel Selection */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Channels</h3>
                <p className="text-gray-600">Choose one or more channels to distribute your survey</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    id: "email", 
                    name: "Email", 
                    description: "Send via company email",
                    icon: Mail, 
                    color: "bg-blue-50 border-blue-200",
                    features: ["Professional", "Trackable", "Easy to manage"]
                  },
                  { 
                    id: "teams", 
                    name: "Microsoft Teams", 
                    description: "Share in Teams channels",
                    icon: MessageSquare, 
                    color: "bg-purple-50 border-purple-200",
                    features: ["Team integration", "Real-time", "Notifications"]
                  },
                  { 
                    id: "slack", 
                    name: "Slack", 
                    description: "Post to Slack channels",
                    icon: MessageSquare, 
                    color: "bg-green-50 border-green-200",
                    features: ["Channel posting", "Thread replies", "Slash commands"]
                  },
                  { 
                    id: "whatsapp", 
                    name: "WhatsApp", 
                    description: "Send via WhatsApp Business",
                    icon: MessageSquare, 
                    color: "bg-green-50 border-green-200",
                    features: ["Personal touch", "High engagement", "Mobile native"]
                  },
                  { 
                    id: "sms", 
                    name: "SMS", 
                    description: "Send text messages",
                    icon: Smartphone, 
                    color: "bg-gray-50 border-gray-200",
                    features: ["Direct delivery", "High open rate", "Quick response"]
                  },
                  { 
                    id: "link", 
                    name: "Direct Link", 
                    description: "Share a direct URL",
                    icon: Link, 
                    color: "bg-orange-50 border-orange-200",
                    features: ["Flexible sharing", "No platform limits", "Easy to forward"]
                  }
                ].map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = form.watch("distribution.channels")?.includes?.(channel.id) || false;
                  
                  return (
                    <Card 
                      key={channel.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${channel.color} ${
                        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                      onClick={() => {
                        const currentChannels = form.watch("distribution.channels") || [];
                        if (isSelected) {
                          form.setValue("distribution.channels", currentChannels.filter(d => d !== channel.id));
                        } else {
                          form.setValue("distribution.channels", [...currentChannels, channel.id]);
                        }
                      }}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                          <Icon className="h-8 w-8 text-gray-600" />
                        </div>
                        <CardTitle className="text-xl">{channel.name}</CardTitle>
                        <p className="text-sm text-gray-600">{channel.description}</p>
                      </CardHeader>
                      <CardContent className="text-center pt-0">
                        <div className="space-y-3 text-sm">
                          <div className="space-y-1">
                            {channel.features.map((feature, index) => (
                              <div key={index} className="text-gray-600">
                                • {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          className={`w-full mt-4 ${
                            isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''
                          }`}
                          variant={isSelected ? "default" : "outline"}
                        >
                          {isSelected ? "✓ Selected" : "Choose Channel"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Mobile Optimization Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile-First Experience</h3>
                <p className="text-gray-600">Optimized for the way your team works today</p>
              </div>
              
              <Card className="max-w-4xl mx-auto">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">Mobile-Optimized Design</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Single question per screen for better focus</li>
                          <li>• Touch-friendly interface</li>
                          <li>• Fast loading on any device</li>
                          <li>• Works offline with sync</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">Quick Completion</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Complete in under 60 seconds</li>
                          <li>• Progress indicator</li>
                          <li>• Save and resume later</li>
                          <li>• Instant submission</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Summary */}
            {form.watch("distribution.channels")?.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Distribution Summary</h3>
                </div>
                
                <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Share2 className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-2">Ready to Distribute</h4>
                        <div className="space-y-2 text-sm text-blue-700">
                          <div>
                            <strong>Selected Channels:</strong> {form.watch("distribution.channels")?.join(", ")}
                          </div>
                          <div>
                            <strong>Estimated Reach:</strong> All employees via selected channels
                          </div>
                          <div>
                            <strong>Mobile Ready:</strong> Optimized for all devices
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Survey Settings</DialogTitle>
            <DialogDescription>
              Configure your survey behavior and appearance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Anonymous responses</Label>
                  <input
                    type="checkbox"
                    checked={surveySettings.isAnonymous}
                    onChange={(e) => setSurveySettings(prev => ({
                      ...prev,
                      isAnonymous: e.target.checked
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
                <div className="flex items-center justify-between">
                  <Label>Single question per screen</Label>
                  <input
                    type="checkbox"
                    checked={surveySettings.singleQuestionPerScreen}
                    onChange={(e) => setSurveySettings(prev => ({
                      ...prev,
                      singleQuestionPerScreen: e.target.checked
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Allow comments</Label>
                  <input
                    type="checkbox"
                    checked={surveySettings.allowComments}
                    onChange={(e) => setSurveySettings(prev => ({
                      ...prev,
                      allowComments: e.target.checked
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Mobile-first design</Label>
                  <input
                    type="checkbox"
                    checked={surveySettings.mobileFirst}
                    onChange={(e) => setSurveySettings(prev => ({
                      ...prev,
                      mobileFirst: e.target.checked
                    }))}
                  />
                </div>
                <div>
                  <Label>Questions</Label>
                  <div className="mt-1 text-sm text-gray-600">
                    Fixed at 6 questions for data consistency and optimal completion rates
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-Pilot Confirmation Modal */}
      <Dialog open={showAutoPilotModal} onOpenChange={setShowAutoPilotModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              <span>Confirm Auto-Pilot Survey Series</span>
            </DialogTitle>
            <DialogDescription>
              Review your auto-pilot plan before creating the series.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAutoPilotPlan && autoPilotStartDate && (
            <div className="space-y-6">
              {(() => {
                const plan = AUTO_PILOT_PLANS.find(p => p.id === selectedAutoPilotPlan);
                const schedule = generateAutoPilotSchedule(selectedAutoPilotPlan, autoPilotStartDate);
                
                return (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Plan Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Plan:</span> {plan?.name}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {plan?.duration}
                        </div>
                        <div>
                          <span className="font-medium">Surveys:</span> {plan?.surveys}
                        </div>
                        <div>
                          <span className="font-medium">Start Date:</span> {format(autoPilotStartDate, 'PPP')}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Survey Schedule</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {schedule.map((survey, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">{survey.month}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{survey.name}</div>
                                <div className="text-sm text-gray-600">{survey.description}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Send Date:</span>
                                <span className="font-medium">{format(survey.sendDate, 'MMM d, yyyy \'at\' h:mm a')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">1st Reminder:</span>
                                <span className="font-medium">{format(survey.firstReminder, 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">2nd Reminder:</span>
                                <span className="font-medium">{format(survey.secondReminder, 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Close Date:</span>
                                <span className="font-medium">{format(survey.closeDate, 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">What happens next?</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Surveys will be sent on the recommended date (15th of each month at 10:00 AM)</li>
                        <li>• If the 15th falls on a weekend, surveys will be sent the next business day</li>
                        <li>• 1st reminder will be sent 3 days after the initial send</li>
                        <li>• 2nd reminder will be sent 7 days after (only to non-responders)</li>
                        <li>• Surveys will close at the end of the month or after 10 days (whichever comes first)</li>
                        <li>• Results will be collected and analyzed automatically</li>
                        <li>• You can pause or modify the plan at any time</li>
                      </ul>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAutoPilotModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => createAutoPilotPlan(selectedAutoPilotPlan, autoPilotStartDate)}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Create Auto-Pilot Series
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
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
              Your survey is now live and ready to collect responses. Share the link below with your employees.
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
              <p>• Share via email, Teams, Slack, or direct link</p>
              <p>• Mobile-optimized for easy completion</p>
              <p>• Anonymous results in your dashboard</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Question Modal */}
      <Dialog open={showAddQuestionModal} onOpenChange={setShowAddQuestionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add Custom Question</span>
            </DialogTitle>
            <DialogDescription>
              Create a custom question for your survey. Choose a category and write your question.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-category">Question Category</Label>
              <Select
                value={newQuestion.category}
                onValueChange={(value) => setNewQuestion(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {MEASUREMENT_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="question-text">Question Text *</Label>
              <Textarea
                id="question-text"
                placeholder="Enter your question here..."
                value={newQuestion.text}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Respondents will rate this on a 0-10 scale
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddQuestionModal(false);
                  setNewQuestion({ text: '', category: 'custom' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addCustomQuestion}
                className="flex-1"
                disabled={newQuestion.text.trim() === ''}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateSurvey;
