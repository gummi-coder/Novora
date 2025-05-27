import axios from 'axios';
import { SubscriptionPlan, SubscriptionStatus } from '../types/subscription';

const API_URL = import.meta.env.VITE_API_URL;

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await axios.get(`${API_URL}/subscriptions/plans`);
    return response.data;
  },

  async createSubscription(planId: string, paymentMethodId: string): Promise<SubscriptionStatus> {
    const response = await axios.post(`${API_URL}/subscriptions/create`, {
      planId,
      paymentMethodId
    });
    return response.data;
  },

  async getCurrentSubscription(): Promise<SubscriptionStatus> {
    const response = await axios.get(`${API_URL}/subscriptions/current`);
    return response.data;
  },

  async updateSubscription(planId: string): Promise<SubscriptionStatus> {
    const response = await axios.put(`${API_URL}/subscriptions/update`, { planId });
    return response.data;
  },

  async cancelSubscription(): Promise<void> {
    await axios.post(`${API_URL}/subscriptions/cancel`);
  },

  getDashboardUrl(plan: string): string {
    switch (plan) {
      case 'enterprise':
        return '/dashboard-enterprise';
      case 'pro':
        return '/dashboard-pro';
      case 'core':
        return '/dashboard-core';
      default:
        return '/';
    }
  }
}; 