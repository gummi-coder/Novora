export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    teams: number;
    dashboards: number;
    members: number;
    widgets: number;
    storage: number;
    apiCalls: number;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingHistory {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  description: string;
  invoiceUrl?: string;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card';
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface SubscriptionLimits {
  teams: number;
  dashboards: number;
  members: number;
  widgets: number;
  storage: number;
  apiCalls: number;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
} 