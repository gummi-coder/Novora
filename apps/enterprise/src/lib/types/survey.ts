export type SurveyLanguage = 'en' | 'is' | 'pl' | 'lt';

export type QuestionType = 'scale_1_10';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  leftLabel: string;
  rightLabel: string;
}

export interface SurveyPage {
  id: string;
  title: string;
  questions: Question[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  languages: SurveyLanguage[];
  pages: SurveyPage[];
  finalQuestion: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'draft' | 'active' | 'closed';
  shareLink?: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  language: SurveyLanguage;
  answers: {
    questionId: string;
    answer: string | number;
  }[];
  finalComment?: string;
  submittedAt: string;
} 