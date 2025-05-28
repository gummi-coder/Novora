export interface Survey {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  startDate?: Date;
  endDate?: Date;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  questions?: Question[];
  responses?: Response[];
  analytics?: SurveyAnalytics;
}

export interface Question {
  id: string;
  surveyId: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'RATING' | 'TEXT' | 'SCALE';
  options?: Record<string, any>;
  required: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  responses?: Response[];
}

export interface Response {
  id: string;
  surveyId: string;
  questionId: string;
  userId: string;
  answer: Record<string, any>;
  submittedAt: Date;
}

export interface SurveyAnalytics {
  id: string;
  surveyId: string;
  responseCount: number;
  completionRate: number;
  averageRating?: number;
  sentimentScore?: number;
  lastUpdated: Date;
  data?: Record<string, any>;
} 