import { api } from "@/lib/api";

export interface AutoPilotPlan {
  id?: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  questionRotation: boolean;
  reminderSettings: ReminderSettings;
  distributionChannels: string[];
  targetAudience: string[];
  maxResponses?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'biweekly';
  maxReminders: number;
  delayDays: number;
  messageTemplate: string;
  excludeResponded: boolean;
  autoCloseAfterDays: number;
  reminderDays: number[];
}

export interface AutoPilotSurvey {
  id?: string;
  planId: string;
  surveyId: string;
  scheduledDate: Date;
  sentDate?: Date;
  status: 'scheduled' | 'sent' | 'completed' | 'failed';
  questionSet: QuestionSet;
  reminderCount: number;
  lastReminderDate?: Date;
  responseCount: number;
  targetCount: number;
}

export interface QuestionSet {
  id: string;
  name: string;
  questions: Question[];
  category: string;
  rotationIndex: number;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  order: number;
  required: boolean;
  variations?: string[];
  currentVariation?: number;
}

export interface AutoPilotMetrics {
  totalSurveys: number;
  activePlans: number;
  averageResponseRate: number;
  totalResponses: number;
  nextScheduledSurvey?: Date;
  recentActivity: AutoPilotActivity[];
}

export interface AutoPilotActivity {
  id: string;
  type: 'survey_sent' | 'reminder_sent' | 'plan_created' | 'plan_updated';
  description: string;
  timestamp: Date;
  planId?: string;
  surveyId?: string;
}

class AutoPilotService {
  // Auto-Pilot Plan Management
  async createPlan(plan: AutoPilotPlan): Promise<AutoPilotPlan> {
    try {
      const response = await api.post('/auto-pilot/plans', plan);
      return response.data;
    } catch (error) {
      console.error('Error creating auto-pilot plan:', error);
      throw error;
    }
  }

  async getPlans(): Promise<AutoPilotPlan[]> {
    try {
      const response = await api.get('/auto-pilot/plans');
      return response.data;
    } catch (error) {
      console.error('Error getting auto-pilot plans:', error);
      throw error;
    }
  }

  async getPlan(id: string): Promise<AutoPilotPlan> {
    try {
      const response = await api.get(`/auto-pilot/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting auto-pilot plan:', error);
      throw error;
    }
  }

  async updatePlan(id: string, plan: Partial<AutoPilotPlan>): Promise<AutoPilotPlan> {
    try {
      const response = await api.put(`/auto-pilot/plans/${id}`, plan);
      return response.data;
    } catch (error) {
      console.error('Error updating auto-pilot plan:', error);
      throw error;
    }
  }

  async deletePlan(id: string): Promise<void> {
    try {
      await api.delete(`/auto-pilot/plans/${id}`);
    } catch (error) {
      console.error('Error deleting auto-pilot plan:', error);
      throw error;
    }
  }

  async activatePlan(id: string): Promise<AutoPilotPlan> {
    try {
      const response = await api.post(`/auto-pilot/plans/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating auto-pilot plan:', error);
      throw error;
    }
  }

  async deactivatePlan(id: string): Promise<AutoPilotPlan> {
    try {
      const response = await api.post(`/auto-pilot/plans/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating auto-pilot plan:', error);
      throw error;
    }
  }

  // Auto-Pilot Survey Management
  async getScheduledSurveys(planId?: string): Promise<AutoPilotSurvey[]> {
    try {
      const params = planId ? { planId } : {};
      const response = await api.get('/auto-pilot/surveys', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting scheduled surveys:', error);
      throw error;
    }
  }

  async getSurvey(id: string): Promise<AutoPilotSurvey> {
    try {
      const response = await api.get(`/auto-pilot/surveys/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting auto-pilot survey:', error);
      throw error;
    }
  }

  async updateSurvey(id: string, survey: Partial<AutoPilotSurvey>): Promise<AutoPilotSurvey> {
    try {
      const response = await api.put(`/auto-pilot/surveys/${id}`, survey);
      return response.data;
    } catch (error) {
      console.error('Error updating auto-pilot survey:', error);
      throw error;
    }
  }

  async cancelSurvey(id: string): Promise<void> {
    try {
      await api.post(`/auto-pilot/surveys/${id}/cancel`);
    } catch (error) {
      console.error('Error canceling auto-pilot survey:', error);
      throw error;
    }
  }

  // Question Rotation Management
  async getQuestionSets(category?: string): Promise<QuestionSet[]> {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/auto-pilot/question-sets', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting question sets:', error);
      throw error;
    }
  }

