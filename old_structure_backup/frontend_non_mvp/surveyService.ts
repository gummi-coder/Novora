import { apiClient } from './apiClient';

export interface SurveyLaunchRequest {
  title: string;
  description: string;
  questions: any[];
  target_audience: string;
  path: string;
  schedule: any;
  branding: any;
}

export interface SurveyLaunchResponse {
  success: boolean;
  message: string;
  survey_id: string;
  invite_count: number;
}

export const surveyService = {
  async launchSurvey(data: SurveyLaunchRequest): Promise<SurveyLaunchResponse> {
    const response = await apiClient.post('/api/v1/surveys/launch', data);
    return response.data;
  },

  async getSurveys() {
    const response = await apiClient.get('/api/v1/surveys');
    return response.data;
  },

  async getSurvey(id: string) {
    const response = await apiClient.get(`/api/v1/surveys/${id}`);
    return response.data;
  }
};
