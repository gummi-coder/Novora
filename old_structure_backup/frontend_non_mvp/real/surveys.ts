// Real surveys service
import { apiClient } from '../apiClient';

export const realSurveyService = {
  getSurveys: async () => {
    const response = await apiClient.get('/api/v1/surveys');
    return response.data;
  },
  
  createSurvey: async (data: any) => {
    const response = await apiClient.post('/api/v1/surveys', data);
    return response.data;
  },
  
  launchSurvey: async (data: any) => {
    const response = await apiClient.post('/api/v1/surveys/launch', data);
    return response.data;
  }
};
