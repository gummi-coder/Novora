import { Survey } from '@/types/survey';
import { apiConfig, log, debug, isFeatureEnabled } from '@/config/environment';

// Type definitions for API responses
interface CreateSurveyData {
  title: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  startDate?: Date;
  endDate?: Date;
  companyId: string;
  questions?: Array<{
    text: string;
    type: 'MULTIPLE_CHOICE' | 'RATING' | 'TEXT' | 'SCALE';
    options?: Record<string, any>;
    required: boolean;
    order: number;
  }>;
}

interface SurveyAnalytics {
  id: string;
  surveyId: string;
  responseCount: number;
  completionRate: number;
  averageRating?: number;
  sentimentScore?: number;
  lastUpdated: Date;
  data?: Record<string, any>;
}

interface AdminDashboardStats {
  totalUsers: number;
  totalSurveys: number;
  totalResponses: number;
  activeSurveys: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Enhanced API client with retry logic and better error handling
class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseUrl = apiConfig.fullUrl;
    this.timeout = apiConfig.timeout;
    this.retryAttempts = apiConfig.retryAttempts;
    
    debug(`API Client initialized with base URL: ${this.baseUrl}`);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new ApiError(response.status, error.message || 'An error occurred');
      }

      const data = await response.json();
      debug(`API ${options.method || 'GET'} ${endpoint} - Success`);
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      // Retry logic for network errors
      if (retryCount < this.retryAttempts && this.shouldRetry(error)) {
        log('warn', `API request failed, retrying (${retryCount + 1}/${this.retryAttempts}): ${endpoint}`);
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      log('error', `API request failed after ${retryCount + 1} attempts: ${endpoint}`, error);
      throw new ApiError(0, `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.name === 'AbortError' || // Timeout
      error.name === 'TypeError' || // Network error
      (error instanceof ApiError && error.status >= 500) // Server error
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper function to get auth headers
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>('/health');
  }

  // Survey endpoints
  async getSurveys(): Promise<Survey[]> {
    return this.makeRequest<Survey[]>('/surveys', {
      headers: this.getAuthHeaders()
    });
  }

  async getSurvey(id: string): Promise<Survey> {
    return this.makeRequest<Survey>(`/surveys/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  async createSurvey(data: CreateSurveyData): Promise<Survey> {
    return this.makeRequest<Survey>('/surveys', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
  }

  async updateSurvey(id: string, data: Partial<CreateSurveyData>): Promise<Survey> {
    return this.makeRequest<Survey>(`/surveys/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
  }

  async deleteSurvey(id: string): Promise<void> {
    return this.makeRequest<void>(`/surveys/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    return this.makeRequest<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  }

  async register(email: string, password: string, name: string): Promise<{ id: string; email: string; name: string }> {
    return this.makeRequest<{ id: string; email: string; name: string }>('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, company_name: name }),
    });
  }

  // User endpoints
  async getCurrentUser(): Promise<{ id: string; email: string; name: string }> {
    return this.makeRequest<{ id: string; email: string; name: string }>('/users/me', {
      headers: this.getAuthHeaders()
    });
  }

  // Admin - Users
  async getAdminUsers(params?: { skip?: number; limit?: number; role?: string; is_active?: boolean; search?: string; }): Promise<Array<{
      id: number;
      email: string;
      role: string;
      company_name?: string;
      is_active: boolean;
      is_email_verified: boolean;
      created_at: string;
      last_login?: string;
      failed_login_attempts: number;
    }>> {
    const sp = new URLSearchParams();
    if (params?.skip != null) sp.append('skip', String(params.skip));
    if (params?.limit != null) sp.append('limit', String(params.limit));
    if (params?.role) sp.append('role', params.role);
    if (params?.is_active != null) sp.append('is_active', String(params.is_active));
    if (params?.search) sp.append('search', params.search);
    const qs = sp.toString();
    return this.makeRequest<Array<{
      id: number;
      email: string;
      role: string;
      company_name?: string;
      is_active: boolean;
      is_email_verified: boolean;
      created_at: string;
      last_login?: string;
      failed_login_attempts: number;
    }>>(`/admin/users${qs ? `?${qs}` : ''}`, {
      headers: this.getAuthHeaders()
    });
  }

  async updateAdminUser(userId: number, updates: Partial<{ email: string; role: string; company_name: string; is_active: boolean; is_email_verified: boolean; }>): Promise<any> {
    return this.makeRequest<any>(`/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });
  }

  async deactivateAdminUser(userId: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
  }

  async activateAdminUser(userId: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/admin/users/${userId}/activate`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const sp = new URLSearchParams();
    sp.append('email', email);
    return this.makeRequest<{ message: string }>(`/auth/resend-verification?${sp.toString()}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  // Analytics endpoints
  async getSurveyAnalytics(surveyId: string): Promise<SurveyAnalytics> {
    return this.makeRequest<SurveyAnalytics>(`/analytics/surveys/${surveyId}`, {
      headers: this.getAuthHeaders()
    });
  }

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    return this.makeRequest<AdminDashboardStats>('/analytics/admin/dashboard', {
      headers: this.getAuthHeaders()
    });
  }

  async getSurveyList(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<SurveyAnalytics>> {
    return this.makeRequest<PaginatedResponse<SurveyAnalytics>>(
      `/analytics/surveys?page=${page}&pageSize=${pageSize}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<{
      totalSurveys: number;
      activeSurveys: number;
      totalResponses: number;
      responseRate: number;
    }> {
    return this.makeRequest<{
      totalSurveys: number;
      activeSurveys: number;
      totalResponses: number;
      responseRate: number;
    }>('/analytics/stats', {
      headers: this.getAuthHeaders()
    });
  }

  async getPulseOverview(): Promise<{
      currentScore: number;
      previousScore: number;
      trend: Array<{ month: string; score: number }>;
      alerts: Array<{ type: string; message: string; severity: string }>;
    }> {
    return this.makeRequest<{
      currentScore: number;
      previousScore: number;
      trend: Array<{ month: string; score: number }>;
      alerts: Array<{ type: string; message: string; severity: string }>;
    }>('/analytics/pulse-overview', {
      headers: this.getAuthHeaders()
    });
  }

  async getDashboardAlerts(): Promise<Array<{
      type: string;
      message: string;
      severity: string;
      createdAt: string;
    }>> {
    return this.makeRequest<Array<{
      type: string;
      message: string;
      severity: string;
      createdAt: string;
    }>>('/analytics/dashboard-alerts', {
      headers: this.getAuthHeaders()
    });
  }

  async getRecentActivity(): Promise<Array<{
      id: string;
      type: string;
      description: string;
      createdAt: string;
    }>> {
    return this.makeRequest<Array<{
      id: string;
      type: string;
      description: string;
      createdAt: string;
    }>>('/analytics/recent-activity', {
      headers: this.getAuthHeaders()
    });
  }

  async getTeamBreakdown(): Promise<Array<{
      id: string;
      name: string;
      avgScore: number;
      scoreChange: number;
      responseCount: number;
      comments: string[];
      sentiment: string;
      alerts: string[];
    }>> {
    return this.makeRequest<Array<{
      id: string;
      name: string;
      avgScore: number;
      scoreChange: number;
      responseCount: number;
      comments: string[];
      sentiment: string;
      alerts: string[];
    }>>('/analytics/team-breakdown', {
      headers: this.getAuthHeaders()
    });
  }

  async getAnonymousComments(filters?: {
    team?: string;
    sentiment?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<Array<{
      id: string;
      text: string;
      team: string;
      sentiment: string;
      createdAt: string;
      isPinned: boolean;
      isFlagged: boolean;
      tags: string[];
    }>> {
    const params = new URLSearchParams();
    if (filters?.team) params.append('team', filters.team);
    if (filters?.sentiment) params.append('sentiment', filters.sentiment);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    return this.makeRequest<Array<{
      id: string;
      text: string;
      team: string;
      sentiment: string;
      createdAt: string;
      isPinned: boolean;
      isFlagged: boolean;
      tags: string[];
    }>>(`/analytics/anonymous-comments?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });
  }

  async pinComment(commentId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/analytics/anonymous-comments/${commentId}/pin`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  async flagComment(commentId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/analytics/anonymous-comments/${commentId}/flag`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  // Quick Actions endpoints
  async exportDashboardPDF(): Promise<{
      message: string;
      download_url: string;
      expires_at: string;
    }> {
    return this.makeRequest<{
      message: string;
      download_url: string;
      expires_at: string;
    }>('/analytics/export-pdf', {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  async generateShareableLink(): Promise<{
      message: string;
      share_url: string;
      expires_at: string;
      access_level: string;
    }> {
    return this.makeRequest<{
      message: string;
      share_url: string;
      expires_at: string;
      access_level: string;
    }>('/analytics/generate-shareable-link', {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }



  async scheduleSurveyDelivery(scheduleData: {
    surveyId: string;
    deliveryDate: string;
    reminderEnabled: boolean;
    reminderDays: number;
  }): Promise<{
      message: string;
      delivery_date: string;
      reminder_enabled: boolean;
      schedule_id: string;
    }> {
    return this.makeRequest<{
      message: string;
      delivery_date: string;
      reminder_enabled: boolean;
      schedule_id: string;
    }>('/analytics/surveys/schedule', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });
  }

  // Advanced Capabilities endpoints
  async getSurveyBranchingLogic(surveyId: string): Promise<{
      survey_id: string;
      branching_rules: Array<{
        question_id: string;
        condition: string;
        next_question: string;
        skip_questions: string[];
      }>;
    }> {
    return this.makeRequest<{
      survey_id: string;
      branching_rules: Array<{
        question_id: string;
        condition: string;
        next_question: string;
        skip_questions: string[];
      }>;
    }>(`/analytics/survey-logic/branching?survey_id=${surveyId}`, {
      headers: this.getAuthHeaders()
    });
  }

  async updateSurveyBranchingLogic(surveyId: string, branchingData: any): Promise<{
      message: string;
      survey_id: string;
      rules_count: number;
    }> {
    return this.makeRequest<{
      message: string;
      survey_id: string;
      rules_count: number;
    }>(`/analytics/survey-logic/branching`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ survey_id: surveyId, ...branchingData })
    });
  }

  // Team Usage Snapshot for Owner Dashboard
  async getTeamUsageSnapshot(): Promise<any> {
    return this.makeRequest<any>('/analytics/team-usage-snapshot', {
      headers: this.getAuthHeaders(),
    });
  }

  // Survey Activity Log for Owner Dashboard
  async getSurveyActivityLog(): Promise<any> {
    return this.makeRequest<any>('/analytics/survey-activity-log', {
      headers: this.getAuthHeaders(),
    });
  }

  async updateScoreThreshold(threshold: any): Promise<any> {
    return this.makeRequest<any>('/analytics/score-threshold', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(threshold),
    });
  }

  async updateCommentTags(tags: any): Promise<any> {
    return this.makeRequest<any>('/analytics/comment-tags', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tags),
    });
  }

  // Plan & Billing Overview for Owner Dashboard
  async getPlanBillingOverview(): Promise<any> {
    return this.makeRequest<any>('/analytics/plan-billing-overview', {
      headers: this.getAuthHeaders(),
    });
  }

  // Support & Risk Flags for Owner Dashboard
  async getSupportRiskFlags(): Promise<any> {
    return this.makeRequest<any>('/analytics/support-risk-flags', {
      headers: this.getAuthHeaders(),
    });
  }

  async toggleTeamWatch(teamId: string, isWatched: boolean): Promise<any> {
    return this.makeRequest<any>(`/analytics/teams/${teamId}/watch`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ watched: isWatched }),
    });
  }

  // Anonymous Suggestion Box
  async submitSuggestion(suggestionData: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<any> {
    return this.makeRequest<any>('/suggestions', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(suggestionData),
    });
  }

  async voteSuggestion(suggestionId: string): Promise<any> {
    return this.makeRequest<any>('/suggestions/${suggestionId}/vote', {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
  }

  // Goal Tracking Dashboard
  async createGoal(goalData: {
    title: string;
    description: string;
    category: string;
    targetValue: number;
    unit: string;
    deadline: string;
    teamId?: string;
  }): Promise<any> {
    return this.makeRequest<any>('/goals', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(goalId: string, goalData: {
    title: string;
    description: string;
    category: string;
    targetValue: number;
    unit: string;
    deadline: string;
    teamId?: string;
  }): Promise<any> {
    return this.makeRequest<any>('/goals/${goalId}', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(goalData),
    });
  }

  async deleteGoal(goalId: string): Promise<any> {
    return this.makeRequest<any>('/goals/${goalId}', {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  // Predictive Trend Forecasting
  async refreshPredictions(params: {
    timeframe: string;
    metric: string;
  }): Promise<any> {
    return this.makeRequest<any>(`/predictions/refresh?timeframe=${params.timeframe}&metric=${params.metric}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
  }

  async exportPredictionReport(params: {
    timeframe: string;
    metric: string;
  }): Promise<any> {
    return this.makeRequest<any>(`/predictions/export?timeframe=${params.timeframe}&metric=${params.metric}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
  }

  async getDepartmentHierarchy(): Promise<{
      departments: Array<{
        id: string;
        name: string;
        level: number;
        children: Array<{
          id: string;
          name: string;
          level: number;
          permissions: string[];
        }>;
        permissions: string[];
      }>;
    }> {
    return this.makeRequest<{
      departments: Array<{
        id: string;
        name: string;
        level: number;
        children: Array<{
          id: string;
          name: string;
          level: number;
          permissions: string[];
        }>;
        permissions: string[];
      }>;
    }>('/analytics/department-hierarchy', {
      headers: this.getAuthHeaders()
    });
  }

  async updateDepartmentHierarchy(hierarchyData: any): Promise<{
      message: string;
      departments_count: number;
    }> {
    return this.makeRequest<{
      message: string;
      departments_count: number;
    }>(`/analytics/department-hierarchy`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(hierarchyData)
    });
  }

  async getPermissions(): Promise<{
      permissions: Array<{
        id: string;
        name: string;
        description: string;
        scope: string;
        enabled: boolean;
      }>;
      roles: Array<{
        id: string;
        name: string;
        permissions: string[];
        scope: string;
      }>;
    }> {
    return this.makeRequest<{
      permissions: Array<{
        id: string;
        name: string;
        description: string;
        scope: string;
        enabled: boolean;
      }>;
      roles: Array<{
        id: string;
        name: string;
        permissions: string[];
        scope: string;
      }>;
    }>('/analytics/permissions', {
      headers: this.getAuthHeaders()
    });
  }

  async updatePermissions(permissionsData: any): Promise<{
      message: string;
      permissions_count: number;
    }> {
    return this.makeRequest<{
      message: string;
      permissions_count: number;
    }>(`/analytics/permissions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(permissionsData)
    });
  }

  async getBrandingConfig(): Promise<{
      logo: string;
      primary_color: string;
      secondary_color: string;
      email_domain: string;
      survey_theme: string;
      custom_css: string;
      company_name: string;
    }> {
    return this.makeRequest<{
      logo: string;
      primary_color: string;
      secondary_color: string;
      email_domain: string;
      survey_theme: string;
      custom_css: string;
      company_name: string;
    }>('/analytics/branding', {
      headers: this.getAuthHeaders()
    });
  }

  async updateBrandingConfig(brandingData: any): Promise<{
      message: string;
      logo_url: string;
      theme: string;
    }> {
    return this.makeRequest<{
      message: string;
      logo_url: string;
      theme: string;
    }>(`/analytics/branding`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(brandingData)
    });
  }

  async getSSOConfig(): Promise<{
      enabled: boolean;
      provider: string;
      domain: string;
      metadata_url: string;
      entity_id: string;
    }> {
    return this.makeRequest<{
      enabled: boolean;
      provider: string;
      domain: string;
      metadata_url: string;
      entity_id: string;
    }>(`/analytics/sso/config`, {
      headers: this.getAuthHeaders()
    });
  }

  async updateSSOConfig(ssoData: any): Promise<{
      message: string;
      provider: string;
      enabled: boolean;
    }> {
    return this.makeRequest<{
      message: string;
      provider: string;
      enabled: boolean;
    }>(`/analytics/sso/config`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ssoData)
    });
  }

  async getAPIKeys(): Promise<{
      api_keys: Array<{
        id: string;
        name: string;
        key: string;
        created_at: string;
        last_used: string;
        permissions: string[];
      }>;
      webhook_urls: string[];
    }> {
    return this.makeRequest<{
      api_keys: Array<{
        id: string;
        name: string;
        key: string;
        created_at: string;
        last_used: string;
        permissions: string[];
      }>;
      webhook_urls: string[];
    }>(`/analytics/api/keys`, {
      headers: this.getAuthHeaders()
    });
  }

  async createAPIKey(keyData: any): Promise<{
      message: string;
      key: string;
      name: string;
      permissions: string[];
    }> {
    return this.makeRequest<{
      message: string;
      key: string;
      name: string;
      permissions: string[];
    }>(`/analytics/api/keys`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(keyData)
    });
  }

  async getSupportContact(): Promise<{
      email: string;
      phone: string;
      live_chat: boolean;
      dedicated_manager: {
        name: string;
        email: string;
        phone: string;
        available_hours: string;
      };
      priority_support: boolean;
      response_time: string;
    }> {
    return this.makeRequest<{
      email: string;
      phone: string;
      live_chat: boolean;
      dedicated_manager: {
        name: string;
        email: string;
        phone: string;
        available_hours: string;
      };
      priority_support: boolean;
      response_time: string;
    }>(`/analytics/support/contact`, {
      headers: this.getAuthHeaders()
    });
  }
}

export const api = new ApiClient(); 