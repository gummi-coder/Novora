import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Subscription {
  id: string;
  tier: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  features: string[];
  startDate: string;
  endDate: string;
  trialEndsAt?: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/subscriptions/current');
        setSubscription(response.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const upgradeSubscription = async (newTier: 'pro' | 'enterprise') => {
    try {
      const response = await api.post('/subscriptions/upgrade', { tier: newTier });
      setSubscription(response.data);
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to upgrade subscription');
    }
  };

  const cancelSubscription = async () => {
    try {
      await api.post('/subscriptions/cancel');
      setSubscription(null);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to cancel subscription');
    }
  };

  return {
    subscription,
    isLoading,
    error,
    upgradeSubscription,
    cancelSubscription,
  };
} 