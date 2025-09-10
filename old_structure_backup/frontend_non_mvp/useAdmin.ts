import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { adminService } from '../services/admin';
import {
  User,
  Subscription,
  SupportTicket,
  AuditLog,
  SystemMetrics,
  SystemHealth
} from '../types/admin';

export const useAdmin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // System-wide state
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  // Paginated data state
  const [users, setUsers] = useState<{ users: User[]; total: number }>({ users: [], total: 0 });
  const [subscriptions, setSubscriptions] = useState<{ subscriptions: Subscription[]; total: number }>({ subscriptions: [], total: 0 });
  const [tickets, setTickets] = useState<{ tickets: SupportTicket[]; total: number }>({ tickets: [], total: 0 });
  const [auditLogs, setAuditLogs] = useState<{ logs: AuditLog[]; total: number }>({ logs: [], total: 0 });

  // Permission check
  const hasPermission = (permission: string): boolean => {
    if (!user || user.role !== 'admin') return false;

    // Admin-specific permissions
    const adminPermissions = [
      'manage_users',
      'manage_subscriptions',
      'manage_payments',
      'view_metrics',
      'manage_tickets',
      'view_audit_logs',
      'manage_feature_flags'
    ];

    return adminPermissions.includes(permission);
  };

  // System metrics and health
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const [metricsData, healthData, flagsData] = await Promise.all([
          adminService.getSystemMetrics(),
          adminService.getSystemHealth(),
          adminService.getFeatureFlags()
        ]);

        setMetrics(metricsData);
        setHealth(healthData);
        setFeatureFlags(flagsData);
      } catch (err) {
        setError('Failed to load system data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchSystemData();
    }
  }, [user?.role]);

  // User management
  const fetchUsers = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    plan?: string;
  }) => {
    try {
      const data = await adminService.getUsers(params);
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await adminService.updateUser(userId, updates);
      // Refresh users list
      fetchUsers({});
    } catch (err) {
      setError('Failed to update user');
    }
  };

  // Subscription management
  const fetchSubscriptions = async (params: {
    page?: number;
    limit?: number;
    status?: string;
    plan?: string;
  }) => {
    try {
      const data = await adminService.getSubscriptions(params);
      setSubscriptions(data);
    } catch (err) {
      setError('Failed to fetch subscriptions');
    }
  };

  const updateSubscription = async (subscriptionId: string, updates: Partial<Subscription>) => {
    try {
      await adminService.updateSubscription(subscriptionId, updates);
      // Refresh subscriptions list
      fetchSubscriptions({});
    } catch (err) {
      setError('Failed to update subscription');
    }
  };

  // Support tickets
  const fetchTickets = async (params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }) => {
    try {
      const data = await adminService.getTickets(params);
      setTickets(data);
    } catch (err) {
      setError('Failed to fetch tickets');
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    try {
      await adminService.updateTicket(ticketId, updates);
      // Refresh tickets list
      fetchTickets({});
    } catch (err) {
      setError('Failed to update ticket');
    }
  };

  // Audit logs
  const fetchAuditLogs = async (params: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    dateRange?: { start: string; end: string };
  }) => {
    try {
      const data = await adminService.getAuditLogs(params);
      setAuditLogs(data);
    } catch (err) {
      setError('Failed to fetch audit logs');
    }
  };

  // Feature flags
  const updateFeatureFlag = async (flag: string, enabled: boolean) => {
    try {
      await adminService.updateFeatureFlag(flag, enabled);
      setFeatureFlags(prev => ({ ...prev, [flag]: enabled }));
    } catch (err) {
      setError('Failed to update feature flag');
    }
  };

  return {
    loading,
    error,
    metrics,
    health,
    featureFlags,
    users,
    subscriptions,
    tickets,
    auditLogs,
    hasPermission,
    fetchUsers,
    updateUser,
    fetchSubscriptions,
    updateSubscription,
    fetchTickets,
    updateTicket,
    fetchAuditLogs,
    updateFeatureFlag
  };
}; 