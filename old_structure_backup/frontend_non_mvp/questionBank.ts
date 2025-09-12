import { api } from '@/lib/api';

export interface Metric {
  id: number;
  name: string;
  category: string;
  description: string;
  is_core: boolean;
  display_order: number;
}

export interface Question {
  id: number;
  metric_id: number;
  metric_name: string;
  metric_category: string;
  question_text: string;
  variation_order: number;
  sensitive: boolean;
  reverse_scored: boolean;
  active: boolean;
}

export interface MetricWithQuestions extends Metric {
  questions: Question[];
}

export class QuestionBankService {
  // Get all metrics (public endpoint for survey builder)
  static async getMetrics(includeCoreOnly: boolean = false): Promise<Metric[]> {
    console.log('🔍 QuestionBankService.getMetrics called');
    const url = `http://127.0.0.1:8000/api/v1/question-bank/public/metrics${includeCoreOnly ? '?include_core_only=true' : ''}`;
    console.log('📡 Fetching from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Metrics loaded:', data);
    return data;
  }

  // Get a specific metric with its questions
  static async getMetric(metricId: number): Promise<MetricWithQuestions> {
    const response = await api.get(`/question-bank/metrics/${metricId}`);
    return response.data;
  }

  // Get questions with optional filtering (public endpoint for survey builder)
  static async getQuestions(params?: {
    metricId?: number;
    category?: string;
    activeOnly?: boolean;
    language?: string;
  }): Promise<Question[]> {
    console.log('🔍 QuestionBankService.getQuestions called');
    const url = new URL('http://127.0.0.1:8000/api/v1/question-bank/public/questions');
    if (params) {
      if (params.metricId) url.searchParams.append('metric_id', params.metricId.toString());
      if (params.category) url.searchParams.append('category', params.category);
      if (params.activeOnly !== undefined) url.searchParams.append('active_only', params.activeOnly.toString());
      if (params.language) url.searchParams.append('language', params.language);
    }
    console.log('📡 Fetching from:', url.toString());
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Questions loaded:', data);
    return data;
  }

  // Get random questions for auto-pilot rotation
  static async getRandomQuestions(params: {
    metricIds: number[];
    countPerMetric: number;
    excludeQuestions?: number[];
  }): Promise<Question[]> {
    const response = await api.get('/question-bank/questions/random', {
      params: {
        metric_ids: params.metricIds,
        count_per_metric: params.countPerMetric,
        exclude_questions: params.excludeQuestions || []
      }
    });
    return response.data;
  }

  // Get a specific question
  static async getQuestion(questionId: number, language: string = 'en'): Promise<Question> {
    const response = await api.get(`/question-bank/questions/${questionId}`, {
      params: { language }
    });
    return response.data;
  }

  // Admin functions
  static async createMetric(metricData: Partial<Metric>): Promise<Metric> {
    const response = await api.post('/question-bank/admin/metrics', metricData);
    return response.data;
  }

  static async createQuestion(questionData: Partial<Question>): Promise<Question> {
    const response = await api.post('/question-bank/admin/questions', questionData);
    return response.data;
  }

  static async updateQuestion(questionId: number, questionData: Partial<Question>): Promise<Question> {
    const response = await api.put(`/question-bank/admin/questions/${questionId}`, questionData);
    return response.data;
  }

  static async deleteQuestion(questionId: number): Promise<{ message: string }> {
    const response = await api.delete(`/question-bank/admin/questions/${questionId}`);
    return response.data;
  }
}

// Helper function to get questions by category
export const getQuestionsByCategory = async (category: string): Promise<Question[]> => {
  return QuestionBankService.getQuestions({ category, activeOnly: true });
};

// Helper function to get core metrics
export const getCoreMetrics = async (): Promise<Metric[]> => {
  return QuestionBankService.getMetrics(true);
};

// Helper function to get all metrics with their questions
export const getAllMetricsWithQuestions = async (): Promise<MetricWithQuestions[]> => {
  const metrics = await QuestionBankService.getMetrics();
  const metricsWithQuestions = await Promise.all(
    metrics.map(metric => QuestionBankService.getMetric(metric.id))
  );
  return metricsWithQuestions;
};
