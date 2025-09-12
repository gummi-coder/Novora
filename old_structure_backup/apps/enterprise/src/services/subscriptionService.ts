import { api, ApiResponse, handleApiError } from './api';

export interface Subscription {
  id: string;
  userId: string;
  tier: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'expired';
  startDate: Date;
  endDate: Date;
  features: {
    surveys: number;
    responses: number;
    storage: number;
    teamMembers: number;
    apiCalls: number;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'basic' | 'pro' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: {
    surveys: number;
    responses: number;
    storage: number;
    teamMembers: number;
    apiCalls: number;
  };
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  createdAt: Date;
  dueDate: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

class SubscriptionService {
  async getCurrentSubscription(userId: string): Promise<ApiResponse<Subscription>> {
    try {
      const response = await api.get(`/subscriptions/current/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getAvailablePlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    try {
      const response = await api.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async subscribe(planId: string, paymentMethodId: string): Promise<ApiResponse<Subscription>> {
    try {
      const response = await api.post('/subscriptions', {
        planId,
        paymentMethodId,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async cancelSubscription(): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/subscriptions/cancel');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateSubscription(planId: string): Promise<ApiResponse<Subscription>> {
    try {
      const response = await api.patch('/subscriptions', { planId });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getBillingHistory(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get('/subscriptions/billing-history');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getInvoices(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get('/subscriptions/invoices');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getInvoice(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/subscriptions/invoices/${id}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // TODO: Implement API call to get payment methods
    throw new Error('Not implemented');
  }

  async addPaymentMethod(paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod> {
    // TODO: Implement API call to add payment method
    throw new Error('Not implemented');
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    // TODO: Implement API call to remove payment method
    throw new Error('Not implemented');
  }

  async getUsage(): Promise<Subscription['features']> {
    // TODO: Implement API call to get usage
    throw new Error('Not implemented');
  }
}

export const subscriptionService = new SubscriptionService(); 