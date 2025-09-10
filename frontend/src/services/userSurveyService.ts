const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface UserSurveyToken {
  survey_id: number;
  token: string;
  survey_link: string;
  expires_at: string | null;
}

export interface SurveyResponse {
  survey_id: number;
  score: number;
  comment?: string;
}

class UserSurveyService {
  private getAuthHeaders() {
    const token = localStorage.getItem('mvp_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async generateSurveyToken(surveyId: number): Promise<UserSurveyToken> {
    const response = await fetch(`${API_BASE_URL}/user/surveys/${surveyId}/generate-token`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to generate survey token');
    }

    return response.json();
  }

  async getSurveyByToken(token: string) {
    const response = await fetch(`${API_BASE_URL}/user/survey/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get survey');
    }

    return response.json();
  }

  async submitSurveyResponse(token: string, response: SurveyResponse) {
    const apiResponse = await fetch(`${API_BASE_URL}/user/survey/${token}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    });

    if (!apiResponse.ok) {
      throw new Error('Failed to submit survey response');
    }

    return apiResponse.json();
  }

  async getUserSurveys(userId: number) {
    const response = await fetch(`${API_BASE_URL}/user/surveys/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user surveys');
    }

    return response.json();
  }
}

export const userSurveyService = new UserSurveyService();
