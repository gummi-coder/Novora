// Real analytics service
import { apiClient } from '../apiClient';

export const realAnalyticsService = {
  getAnalytics: async () => {
    const response = await apiClient.get('/api/v1/analytics');
    return response.data;
  },
  
  getSurveyAnalytics: async (surveyId: string) => {
    const response = await apiClient.get(`/api/v1/analytics/surveys/${surveyId}`);
    return response.data;
  }
};
