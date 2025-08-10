import { Survey } from '@/types/survey';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : 'http://127.0.0.1:8000/api/v1';

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message || 'An error occurred');
  }
  return response.json();
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export const api = {
  healthCheck: async () => {
    const response = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string }>(response);
  },

  // Survey endpoints
  getSurveys: async () => {
    const response = await fetch(`${API_BASE}/surveys`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Survey[]>(response);
  },

  getSurvey: async (id: string) => {
    const response = await fetch(`${API_BASE}/surveys/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Survey>(response);
  },

  createSurvey: async (data: CreateSurveyData) => {
    const response = await fetch(`${API_BASE}/surveys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Survey>(response);
  },

  updateSurvey: async (id: string, data: Partial<CreateSurveyData>) => {
    const response = await fetch(`${API_BASE}/surveys/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Survey>(response);
  },

  deleteSurvey: async (id: string) => {
    const response = await fetch(`${API_BASE}/surveys/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<void>(response);
  },

  // Auth endpoints
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    return handleResponse<{ access_token: string; token_type: string }>(response);
  },

  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, company_name: name }),
    });
    return handleResponse<{ id: string; email: string; name: string }>(response);
  },

  // User endpoints
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ id: string; email: string; name: string }>(response);
  },

  // Admin - Users
  getAdminUsers: async (params?: { skip?: number; limit?: number; role?: string; is_active?: boolean; search?: string; }) => {
    const sp = new URLSearchParams();
    if (params?.skip != null) sp.append('skip', String(params.skip));
    if (params?.limit != null) sp.append('limit', String(params.limit));
    if (params?.role) sp.append('role', params.role);
    if (params?.is_active != null) sp.append('is_active', String(params.is_active));
    if (params?.search) sp.append('search', params.search);
    const qs = sp.toString();
    const response = await fetch(`${API_BASE}/admin/users${qs ? `?${qs}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Array<{
      id: number;
      email: string;
      role: string;
      company_name?: string;
      is_active: boolean;
      is_email_verified: boolean;
      created_at: string;
      last_login?: string;
      failed_login_attempts: number;
    }>>(response);
  },

  updateAdminUser: async (userId: number, updates: Partial<{ email: string; role: string; company_name: string; is_active: boolean; is_email_verified: boolean; }>) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse<any>(response);
  },

  deactivateAdminUser: async (userId: number) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  activateAdminUser: async (userId: number) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/activate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  resendVerification: async (email: string) => {
    const sp = new URLSearchParams();
    sp.append('email', email);
    const response = await fetch(`${API_BASE}/auth/resend-verification?${sp.toString()}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  // Analytics endpoints
  getSurveyAnalytics: async (surveyId: string) => {
    const response = await fetch(`${API_BASE}/analytics/surveys/${surveyId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<SurveyAnalytics>(response);
  },

  getAdminDashboardStats: async () => {
    const response = await fetch(`${API_BASE}/analytics/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse<AdminDashboardStats>(response);
  },

  getSurveyList: async (page: number = 1, pageSize: number = 10) => {
    const response = await fetch(
      `${API_BASE}/analytics/surveys?page=${page}&pageSize=${pageSize}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<PaginatedResponse<SurveyAnalytics>>(response);
  },

  // Dashboard endpoints
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE}/analytics/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
      totalSurveys: number;
      activeSurveys: number;
      totalResponses: number;
      responseRate: number;
    }>(response);
  },

  getPulseOverview: async () => {
    const response = await fetch(`${API_BASE}/analytics/pulse-overview`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
      currentScore: number;
      previousScore: number;
      trend: Array<{ month: string; score: number }>;
      alerts: Array<{ type: string; message: string; severity: string }>;
    }>(response);
  },

  getDashboardAlerts: async () => {
    const response = await fetch(`${API_BASE}/analytics/dashboard-alerts`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Array<{
      type: string;
      message: string;
      severity: string;
      createdAt: string;
    }>>(response);
  },

  getRecentActivity: async () => {
    const response = await fetch(`${API_BASE}/analytics/recent-activity`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Array<{
      id: string;
      type: string;
      description: string;
      createdAt: string;
    }>>(response);
  },

  getTeamBreakdown: async () => {
    const response = await fetch(`${API_BASE}/analytics/team-breakdown`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Array<{
      id: string;
      name: string;
      avgScore: number;
      scoreChange: number;
      responseCount: number;
      comments: string[];
      sentiment: string;
      alerts: string[];
    }>>(response);
  },

  getAnonymousComments: async (filters?: {
    team?: string;
    sentiment?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.team) params.append('team', filters.team);
    if (filters?.sentiment) params.append('sentiment', filters.sentiment);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE}/analytics/anonymous-comments?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Array<{
      id: string;
      text: string;
      team: string;
      sentiment: string;
      createdAt: string;
      isPinned: boolean;
      isFlagged: boolean;
      tags: string[];
    }>>(response);
  },

  pinComment: async (commentId: string) => {
    const response = await fetch(`${API_BASE}/analytics/anonymous-comments/${commentId}/pin`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  flagComment: async (commentId: string) => {
    const response = await fetch(`${API_BASE}/analytics/anonymous-comments/${commentId}/flag`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  // Quick Actions endpoints
  exportDashboardPDF: async () => {
    const response = await fetch(`${API_BASE}/analytics/export-pdf`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{
      message: string;
      download_url: string;
      expires_at: string;
    }>(response);
  },

  generateShareableLink: async () => {
    const response = await fetch(`${API_BASE}/analytics/generate-shareable-link`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{
      message: string;
      share_url: string;
      expires_at: string;
      access_level: string;
    }>(response);
  },



  scheduleSurveyDelivery: async (scheduleData: {
    surveyId: string;
    deliveryDate: string;
    reminderEnabled: boolean;
    reminderDays: number;
  }) => {
    const response = await fetch(`${API_BASE}/analytics/surveys/schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });
    return handleResponse<{
      message: string;
      delivery_date: string;
      reminder_enabled: boolean;
      schedule_id: string;
    }>(response);
  },

  // Advanced Capabilities endpoints
  getSurveyBranchingLogic: async (surveyId: string) => {
    const response = await fetch(`${API_BASE}/analytics/survey-logic/branching?survey_id=${surveyId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
      survey_id: string;
      branching_rules: Array<{
        question_id: string;
        condition: string;
        next_question: string;
        skip_questions: string[];
      }>;
    }>(response);
  },

  updateSurveyBranchingLogic: async (surveyId: string, branchingData: any) => {
    const response = await fetch(`${API_BASE}/analytics/survey-logic/branching`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ survey_id: surveyId, ...branchingData })
    });
    return handleResponse<{
      message: string;
      survey_id: string;
      rules_count: number;
    }>(response);
  },

  // Team Usage Snapshot for Owner Dashboard
  getTeamUsageSnapshot: async () => {
    const response = await fetch(`${API_BASE}/analytics/team-usage-snapshot`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch team usage snapshot');
    return response.json();
  },

  // Survey Activity Log for Owner Dashboard
  getSurveyActivityLog: async () => {
    const response = await fetch(`${API_BASE}/analytics/survey-activity-log`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch survey activity log');
    return response.json();
  },

  updateScoreThreshold: async (threshold: any) => {
    const response = await fetch(`${API_BASE}/analytics/score-threshold`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(threshold),
    });
    if (!response.ok) throw new Error('Failed to update score threshold');
    return response.json();
  },

  updateCommentTags: async (tags: any) => {
    const response = await fetch(`${API_BASE}/analytics/comment-tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tags),
    });
    if (!response.ok) throw new Error('Failed to update comment tags');
    return response.json();
  },

  // Plan & Billing Overview for Owner Dashboard
  getPlanBillingOverview: async () => {
    const response = await fetch(`${API_BASE}/analytics/plan-billing-overview`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch plan billing overview');
    return response.json();
  },

  // Support & Risk Flags for Owner Dashboard
  getSupportRiskFlags: async () => {
    const response = await fetch(`${API_BASE}/analytics/support-risk-flags`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch support risk flags');
    return response.json();
  },

  toggleTeamWatch: async (teamId: string, isWatched: boolean) => {
    const response = await fetch(`${API_BASE}/analytics/teams/${teamId}/watch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ watched: isWatched }),
    });
    if (!response.ok) throw new Error('Failed to toggle team watch status');
    return response.json();
  },

  // Anonymous Suggestion Box
  submitSuggestion: async (suggestionData: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    const response = await fetch(`${API_BASE}/suggestions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(suggestionData),
    });
    if (!response.ok) throw new Error('Failed to submit suggestion');
    return response.json();
  },

  voteSuggestion: async (suggestionId: string) => {
    const response = await fetch(`${API_BASE}/suggestions/${suggestionId}/vote`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to vote on suggestion');
    return response.json();
  },

  // Goal Tracking Dashboard
  createGoal: async (goalData: {
    title: string;
    description: string;
    category: string;
    targetValue: number;
    unit: string;
    deadline: string;
    teamId?: string;
  }) => {
    const response = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(goalData),
    });
    if (!response.ok) throw new Error('Failed to create goal');
    return response.json();
  },

  updateGoal: async (goalId: string, goalData: {
    title: string;
    description: string;
    category: string;
    targetValue: number;
    unit: string;
    deadline: string;
    teamId?: string;
  }) => {
    const response = await fetch(`${API_BASE}/goals/${goalId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(goalData),
    });
    if (!response.ok) throw new Error('Failed to update goal');
    return response.json();
  },

  deleteGoal: async (goalId: string) => {
    const response = await fetch(`${API_BASE}/goals/${goalId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete goal');
    return response.json();
  },

  // Predictive Trend Forecasting
  refreshPredictions: async (params: {
    timeframe: string;
    metric: string;
  }) => {
    const response = await fetch(`${API_BASE}/predictions/refresh?timeframe=${params.timeframe}&metric=${params.metric}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to refresh predictions');
    return response.json();
  },

  exportPredictionReport: async (params: {
    timeframe: string;
    metric: string;
  }) => {
    const response = await fetch(`${API_BASE}/predictions/export?timeframe=${params.timeframe}&metric=${params.metric}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to export prediction report');
    return response.json();
  },

  getDepartmentHierarchy: async () => {
    const response = await fetch(`${API_BASE}/analytics/department-hierarchy`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
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
    }>(response);
  },

  updateDepartmentHierarchy: async (hierarchyData: any) => {
    const response = await fetch(`${API_BASE}/analytics/department-hierarchy`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(hierarchyData)
    });
    return handleResponse<{
      message: string;
      departments_count: number;
    }>(response);
  },

  getPermissions: async () => {
    const response = await fetch(`${API_BASE}/analytics/permissions`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
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
    }>(response);
  },

  updatePermissions: async (permissionsData: any) => {
    const response = await fetch(`${API_BASE}/analytics/permissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(permissionsData)
    });
    return handleResponse<{
      message: string;
      permissions_count: number;
    }>(response);
  },

  getBrandingConfig: async () => {
    const response = await fetch(`${API_BASE}/analytics/branding`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
      logo: string;
      primary_color: string;
      secondary_color: string;
      email_domain: string;
      survey_theme: string;
      custom_css: string;
      company_name: string;
    }>(response);
  },

  updateBrandingConfig: async (brandingData: any) => {
    const response = await fetch(`${API_BASE}/analytics/branding`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(brandingData)
    });
    return handleResponse<{
      message: string;
      logo_url: string;
      theme: string;
    }>(response);
  },

  getSSOConfig: async () => {
    const response = await fetch(`${API_BASE}/analytics/sso/config`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
      enabled: boolean;
      provider: string;
      domain: string;
      metadata_url: string;
      entity_id: string;
    }>(response);
  },

  updateSSOConfig: async (ssoData: any) => {
    const response = await fetch(`${API_BASE}/analytics/sso/config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ssoData)
    });
    return handleResponse<{
      message: string;
      provider: string;
      enabled: boolean;
    }>(response);
  },

  getAPIKeys: async () => {
    const response = await fetch(`${API_BASE}/analytics/api/keys`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
      api_keys: Array<{
        id: string;
        name: string;
        key: string;
        created_at: string;
        last_used: string;
        permissions: string[];
      }>;
      webhook_urls: string[];
    }>(response);
  },

  createAPIKey: async (keyData: any) => {
    const response = await fetch(`${API_BASE}/analytics/api/keys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(keyData)
    });
    return handleResponse<{
      message: string;
      key: string;
      name: string;
      permissions: string[];
    }>(response);
  },

  getSupportContact: async () => {
    const response = await fetch(`${API_BASE}/analytics/support/contact`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
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
    }>(response);
  },
}; 