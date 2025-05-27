export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  plan: 'core' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  lastLogin: string;
  companyId?: string;
  preferences?: Record<string, any>;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'core' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: {
    type: string;
    last4: string;
    expiryDate: string;
  };
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    isInternal: boolean;
  }>;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface SystemMetrics {
  activeUsers: number;
  planDistribution: Record<string, number>;
  revenueMetrics: {
    mrr: number;
    arr: number;
    churnRate: number;
  };
  usageMetrics: {
    apiCalls: number;
    storageUsed: number;
    bandwidthUsed: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  components: {
    api: { status: string; latency: number };
    database: { status: string; latency: number };
    cache: { status: string; latency: number };
    storage: { status: string; latency: number };
  };
  errors: {
    count: number;
    recent: Array<{
      timestamp: string;
      message: string;
      severity: string;
    }>;
  };
} 