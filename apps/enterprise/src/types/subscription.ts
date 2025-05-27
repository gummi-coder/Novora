export type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

export interface SubscriptionLimits {
  activeUsers: number;
  storage: number;
  apiCalls: number;
  customReports: number;
}

export interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  endDate: string;
  limits: SubscriptionLimits;
  features: string[];
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
} 