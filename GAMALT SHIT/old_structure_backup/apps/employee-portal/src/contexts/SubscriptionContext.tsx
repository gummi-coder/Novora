import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscription';
import {
  Plan,
  Subscription,
  Invoice,
  PaymentMethod,
  BillingPortalSession,
  CheckoutSession,
} from '../types/subscription';

interface SubscriptionContextType {
  plans: Plan[];
  subscription: Subscription | null;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  createSubscription: (planId: string, paymentMethodId: string) => Promise<void>;
  updateSubscription: (subscriptionId: string, data: { planId?: string; cancelAtPeriodEnd?: boolean }) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  addPaymentMethod: (paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
  createBillingPortalSession: (returnUrl: string) => Promise<BillingPortalSession>;
  createCheckoutSession: (planId: string) => Promise<CheckoutSession>;
  startTrial: (planId: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansData, subscriptionData, invoicesData, paymentMethodsData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getSubscription(subscription?.id || ''),
        subscriptionService.getInvoices(),
        subscriptionService.getPaymentMethods(),
      ]);
      setPlans(plansData);
      setSubscription(subscriptionData);
      setInvoices(invoicesData);
      setPaymentMethods(paymentMethodsData);
    } catch (err) {
      setError('Failed to refresh subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  const createSubscription = async (planId: string, paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);
      const newSubscription = await subscriptionService.createSubscription(planId, paymentMethodId);
      setSubscription(newSubscription);
    } catch (err) {
      setError('Failed to create subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (
    subscriptionId: string,
    data: { planId?: string; cancelAtPeriodEnd?: boolean }
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSubscription = await subscriptionService.updateSubscription(subscriptionId, data);
      setSubscription(updatedSubscription);
    } catch (err) {
      setError('Failed to update subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const canceledSubscription = await subscriptionService.cancelSubscription(subscriptionId);
      setSubscription(canceledSubscription);
    } catch (err) {
      setError('Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);
      const newPaymentMethod = await subscriptionService.addPaymentMethod(paymentMethodId);
      setPaymentMethods([...paymentMethods, newPaymentMethod]);
    } catch (err) {
      setError('Failed to add payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);
      await subscriptionService.removePaymentMethod(paymentMethodId);
      setPaymentMethods(paymentMethods.filter(method => method.id !== paymentMethodId));
    } catch (err) {
      setError('Failed to remove payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);
      await subscriptionService.setDefaultPaymentMethod(paymentMethodId);
      setPaymentMethods(
        paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === paymentMethodId,
        }))
      );
    } catch (err) {
      setError('Failed to set default payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBillingPortalSession = async (returnUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      return await subscriptionService.createBillingPortalSession(returnUrl);
    } catch (err) {
      setError('Failed to create billing portal session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await subscriptionService.createCheckoutSession(planId);
    } catch (err) {
      setError('Failed to create checkout session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      const trialSubscription = await subscriptionService.startTrial(planId);
      setSubscription(trialSubscription);
    } catch (err) {
      setError('Failed to start trial');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    plans,
    subscription,
    invoices,
    paymentMethods,
    loading,
    error,
    refreshSubscription,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    createBillingPortalSession,
    createCheckoutSession,
    startTrial,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 