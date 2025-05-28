import { z } from 'zod';

// Survey Template Types
export const SurveyTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  questions: z.array(z.object({
    id: z.string().uuid(),
    type: z.enum(['multiple_choice', 'rating', 'text', 'boolean']),
    text: z.string(),
    options: z.array(z.string()).optional(),
    required: z.boolean().default(false),
    order: z.number(),
  })),
  version: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
});

export type SurveyTemplate = z.infer<typeof SurveyTemplateSchema>;

// Survey Instance Types
export const SurveyInstanceSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  companyId: z.string().uuid(),
  assignedTo: z.array(z.string().uuid()),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  responses: z.array(z.object({
    userId: z.string().uuid(),
    answers: z.array(z.object({
      questionId: z.string().uuid(),
      value: z.union([z.string(), z.number(), z.boolean()]),
      submittedAt: z.date(),
    })),
  })),
  metadata: z.record(z.unknown()).optional(),
});

export type SurveyInstance = z.infer<typeof SurveyInstanceSchema>;

// Survey Analytics Types
export const SurveyAnalyticsSchema = z.object({
  surveyId: z.string().uuid(),
  responseRate: z.number(),
  averageCompletionTime: z.number(),
  questionAnalytics: z.array(z.object({
    questionId: z.string().uuid(),
    responseCount: z.number(),
    averageRating: z.number().optional(),
    distribution: z.record(z.number()).optional(),
    sentiment: z.object({
      positive: z.number(),
      neutral: z.number(),
      negative: z.number(),
    }).optional(),
  })),
  demographicBreakdown: z.record(z.number()).optional(),
  trends: z.array(z.object({
    timestamp: z.date(),
    metrics: z.record(z.number()),
  })),
});

export type SurveyAnalytics = z.infer<typeof SurveyAnalyticsSchema>;

// Dashboard Integration Types
export const DashboardSurveyWidgetSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['response_rate', 'sentiment_analysis', 'question_breakdown', 'trend_analysis']),
  surveyId: z.string().uuid(),
  config: z.object({
    refreshInterval: z.number().optional(),
    filters: z.record(z.unknown()).optional(),
    visualization: z.enum(['bar', 'line', 'pie', 'table']),
    timeRange: z.object({
      start: z.date(),
      end: z.date(),
    }).optional(),
  }),
});

export type DashboardSurveyWidget = z.infer<typeof DashboardSurveyWidgetSchema>;

// API Response Types
export const SurveyAPIResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }).optional(),
});

export type SurveyAPIResponse = z.infer<typeof SurveyAPIResponseSchema>; 