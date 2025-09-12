import axios from 'axios';
import { Survey, Question, Response, SurveyAnalytics } from '../types/survey';

const API_URL = import.meta.env.VITE_API_URL;

export const surveyService = {
  // Survey Management
  async createSurvey(survey: Partial<Survey>): Promise<Survey> {
    const response = await axios.post(`${API_URL}/surveys`, survey);
    return response.data;
  },

  async getSurveys(companyId: string): Promise<Survey[]> {
    const response = await axios.get(`${API_URL}/surveys`, {
      params: { companyId }
    });
    return response.data;
  },

  async getSurvey(id: string): Promise<Survey> {
    const response = await axios.get(`${API_URL}/surveys/${id}`);
    return response.data;
  },

  async updateSurvey(id: string, survey: Partial<Survey>): Promise<Survey> {
    const response = await axios.put(`${API_URL}/surveys/${id}`, survey);
    return response.data;
  },

  async deleteSurvey(id: string): Promise<void> {
    await axios.delete(`${API_URL}/surveys/${id}`);
  },

  // Question Management
  async addQuestion(surveyId: string, question: Partial<Question>): Promise<Question> {
    const response = await axios.post(`${API_URL}/surveys/${surveyId}/questions`, question);
    return response.data;
  },

  async updateQuestion(surveyId: string, questionId: string, question: Partial<Question>): Promise<Question> {
    const response = await axios.put(`${API_URL}/surveys/${surveyId}/questions/${questionId}`, question);
    return response.data;
  },

  async deleteQuestion(surveyId: string, questionId: string): Promise<void> {
    await axios.delete(`${API_URL}/surveys/${surveyId}/questions/${questionId}`);
  },

  // Response Management
  async submitResponse(surveyId: string, response: Partial<Response>): Promise<Response> {
    const response = await axios.post(`${API_URL}/surveys/${surveyId}/responses`, response);
    return response.data;
  },

  async getResponses(surveyId: string): Promise<Response[]> {
    const response = await axios.get(`${API_URL}/surveys/${surveyId}/responses`);
    return response.data;
  },

  // Analytics
  async getSurveyAnalytics(surveyId: string): Promise<SurveyAnalytics> {
    const response = await axios.get(`${API_URL}/surveys/${surveyId}/analytics`);
    return response.data;
  },

  // Export
  async exportSurveyData(surveyId: string, format: 'pdf' | 'csv'): Promise<Blob> {
    const response = await axios.get(`${API_URL}/surveys/${surveyId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
}; 