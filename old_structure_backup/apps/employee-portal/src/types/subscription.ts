export type SubscriptionStatus = 
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'trialing'
  | 'incomplete';

export type PlanInterval = 'month' | 'year';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: PlanInterval;
  features: string[];
  stripePriceId: string;
  stripeProductId: string;
  trialPeriodDays?: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  planId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  stripeInvoiceId: string;
  stripePaymentIntentId?: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  periodStart: Date;
  periodEnd: Date;
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
  stripePaymentMethodId: string;
  createdAt: Date;
}

export interface BillingPortalSession {
  url: string;
  returnUrl: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  planId: string;
  userId: string;
  status: 'open' | 'complete' | 'expired';
  createdAt: Date;
} 