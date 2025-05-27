import { Survey, RatingScaleQuestion } from './survey';

export interface RatingScaleResponse {
  questionId: string;
  value: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  companyId: string;
  responses: RatingScaleResponse[];
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: Date;
  completedAt?: Date;
  isAnonymous: boolean;
}

export interface CreateSurveyResponseInput {
  surveyId: string;
  responses: RatingScaleResponse[];
  isAnonymous: boolean;
}

export interface UpdateSurveyResponseInput {
  id: string;
  responses: RatingScaleResponse[];
}

export interface SurveyResponseFormState {
  responses: {
    [questionId: string]: number;
  };
  isSubmitting: boolean;
  errors: {
    [questionId: string]: string;
  };
}

export interface SurveyResponseProgress {
  totalQuestions: number;
  answeredQuestions: number;
  isComplete: boolean;
  percentage: number;
} 