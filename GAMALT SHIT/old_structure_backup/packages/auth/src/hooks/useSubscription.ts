import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Plan, Subscription, BillingHistory, PaymentMethod } from '../types/subscription';
import { SubscriptionService } from '../services/subscription';

export const useSubscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const subscriptionService = SubscriptionService.getInstance();

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionData, billingData, paymentMethodsData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(user!.userId),
        subscriptionService.getBillingHistory(user!.userId),
        subscriptionService.getPaymentMethods(user!.userId)
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
      setBillingHistory(billingData);
      setPaymentMethods(paymentMethodsData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (planId: string, paymentMethodId: string) => {
    try {
      setLoading(true);
      const result = await subscriptionService.createSubscription(
        user!.userId,
        planId,
        paymentMethodId
      );
      await fetchSubscriptionData();
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (newPlanId: string) => {
    try {
      setLoading(true);
      const result = await subscriptionService.updateSubscription(
        user!.userId,
        newPlanId
      );
      await fetchSubscriptionData();
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      await subscriptionService.cancelSubscription(user!.userId);
      await fetchSubscriptionData();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      await subscriptionService.addPaymentMethod(user!.userId, paymentMethodId);
      await fetchSubscriptionData();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      await subscriptionService.removePaymentMethod(user!.userId, paymentMethodId);
      await fetchSubscriptionData();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionLimits = async (resource: string) => {
    try {
      return await subscriptionService.checkSubscriptionLimits(user!.userId, resource);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    loading,
    error,
    plans,
    currentSubscription,
    billingHistory,
    paymentMethods,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    addPaymentMethod,
    removePaymentMethod,
    checkSubscriptionLimits,
    refreshSubscriptionData: fetchSubscriptionData
  };
}; 