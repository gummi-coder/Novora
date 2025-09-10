// Team Usage Snapshot Types
export interface TeamUsageData {
  activeTeams: {
    count: number;
    changePercent: number;
    totalTeams: number;
  };
  surveyCompletionRate: {
    average: number;
    trend: 'up' | 'down' | 'stable';
    changePercent: number;
  };
  newSignups: {
    thisWeek: number;
    thisMonth: number;
    trend: 'up' | 'down' | 'stable';
  };
  teamActivity: Array<{
    id: string;
    name: string;
    lastActivity: string;
    daysSinceActivity: number;
    status: 'active' | 'decaying' | 'inactive';
    engagementScore: number;
  }>;
  topEngagedTeams: Array<{
    id: string;
    name: string;
    engagementScore: number;
    surveyCompletionRate: number;
    responseCount: number;
    avgResponseTime: number;
    potential: 'case_study' | 'referral' | 'both';
  }>;
}

// Survey Activity Log Types
export interface SurveyActivity {
  id: string;
  title: string;
  sentDate: string;
  responseCount: number;
  expectedResponses: number;
  completionRate: number;
  avgScore: number;
  scoreDelta: number;
  flags: Array<{
    type: 'zero_responses' | 'score_drop' | 'urgent_comment' | 'low_completion';
    severity: 'low' | 'medium' | 'high';
    message: string;
    createdAt: string;
  }>;
  urgentComments: Array<{
    id: string;
    text: string;
    tags: string[];
    flagged: boolean;
    createdAt: string;
  }>;
  status: 'active' | 'completed' | 'paused';
}

export interface ScoreThreshold {
  enabled: boolean;
  value: number;
  action: 'flag' | 'alert' | 'both';
}

export interface CommentTags {
  well_being: boolean;
  leadership: boolean;
  culture: boolean;
  compensation: boolean;
  work_life_balance: boolean;
  career_growth: boolean;
  communication: boolean;
  other: string[];
}

// Plan & Billing Overview Types
export interface PlanDetails {
  currentPlan: 'starter' | 'growth' | 'enterprise';
  planName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    users: number;
    surveys: number;
    responses: number;
    storage: number;
  };
  usage: {
    users: number;
    surveys: number;
    responses: number;
    storage: number;
  };
  nextBillingDate: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'trial' | 'past_due' | 'canceled';
}

export interface BillingEvent {
  id: string;
  type: 'payment_success' | 'payment_failed' | 'subscription_created' | 'subscription_updated' | 'trial_started' | 'trial_ended';
  amount: number;
  currency: string;
  date: string;
  status: 'success' | 'failed' | 'pending';
  description: string;
  invoiceUrl?: string;
}

export interface TrialInfo {
  isTrial: boolean;
  daysLeft: number;
  trialEndDate: string;
  canExtend: boolean;
}

export interface UpgradePotential {
  hasUpgradePotential: boolean;
  currentUsage: number;
  usagePercentage: number;
  recommendedPlan: string;
  reason: string;
  estimatedCost: number;
}

export interface BillingError {
  id: string;
  type: 'payment_failed' | 'card_expired' | 'insufficient_funds' | 'stripe_error';
  message: string;
  date: string;
  resolved: boolean;
  retryCount: number;
}

// Support & Risk Flags Types
export interface TeamSupportStatus {
  id: string;
  name: string;
  helpRequested: string;
  issueType: 'technical_support' | 'training' | 'billing' | 'feature_request' | 'bug_report';
  priority: 'low' | 'medium' | 'high';
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface AtRiskTeam {
  id: string;
  name: string;
  alertCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastAlert: string;
  alerts: string[];
  engagementScore: number;
  daysSinceLastActivity: number;
}

export interface NPSScore {
  team: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  responses: number;
}

export interface NPSData {
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  recentScores: NPSScore[];
}

export interface WatchListTeam {
  id: string;
  name: string;
  addedDate: string;
  reason: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SupportRiskData {
  teamsNeedingHelp: TeamSupportStatus[];
  atRiskTeams: AtRiskTeam[];
  npsData: NPSData;
  watchList: WatchListTeam[];
} 