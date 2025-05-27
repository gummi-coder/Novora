import axios from 'axios';
import { User, Subscription, AuditLog, SupportTicket } from '../types/admin';

const API_URL = import.meta.env.VITE_API_URL;

export const adminService = {
  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    plan?: string;
  }): Promise<{ users: User[]; total: number }> {
    const response = await axios.get(`${API_URL}/admin/users`, { params });
    return response.data;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await axios.put(`${API_URL}/admin/users/${userId}`, updates);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await axios.delete(`${API_URL}/admin/users/${userId}`);
  },

  // Subscription Management
  async getSubscriptions(params: {
    page?: number;
    limit?: number;
    status?: string;
    plan?: string;
  }): Promise<{ subscriptions: Subscription[]; total: number }> {
    const response = await axios.get(`${API_URL}/admin/subscriptions`, { params });
    return response.data;
  },

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const response = await axios.put(`${API_URL}/admin/subscriptions/${subscriptionId}`, updates);
    return response.data;
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await axios.post(`${API_URL}/admin/subscriptions/${subscriptionId}/cancel`);
  },

  // Payment Management
  async getPayments(params: {
    page?: number;
    limit?: number;
    status?: string;
    dateRange?: { start: string; end: string };
  }): Promise<{ payments: any[]; total: number }> {
    const response = await axios.get(`${API_URL}/admin/payments`, { params });
    return response.data;
  },

  async refundPayment(paymentId: string, amount: number): Promise<void> {
    await axios.post(`${API_URL}/admin/payments/${paymentId}/refund`, { amount });
  },

  // System Analytics
  async getSystemMetrics(): Promise<{
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
  }> {
    const response = await axios.get(`${API_URL}/admin/metrics`);
    return response.data;
  },

  // System Monitoring
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    components: {
      api: { status: string; latency: number };
      database: { status: string; latency: number };
      cache: { status: string; latency: number };
      storage: { status: string; latency: number };
    };
    errors: {
      count: number;
      recent: Array<{ timestamp: string; message: string; severity: string }>;
    };
  }> {
    const response = await axios.get(`${API_URL}/admin/health`);
    return response.data;
  },

  // Support Tickets
  async getTickets(params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<{ tickets: SupportTicket[]; total: number }> {
    const response = await axios.get(`${API_URL}/admin/tickets`, { params });
    return response.data;
  },

  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
    const response = await axios.put(`${API_URL}/admin/tickets/${ticketId}`, updates);
    return response.data;
  },

  // Audit Logs
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    dateRange?: { start: string; end: string };
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const response = await axios.get(`${API_URL}/admin/audit-logs`, { params });
    return response.data;
  },

  // Feature Flags
  async getFeatureFlags(): Promise<Record<string, boolean>> {
    const response = await axios.get(`${API_URL}/admin/feature-flags`);
    return response.data;
  },

  async updateFeatureFlag(flag: string, enabled: boolean): Promise<void> {
    await axios.put(`${API_URL}/admin/feature-flags/${flag}`, { enabled });
  }
}; 