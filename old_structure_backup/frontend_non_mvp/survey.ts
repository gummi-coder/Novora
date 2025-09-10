import { api } from "@/lib/api";

export interface SurveyData {
  id?: string;
  title: string;
  description: string;
  questions: Question[];
  language: string;
  branding: BrandingData;
  distribution: DistributionData;
  saveData: SaveData;
  status?: 'draft' | 'active' | 'closed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  order: number;
  required: boolean;
  type?: string;
  options?: any[];
}

export interface BrandingData {
  logo: File | null;
  primaryColor: string;
  secondaryColor: string;
  customCSS: string;
  companyName: string;
  surveyTitle: string;
  surveyDescription: string;
}

export interface DistributionData {
  channels: string[];
  emailTemplate: string;
  reminderFrequency: string;
  startDate: Date;
  endDate: Date;
  maxResponses: number;
  allowAnonymous: boolean;
}

export interface SaveData {
  saveAsTemplate: boolean;
  templateName: string;
  sendImmediately: boolean;
  scheduleSend: boolean;
  scheduledDate: Date;
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  category: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

class SurveyService {
  // Save survey as draft
  async saveSurvey(surveyData: SurveyData): Promise<SurveyData> {
    try {
      const response = await api.post('/surveys', {
        ...surveyData,
        status: 'draft'
      });
      return response.data;
    } catch (error) {
      console.error('Error saving survey:', error);
      throw error;
    }
  }

  // Save survey as template
  async saveAsTemplate(surveyData: SurveyData, templateName: string): Promise<SurveyTemplate> {
    try {
      const response = await api.post('/survey-templates', {
        name: templateName,
        description: surveyData.description,
        questions: surveyData.questions,
        category: 'custom',
        isPublic: false
      });
      return response.data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  // Send survey
  async sendSurvey(surveyData: SurveyData): Promise<SurveyData> {
    try {
      const response = await api.post('/surveys/send', {
        ...surveyData,
        status: 'active'
      });
      return response.data;
    } catch (error) {
      console.error('Error sending survey:', error);
      throw error;
    }
  }

  // Schedule survey
  async scheduleSurvey(surveyData: SurveyData, scheduledDate: Date): Promise<SurveyData> {
    try {
      const response = await api.post('/surveys/schedule', {
        ...surveyData,
        scheduledDate,
        status: 'scheduled'
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling survey:', error);
      throw error;
    }
  }

  // Get survey by ID
  async getSurvey(id: string): Promise<SurveyData> {
    try {
      const response = await api.get(`/surveys/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting survey:', error);
      throw error;
    }
  }

  // Update survey
  async updateSurvey(id: string, surveyData: Partial<SurveyData>): Promise<SurveyData> {
    try {
      const response = await api.put(`/surveys/${id}`, surveyData);
      return response.data;
    } catch (error) {
      console.error('Error updating survey:', error);
      throw error;
    }
  }

  // Get user's surveys
  async getUserSurveys(): Promise<SurveyData[]> {
    try {
      const response = await api.get('/surveys');
      return response.data;
    } catch (error) {
      console.error('Error getting user surveys:', error);
      throw error;
    }
  }

  // Get survey templates
  async getSurveyTemplates(): Promise<SurveyTemplate[]> {
    try {
      const response = await api.get('/survey-templates');
      return response.data;
    } catch (error) {
      console.error('Error getting survey templates:', error);
      throw error;
    }
  }

  // Delete survey
  async deleteSurvey(id: string): Promise<void> {
    try {
      await api.delete(`/surveys/${id}`);
    } catch (error) {
      console.error('Error deleting survey:', error);
      throw error;
    }
  }

  // Duplicate survey
  async duplicateSurvey(id: string): Promise<SurveyData> {
    try {
      const response = await api.post(`/surveys/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating survey:', error);
      throw error;
    }
  }

  // Get survey analytics
  async getSurveyAnalytics(id: string): Promise<any> {
    try {
      const response = await api.get(`/surveys/${id}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error getting survey analytics:', error);
      throw error;
    }
  }

  // Export survey responses
  async exportResponses(id: string, format: 'csv' | 'excel' | 'json' = 'csv'): Promise<Blob> {
    try {
      const response = await api.get(`/surveys/${id}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting responses:', error);
      throw error;
    }
  }

  // Upload logo
  async uploadLogo(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await api.post('/uploads/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  }

  // Validate survey data
  validateSurveyData(surveyData: SurveyData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!surveyData.title?.trim()) {
      errors.push('Survey title is required');
    }

    if (!surveyData.questions?.length) {
      errors.push('At least one question is required');
    }

    if (surveyData.questions?.length > 20) {
      errors.push('Maximum 20 questions allowed');
    }

    if (!surveyData.distribution?.channels?.length) {
      errors.push('At least one distribution channel is required');
    }

    if (surveyData.distribution?.startDate >= surveyData.distribution?.endDate) {
      errors.push('End date must be after start date');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate survey link
  generateSurveyLink(surveyId: string): string {
    return `${window.location.origin}/survey/${surveyId}`;
  }

  // Generate QR code for survey
  generateQRCode(surveyId: string): string {
    const surveyLink = this.generateSurveyLink(surveyId);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyLink)}`;
  }

  // Save to local storage (for offline functionality)
  saveToLocalStorage(surveyData: SurveyData): void {
    try {
      const surveys = this.getFromLocalStorage();
      const existingIndex = surveys.findIndex(s => s.id === surveyData.id);
      
      if (existingIndex >= 0) {
        surveys[existingIndex] = { ...surveyData, updatedAt: new Date().toISOString() };
      } else {
        surveys.push({ ...surveyData, id: `local_${Date.now()}`, createdAt: new Date().toISOString() });
      }
      
      localStorage.setItem('novora_surveys', JSON.stringify(surveys));
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  }

  // Get from local storage
  getFromLocalStorage(): SurveyData[] {
    try {
      const data = localStorage.getItem('novora_surveys');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from local storage:', error);
      return [];
    }
  }

  // Sync local surveys with server
  async syncLocalSurveys(): Promise<void> {
    try {
      const localSurveys = this.getFromLocalStorage();
      const unsyncedSurveys = localSurveys.filter(s => s.id?.startsWith('local_'));
      
      for (const survey of unsyncedSurveys) {
        try {
          await this.saveSurvey(survey);
          // Remove from local storage after successful sync
          const surveys = this.getFromLocalStorage();
          const filteredSurveys = surveys.filter(s => s.id !== survey.id);
          localStorage.setItem('novora_surveys', JSON.stringify(filteredSurveys));
        } catch (error) {
          console.error(`Error syncing survey ${survey.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error syncing local surveys:', error);
    }
  }
}

export const surveyService = new SurveyService(); 