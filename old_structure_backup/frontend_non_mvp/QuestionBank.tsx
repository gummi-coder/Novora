import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Heart,
  TrendingUp,
  Users,
  Award,
  Target,
  MessageSquare,
  Home,
  Star,
  RotateCcw,
  Eye,
  Copy,
  Check
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: string;
  categoryName: string;
  variations: number;
  isSensitive: boolean;
  isReverseScored: boolean;
  languages: string[];
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  questionCount: number;
}

const QuestionBank = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showSensitive, setShowSensitive] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'variations'>('name');

  // Check if user has permission to access question bank (admin only)
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can access the question bank.",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  // Show loading or redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Question categories
  const categories: Category[] = [
    {
      id: 'satisfaction',
      name: 'Job Satisfaction',
      description: 'Overall job satisfaction and happiness metrics',
      icon: Heart,
      color: 'bg-blue-100 text-blue-800',
      questionCount: 8
    },
    {
      id: 'enps',
      name: 'eNPS',
      description: 'Employee Net Promoter Score and engagement',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800',
      questionCount: 8
    },
    {
      id: 'manager',
      name: 'Manager Relationship',
      description: 'Leadership effectiveness and manager support',
      icon: Users,
      color: 'bg-pink-100 text-pink-800',
      questionCount: 8
    },
    {
      id: 'collaboration',
      name: 'Peer Collaboration',
      description: 'Team dynamics and colleague relationships',
      icon: Users,
      color: 'bg-teal-100 text-teal-800',
      questionCount: 8
    },
    {
      id: 'recognition',
      name: 'Recognition',
      description: 'Appreciation and value recognition',
      icon: Award,
      color: 'bg-yellow-100 text-yellow-800',
      questionCount: 8
    },
    {
      id: 'growth',
      name: 'Career Growth',
      description: 'Professional development and advancement',
      icon: TrendingUp,
      color: 'bg-indigo-100 text-indigo-800',
      questionCount: 8
    },
    {
      id: 'value',
      name: 'Value Alignment',
      description: 'Company mission and values alignment',
      icon: Target,
      color: 'bg-purple-100 text-purple-800',
      questionCount: 8
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Information flow and transparency',
      icon: MessageSquare,
      color: 'bg-orange-100 text-orange-800',
      questionCount: 8
    },
    {
      id: 'environment',
      name: 'Work Environment',
      description: 'Tools, resources, and workplace setup',
      icon: Home,
      color: 'bg-gray-100 text-gray-800',
      questionCount: 8
    },
    {
      id: 'wellbeing',
      name: 'Health & Wellness',
      description: 'Mental and physical well-being support',
      icon: Heart,
      color: 'bg-red-100 text-red-800',
      questionCount: 8
    },
    {
      id: 'engagement',
      name: 'Engagement',
      description: 'Employee motivation and commitment',
      icon: Star,
      color: 'bg-emerald-100 text-emerald-800',
      questionCount: 8
    }
  ];

  // Complete question bank with all 88 questions (in real app, this would come from API)
  const [questions, setQuestions] = useState<Question[]>([
    // 1. Job Satisfaction + Happiness (8 questions)
    {
      id: 'sat_1',
      text: 'How happy and satisfied do you feel at work lately?',
      category: 'satisfaction',
      categoryName: 'Job Satisfaction',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'sat_2',
      text: 'Overall, how satisfied are you with your job right now?',
      category: 'satisfaction',
      categoryName: 'Job Satisfaction',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'sat_3',
      text: 'How positive is your daily experience at work?',
      category: 'satisfaction',
      categoryName: 'Job Satisfaction',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'sat_4',
      text: 'Do you feel good about coming to work each day?',
      category: 'satisfaction',
      categoryName: 'Job Satisfaction',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'sat_5',
      text: 'How content are you with your current role?',
      category: 'satisfaction',
      categoryName: 'Job Satisfaction',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'sat_6',
      text: 'How well does your work bring you a sense of fulfillment?',
      category: 'satisfaction',
      categoryName: 'Job Satisfaction + Happiness',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'sat_7',
      text: 'How enjoyable do you find your work most days?',
      category: 'satisfaction',
      categoryName: 'Job Satisfaction + Happiness',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'sat_8',
      text: 'How satisfied are you with your current responsibilities?',
      category: 'satisfaction',
      categoryName: 'Job Satisfaction + Happiness',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 2. eNPS (Employee Net Promoter Score) (8 questions)
    {
      id: 'enps_1',
      text: 'How likely are you to recommend working here to a friend?',
      category: 'enps',
      categoryName: 'eNPS (Employee Net Promoter Score)',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'enps_2',
      text: 'Would you tell a friend this is a good place to work?',
      category: 'enps',
      categoryName: 'eNPS (Employee Net Promoter Score)',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'enps_3',
      text: 'How likely are you to encourage others to join this company?',
      category: 'enps',
      categoryName: 'eNPS (Employee Net Promoter Score)',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'enps_4',
      text: 'If a friend was job-hunting, would you suggest they apply here?',
      category: 'enps',
      categoryName: 'eNPS (Employee Net Promoter Score)',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'enps_5',
      text: 'Would you speak positively about working here to others?',
      category: 'enps',
      categoryName: 'eNPS (Employee Net Promoter Score)',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'enps_6',
      text: 'How likely are you to promote this company as a workplace?',
      category: 'enps',
      categoryName: 'eNPS (Employee Net Promoter Score)',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'enps_7',
      text: 'Would you tell people this is a great team to join?',
      category: 'enps',
      categoryName: 'eNPS (Employee Net Promoter Score)',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'enps_8',
      text: 'How likely are you to refer someone for a job here?',
      category: 'enps',
      categoryName: 'eNPS (Employee Net Promoter Score)',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 3. Manager Relationship (8 questions)
    {
      id: 'mgr_1',
      text: 'Do you feel supported by your manager?',
      category: 'manager',
      categoryName: 'Manager Relationship',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'mgr_2',
      text: 'How well does your manager help you succeed?',
      category: 'manager',
      categoryName: 'Manager Relationship',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'mgr_3',
      text: 'Do you trust your manager\'s leadership?',
      category: 'manager',
      categoryName: 'Manager Relationship',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'mgr_4',
      text: 'Does your manager listen to your ideas and concerns?',
      category: 'manager',
      categoryName: 'Manager Relationship',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'mgr_5',
      text: 'How approachable is your manager when you need help?',
      category: 'manager',
      categoryName: 'Manager Relationship',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'mgr_6',
      text: 'Do you feel respected by your manager?',
      category: 'manager',
      categoryName: 'Manager Relationship',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'mgr_7',
      text: 'Does your manager provide helpful feedback regularly?',
      category: 'manager',
      categoryName: 'Manager Relationship',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'mgr_8',
      text: 'Do you feel your manager values your input?',
      category: 'manager',
      categoryName: 'Manager Relationship',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 4. Peer Collaboration (8 questions)
    {
      id: 'col_1',
      text: 'How connected do you feel with your teammates?',
      category: 'collaboration',
      categoryName: 'Peer Collaboration',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'col_2',
      text: 'Do you feel like you belong in your team?',
      category: 'collaboration',
      categoryName: 'Peer Collaboration',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'col_3',
      text: 'How well do you and your teammates work together?',
      category: 'collaboration',
      categoryName: 'Peer Collaboration',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'col_4',
      text: 'Do your colleagues support you when needed?',
      category: 'collaboration',
      categoryName: 'Peer Collaboration',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'col_5',
      text: 'How good is the teamwork in your department?',
      category: 'collaboration',
      categoryName: 'Peer Collaboration',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'col_6',
      text: 'Do you feel encouraged to collaborate with others?',
      category: 'collaboration',
      categoryName: 'Peer Collaboration',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'col_7',
      text: 'Do you trust your teammates to deliver quality work?',
      category: 'collaboration',
      categoryName: 'Peer Collaboration',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'col_8',
      text: 'How strong is the sense of unity in your team?',
      category: 'collaboration',
      categoryName: 'Peer Collaboration',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 5. Recognition (8 questions)
    {
      id: 'rec_1',
      text: 'Do you feel your work is valued here?',
      category: 'recognition',
      categoryName: 'Recognition',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'rec_2',
      text: 'How often do you feel appreciated for what you do?',
      category: 'recognition',
      categoryName: 'Recognition',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'rec_3',
      text: 'Do you get enough recognition when you do good work?',
      category: 'recognition',
      categoryName: 'Recognition',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'rec_4',
      text: 'How recognized do you feel for your contributions?',
      category: 'recognition',
      categoryName: 'Recognition',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'rec_5',
      text: 'Does your manager/team acknowledge your efforts regularly?',
      category: 'recognition',
      categoryName: 'Recognition',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'rec_6',
      text: 'Do you feel unseen or underappreciated for your work?',
      category: 'recognition',
      categoryName: 'Recognition',
      variations: 8,
      isSensitive: false,
      isReverseScored: true,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'rec_7',
      text: 'How good is the company at celebrating success?',
      category: 'recognition',
      categoryName: 'Recognition',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'rec_8',
      text: 'Do you feel your contributions make a difference?',
      category: 'recognition',
      categoryName: 'Recognition',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 6. Career Growth (8 questions)
    {
      id: 'grw_1',
      text: 'Do you feel like you are growing and developing at work?',
      category: 'growth',
      categoryName: 'Career Growth',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'grw_2',
      text: 'How much progress have you made in your skills lately?',
      category: 'growth',
      categoryName: 'Career Growth',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'grw_3',
      text: 'Do you have opportunities to advance in your career here?',
      category: 'growth',
      categoryName: 'Career Growth',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'grw_4',
      text: 'Do you feel challenged in a way that helps you grow?',
      category: 'growth',
      categoryName: 'Career Growth',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'grw_5',
      text: 'Does your work help you learn new things?',
      category: 'growth',
      categoryName: 'Career Growth',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'grw_6',
      text: 'Are you building the skills you want for your career?',
      category: 'growth',
      categoryName: 'Career Growth',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'grw_7',
      text: 'Do you have a clear career path here?',
      category: 'growth',
      categoryName: 'Career Growth',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'grw_8',
      text: 'How much support do you get for professional growth?',
      category: 'growth',
      categoryName: 'Career Growth',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 7. Value Alignment (8 questions)
    {
      id: 'val_1',
      text: 'Do you feel your values align with the company\'s values?',
      category: 'value',
      categoryName: 'Value Alignment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'val_2',
      text: 'How well do you believe in the company\'s mission?',
      category: 'value',
      categoryName: 'Value Alignment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'val_3',
      text: 'Do you agree with the direction the company is heading?',
      category: 'value',
      categoryName: 'Value Alignment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'val_4',
      text: 'Do you feel the company acts in line with its stated values?',
      category: 'value',
      categoryName: 'Value Alignment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'val_5',
      text: 'Does the company\'s purpose inspire you?',
      category: 'value',
      categoryName: 'Value Alignment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'val_6',
      text: 'Do you feel proud to be part of this company?',
      category: 'value',
      categoryName: 'Value Alignment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'val_7',
      text: 'Do you share the same priorities as the company leadership?',
      category: 'value',
      categoryName: 'Value Alignment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'val_8',
      text: 'Do you feel connected to the company\'s goals?',
      category: 'value',
      categoryName: 'Value Alignment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 8. Communication (8 questions)
    {
      id: 'com_1',
      text: 'How clear is communication within your team?',
      category: 'communication',
      categoryName: 'Communication',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'com_2',
      text: 'Do you get the information you need to do your job well?',
      category: 'communication',
      categoryName: 'Communication',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'com_3',
      text: 'How openly do people share important updates here?',
      category: 'communication',
      categoryName: 'Communication',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'com_4',
      text: 'Do you feel kept in the loop about changes that affect you?',
      category: 'communication',
      categoryName: 'Communication',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'com_5',
      text: 'How well does leadership communicate with the team?',
      category: 'communication',
      categoryName: 'Communication',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'com_6',
      text: 'Are you comfortable raising concerns openly?',
      category: 'communication',
      categoryName: 'Communication',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'com_7',
      text: 'Do you get feedback that helps you improve?',
      category: 'communication',
      categoryName: 'Communication',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'com_8',
      text: 'How effective is the flow of information in the company?',
      category: 'communication',
      categoryName: 'Communication',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 9. Work Environment (8 questions)
    {
      id: 'env_1',
      text: 'Do you have the tools and equipment you need to do your job well?',
      category: 'environment',
      categoryName: 'Work Environment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'env_2',
      text: 'How comfortable is your workspace?',
      category: 'environment',
      categoryName: 'Work Environment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'env_3',
      text: 'Does the company provide a safe work environment?',
      category: 'environment',
      categoryName: 'Work Environment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'env_4',
      text: 'Do you have the resources you need to be effective?',
      category: 'environment',
      categoryName: 'Work Environment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'env_5',
      text: 'How well does your work environment help you focus?',
      category: 'environment',
      categoryName: 'Work Environment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'env_6',
      text: 'Do you feel physically comfortable during your workday?',
      category: 'environment',
      categoryName: 'Work Environment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'env_7',
      text: 'How satisfied are you with the office setup or remote tools?',
      category: 'environment',
      categoryName: 'Work Environment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'env_8',
      text: 'Do you have access to the technology you need for your role?',
      category: 'environment',
      categoryName: 'Work Environment',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 10. Health & Wellness (8 questions)
    {
      id: 'wel_1',
      text: 'How well does the company support your mental health?',
      category: 'wellbeing',
      categoryName: 'Health & Wellness',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'wel_2',
      text: 'Do you feel your physical well-being is looked after here?',
      category: 'wellbeing',
      categoryName: 'Health & Wellness',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'wel_3',
      text: 'How manageable is your workload for maintaining balance?',
      category: 'wellbeing',
      categoryName: 'Health & Wellness',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'wel_4',
      text: 'Does the company care about your health and wellness?',
      category: 'wellbeing',
      categoryName: 'Health & Wellness',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'wel_5',
      text: 'Do you have enough flexibility to manage personal needs?',
      category: 'wellbeing',
      categoryName: 'Health & Wellness',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'wel_6',
      text: 'How much does work negatively affect your well-being?',
      category: 'wellbeing',
      categoryName: 'Health & Wellness',
      variations: 8,
      isSensitive: true,
      isReverseScored: true,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'wel_7',
      text: 'Do you feel supported during stressful periods?',
      category: 'wellbeing',
      categoryName: 'Health & Wellness',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'wel_8',
      text: 'Does the company encourage healthy work habits?',
      category: 'wellbeing',
      categoryName: 'Health & Wellness',
      variations: 8,
      isSensitive: true,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },

    // 11. Engagement (8 questions)
    {
      id: 'eng_1',
      text: 'How motivated are you to give your best at work?',
      category: 'engagement',
      categoryName: 'Engagement',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'eng_2',
      text: 'Do you feel excited about your work most days?',
      category: 'engagement',
      categoryName: 'Engagement',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'eng_3',
      text: 'How committed are you to helping the company succeed?',
      category: 'engagement',
      categoryName: 'Engagement',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'eng_4',
      text: 'Do you put extra effort into your work because you want to?',
      category: 'engagement',
      categoryName: 'Engagement',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'eng_5',
      text: 'How connected do you feel to the company\'s success?',
      category: 'engagement',
      categoryName: 'Engagement',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'eng_6',
      text: 'Do you feel energized by your daily tasks?',
      category: 'engagement',
      categoryName: 'Engagement',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'eng_7',
      text: 'Are you motivated to contribute beyond your core duties?',
      category: 'engagement',
      categoryName: 'Engagement',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    },
    {
      id: 'eng_8',
      text: 'How often do you go above and beyond at work?',
      category: 'engagement',
      categoryName: 'Engagement',
      variations: 8,
      isSensitive: false,
      isReverseScored: false,
      languages: ['en', 'es', 'is', 'de', 'fr'],
      active: true
    }
  ]);

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(question => {
      const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
      const matchesSensitive = showSensitive || !question.isSensitive;
      return matchesSearch && matchesCategory && matchesSensitive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.text.localeCompare(b.text);
        case 'category':
          return a.categoryName.localeCompare(b.categoryName);
        case 'variations':
          return b.variations - a.variations;
        default:
          return 0;
      }
    });

  // Handle question selection
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Add selected questions to survey
  const addSelectedToSurvey = () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "No questions selected",
        description: "Please select at least one question to add to your survey.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would add questions to the current survey
    toast({
      title: "Questions added!",
      description: `${selectedQuestions.length} question(s) have been added to your survey.`,
    });

    // Navigate back to survey builder with the "builder" tab active and selected questions
    const selectedQuestionsParam = selectedQuestions.join(',');
    navigate(`/surveys/create?tab=builder&questions=${selectedQuestionsParam}`);
  };

  // Add recommended mix of questions
  const addRecommendedMix = () => {
    // Create a recommended mix of 6 questions (2 core + 4 diverse categories)
    const recommendedQuestions = [
      // Core questions (always included)
      questions.find(q => q.category === 'satisfaction' && q.id === 'sat_1'),
      questions.find(q => q.category === 'enps' && q.id === 'enps_1'),
      
      // Additional diverse questions from different categories
      questions.find(q => q.category === 'manager' && q.id === 'mgr_1'),
      questions.find(q => q.category === 'recognition' && q.id === 'rec_1'),
      questions.find(q => q.category === 'growth' && q.id === 'grw_1'),
      questions.find(q => q.category === 'communication' && q.id === 'com_1'),
    ].filter(Boolean) as Question[];
    
    // Set the recommended questions as selected
    setSelectedQuestions(recommendedQuestions.map(q => q.id));
    
    toast({
      title: "Recommended Mix Selected",
      description: "6 well-balanced questions have been selected for your survey.",
    });
    
    // Navigate to Survey Builder with the recommended questions
    const selectedQuestionsParam = recommendedQuestions.map(q => q.id).join(',');
    navigate(`/surveys/create?tab=builder&questions=${selectedQuestionsParam}`);
  };

  // Copy question text
  const copyQuestionText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Question text copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/surveys/create?tab=builder')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Survey Builder
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Bank</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our comprehensive collection of proven questions organized by categories. 
              Find the perfect questions for your survey.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
              <div className="text-sm text-gray-500">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-sm text-gray-500">Languages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{selectedQuestions.length}</div>
              <div className="text-sm text-gray-500">Selected</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={addRecommendedMix}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Star className="h-4 w-4" />
                <span>Recommended Mix</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-sensitive"
                  checked={showSensitive}
                  onChange={(e) => setShowSensitive(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="show-sensitive" className="text-sm">Show sensitive questions</label>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="category">Sort by Category</option>
                <option value="variations">Sort by Variations</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => setSelectedCategory('all')}
                  >
                    <Star className="h-4 w-4 mr-3 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">All Categories</div>
                      <div className="text-xs text-muted-foreground">Browse all questions</div>
                    </div>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      {questions.length}
                    </Badge>
                  </Button>
                  
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const questionCount = questions.filter(q => q.category === category.id).length;
                    
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        className="w-full justify-start h-auto py-3 px-4"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <div className={`p-1.5 rounded-md mr-3 flex-shrink-0 ${category.color}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium truncate">{category.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{category.description}</div>
                        </div>
                        <Badge variant="secondary" className="ml-2 flex-shrink-0">
                          {questionCount}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'All Questions' : categories.find(c => c.id === selectedCategory)?.name}
                <span className="text-gray-500 ml-2">({filteredQuestions.length})</span>
              </h2>
              
              {selectedQuestions.length > 0 && (
                <Button onClick={addSelectedToSurvey}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {selectedQuestions.length} to Survey
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const category = categories.find(c => c.id === question.category);
                const Icon = category?.icon || Star;
                const isSelected = selectedQuestions.includes(question.id);
                
                return (
                  <Card key={question.id} className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="rounded border-gray-300 mt-1"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge className={category?.color}>
                              <Icon className="h-3 w-3 mr-1" />
                              {category?.name}
                            </Badge>
                            {question.isSensitive && (
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                Sensitive
                              </Badge>
                            )}
                            {question.isReverseScored && (
                              <Badge variant="outline" className="text-purple-600 border-purple-200">
                                Reverse Scored
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {question.variations} variations
                            </Badge>
                          </div>
                          
                          <p className="text-gray-900 font-medium mb-2">{question.text}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Languages: {question.languages.join(', ').toUpperCase()}</span>
                            <span>•</span>
                            <span>0-10 scale</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyQuestionText(question.text)}
                            title="Copy question text"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Preview question
                            }}
                            title="Preview question"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredQuestions.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                    <p className="text-gray-500">
                      Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
