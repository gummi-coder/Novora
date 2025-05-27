import { Survey, CreateSurveyInput, UpdateSurveyInput } from '../types/survey';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

export const surveyService = {
  async createSurvey(survey: CreateSurveyInput): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(survey),
    });

    if (!response.ok) {
      throw new Error('Failed to create survey');
    }

    return response.json();
  },

  async updateSurvey(survey: UpdateSurveyInput): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${survey.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(survey),
    });

    if (!response.ok) {
      throw new Error('Failed to update survey');
    }

    return response.json();
  },

  async getSurvey(id: string): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch survey');
    }

    return response.json();
  },

  async listSurveys(): Promise<Survey[]> {
    const response = await fetch(`${API_BASE_URL}/surveys`);

    if (!response.ok) {
      throw new Error('Failed to fetch surveys');
    }

    return response.json();
  },

  async deleteSurvey(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete survey');
    }
  },
}; 