import {
  SurveyResponse,
  CreateSurveyResponseInput,
  UpdateSurveyResponseInput,
} from '../types/surveyResponse';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

export const surveyResponseService = {
  async createResponse(input: CreateSurveyResponseInput): Promise<SurveyResponse> {
    const response = await fetch(`${API_BASE_URL}/survey-responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Failed to submit survey response');
    }

    return response.json();
  },

  async updateResponse(input: UpdateSurveyResponseInput): Promise<SurveyResponse> {
    const response = await fetch(`${API_BASE_URL}/survey-responses/${input.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Failed to update survey response');
    }

    return response.json();
  },

  async getResponse(id: string): Promise<SurveyResponse> {
    const response = await fetch(`${API_BASE_URL}/survey-responses/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch survey response');
    }

    return response.json();
  },

  async getUserResponses(surveyId: string): Promise<SurveyResponse[]> {
    const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}/responses`);

    if (!response.ok) {
      throw new Error('Failed to fetch user responses');
    }

    return response.json();
  },

  // For future autosave functionality
  async saveDraft(input: CreateSurveyResponseInput): Promise<SurveyResponse> {
    const response = await fetch(`${API_BASE_URL}/survey-responses/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...input,
        status: 'IN_PROGRESS',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save draft');
    }

    return response.json();
  },
}; 