import api from './api';
import {
  Plan,
  Subscription,
  Invoice,
  PaymentMethod,
  BillingPortalSession,
  CheckoutSession,
} from '../types/subscription';

export const subscriptionService = {
  // Plan Management
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  // Subscription Management
  createSubscription: async (planId: string, paymentMethodId: string): Promise<Subscription> => {
    const response = await api.post('/subscriptions', {
      planId,
      paymentMethodId,
    });
    return response.data;
  },

  updateSubscription: async (
    subscriptionId: string,
    data: { planId?: string; cancelAtPeriodEnd?: boolean }
  ): Promise<Subscription> => {
    const response = await api.put(`/subscriptions/${subscriptionId}`, data);
    return response.data;
  },

  cancelSubscription: async (subscriptionId: string): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  },

  getSubscription: async (subscriptionId: string): Promise<Subscription> => {
    const response = await api.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  },

  // Payment Methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/subscriptions/payment-methods');
    return response.data;
  },

  addPaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
    const response = await api.post('/subscriptions/payment-methods', {
      paymentMethodId,
    });
    return response.data;
  },

  removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await api.delete(`/subscriptions/payment-methods/${paymentMethodId}`);
  },

  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await api.post(`/subscriptions/payment-methods/${paymentMethodId}/default`);
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/subscriptions/invoices');
    return response.data;
  },

  getInvoice: async (invoiceId: string): Promise<Invoice> => {
    const response = await api.get(`/subscriptions/invoices/${invoiceId}`);
    return response.data;
  },

  // Billing Portal
  createBillingPortalSession: async (returnUrl: string): Promise<BillingPortalSession> => {
    const response = await api.post('/subscriptions/billing-portal', { returnUrl });
    return response.data;
  },

  // Checkout
  createCheckoutSession: async (planId: string): Promise<CheckoutSession> => {
    const response = await api.post('/subscriptions/checkout', { planId });
    return response.data;
  },

  // Trial Management
  startTrial: async (planId: string): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/plans/${planId}/trial`);
    return response.data;
  },

  // Webhook Handling
  handleWebhook: async (event: any): Promise<void> => {
    await api.post('/subscriptions/webhook', event);
  },
}; 