  async createQuestionSet(questionSet: QuestionSet): Promise<QuestionSet> {
    try {
      const response = await api.post('/auto-pilot/question-sets', questionSet);
      return response.data;
    } catch (error) {
      console.error('Error creating question set:', error);
      throw error;
    }
  }

  async rotateQuestions(planId: string): Promise<QuestionSet> {
    try {
      const response = await api.post(`/auto-pilot/plans/${planId}/rotate-questions`);
      return response.data;
    } catch (error) {
      console.error('Error rotating questions:', error);
      throw error;
    }
  }

  // Reminder System
  async sendReminder(surveyId: string): Promise<void> {
    try {
      await api.post(`/auto-pilot/surveys/${surveyId}/send-reminder`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  async getReminderHistory(surveyId: string): Promise<any[]> {
    try {
      const response = await api.get(`/auto-pilot/surveys/${surveyId}/reminders`);
      return response.data;
    } catch (error) {
      console.error('Error getting reminder history:', error);
      throw error;
    }
  }

  async updateReminderSettings(planId: string, settings: ReminderSettings): Promise<AutoPilotPlan> {
    try {
      const response = await api.put(`/auto-pilot/plans/${planId}/reminder-settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      throw error;
    }
  }

  // Metrics and Analytics
  async getMetrics(): Promise<AutoPilotMetrics> {
    try {
      const response = await api.get('/auto-pilot/metrics');
      return response.data;
    } catch (error) {
      console.error('Error getting auto-pilot metrics:', error);
      throw error;
    }
  }

  async getActivityLog(planId?: string, limit?: number): Promise<AutoPilotActivity[]> {
    try {
      const params: any = {};
      if (planId) params.planId = planId;
      if (limit) params.limit = limit;
      
      const response = await api.get('/auto-pilot/activity', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting activity log:', error);
      throw error;
    }
  }

  // Scheduling Logic
  calculateNextSurveyDate(plan: AutoPilotPlan, lastSurveyDate?: Date): Date {
    const baseDate = lastSurveyDate || plan.startDate;
    const frequency = plan.frequency;
    
    switch (frequency) {
      case 'daily':
        return new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'biweekly':
        return new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'quarterly':
        return new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  calculateReminderDate(surveyDate: Date, reminderDay: number): Date {
    return new Date(surveyDate.getTime() + reminderDay * 24 * 60 * 60 * 1000);
  }

  shouldSendReminder(survey: AutoPilotSurvey, settings: ReminderSettings): boolean {
    if (!settings.enabled) return false;
    if (survey.reminderCount >= settings.maxReminders) return false;
    if (survey.responseCount >= survey.targetCount * 0.8) return false; // 80% response rate threshold
    
    const surveyDate = survey.sentDate;
    if (!surveyDate) return false;
    
    // Check if it's time for the next reminder based on predefined days
    const reminderDays = settings.reminderDays || [3, 7]; // Default to Day 3 and Day 7 reminders
    const currentDay = Math.floor((new Date().getTime() - new Date(surveyDate).getTime()) / (24 * 60 * 60 * 1000));
    
    // Check if we should send a reminder today
    const shouldSendToday = reminderDays.includes(currentDay) && 
                           survey.reminderCount < reminderDays.indexOf(currentDay) + 1;
    
    return shouldSendToday;
  }

  shouldCloseSurvey(survey: AutoPilotSurvey, settings: ReminderSettings): boolean {
    if (!settings.enabled) return false;
    
    const surveyDate = survey.sentDate;
    if (!surveyDate) return false;
    
    // Close survey based on auto-close setting
    const autoCloseDays = settings.autoCloseAfterDays || 10; // Default to 10 days
    const daysSinceSent = Math.floor((new Date().getTime() - new Date(surveyDate).getTime()) / (24 * 60 * 60 * 1000));
    return daysSinceSent >= autoCloseDays;
  }

  // Question Rotation Logic
  generateQuestionVariations(question: Question): string[] {
    if (question.variations && question.variations.length > 0) {
      return question.variations;
    }
    
    // Generate variations based on question category
    const variations: { [key: string]: string[] } = {
      satisfaction: [
        "How satisfied are you with your current role?",
        "Overall, how satisfied are you with your job right now?",
        "How positive is your daily experience at work?",
        "Do you feel good about coming to work each day?",
        "How content are you with your current responsibilities?"
      ],
      enps: [
        "How likely are you to recommend working here to a friend?",
        "Would you tell a friend this is a good place to work?",
        "How likely are you to encourage others to join this company?",
        "If a friend was job-hunting, would you suggest they apply here?",
        "Would you speak positively about working here to others?"
      ],
      manager: [
        "Do you feel supported by your manager?",
        "How well does your manager help you succeed?",
        "Do you trust your manager's leadership?",
        "Does your manager listen to your ideas and concerns?",
        "How approachable is your manager when you need help?"
      ],
      collaboration: [
        "How connected do you feel with your teammates?",
        "Do you feel like you belong in your team?",
        "How well do you and your teammates work together?",
        "Do your colleagues support you when needed?",
        "How good is the teamwork in your department?"
      ]
    };
    
    return variations[question.category] || [question.text];
  }

  rotateQuestionText(question: Question): string {
    const variations = this.generateQuestionVariations(question);
    const currentIndex = question.currentVariation || 0;
    const nextIndex = (currentIndex + 1) % variations.length;
    
    return variations[nextIndex];
  }

  // Validation
  validatePlan(plan: AutoPilotPlan): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!plan.name?.trim()) {
      errors.push('Plan name is required');
    }

    if (!plan.frequency) {
      errors.push('Frequency is required');
    }

    if (!plan.startDate) {
      errors.push('Start date is required');
    }

    if (plan.endDate && plan.startDate >= plan.endDate) {
      errors.push('End date must be after start date');
    }

    if (!plan.distributionChannels?.length) {
      errors.push('At least one distribution channel is required');
    }

    if (!plan.targetAudience?.length) {
      errors.push('Target audience is required');
    }

    if (plan.reminderSettings.enabled) {
      if (plan.reminderSettings.maxReminders < 1) {
        errors.push('Maximum reminders must be at least 1');
      }
      if (plan.reminderSettings.autoCloseAfterDays < 1) {
        errors.push('Auto-close days must be at least 1');
      }
      if (!plan.reminderSettings.reminderDays?.length) {
        errors.push('Reminder days must be specified');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Local Storage for offline functionality
  savePlanToLocalStorage(plan: AutoPilotPlan): void {
    try {
      const plans = this.getPlansFromLocalStorage();
      const existingIndex = plans.findIndex(p => p.id === plan.id);
      
      if (existingIndex >= 0) {
        plans[existingIndex] = { ...plan, updatedAt: new Date().toISOString() };
      } else {
        plans.push({ ...plan, id: `local_${Date.now()}`, createdAt: new Date().toISOString() });
      }
      
      localStorage.setItem('novora_auto_pilot_plans', JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving plan to local storage:', error);
    }
  }

  getPlansFromLocalStorage(): AutoPilotPlan[] {
    try {
      const data = localStorage.getItem('novora_auto_pilot_plans');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading plans from local storage:', error);
      return [];
    }
  }

  // Sync local plans with server
  async syncLocalPlans(): Promise<void> {
    try {
      const localPlans = this.getPlansFromLocalStorage();
      const unsyncedPlans = localPlans.filter(p => p.id?.startsWith('local_'));
      
      for (const plan of unsyncedPlans) {
        try {
          await this.createPlan(plan);
          // Remove from local storage after successful sync
          const plans = this.getPlansFromLocalStorage();
          const filteredPlans = plans.filter(p => p.id !== plan.id);
          localStorage.setItem('novora_auto_pilot_plans', JSON.stringify(filteredPlans));
        } catch (error) {
          console.error(`Error syncing plan ${plan.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error syncing local plans:', error);
    }
  }
}

export const autoPilotService = new AutoPilotService();
