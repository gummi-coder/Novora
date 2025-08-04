import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { subscriptionService } from '../services/subscription';
import { SubscriptionStatus } from '../types/subscription';

export const DashboardRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        try {
          const data = await subscriptionService.getCurrentSubscription();
          setSubscription(data);
        } catch (error) {
          console.error('Failed to fetch subscription:', error);
        } finally {
          setSubscriptionLoading(false);
        }
      } else {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  if (loading || subscriptionLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!subscription) {
    return <Navigate to="/pricing" replace />;
  }

  // Route to appropriate dashboard based on subscription plan
  switch (subscription.plan.name) {
    case 'enterprise':
      return <Navigate to="/dashboard-enterprise" replace />;
    case 'pro':
      return <Navigate to="/dashboard-pro" replace />;
    case 'core':
      return <Navigate to="/dashboard-core" replace />;
    default:
      return <Navigate to="/pricing" replace />;
  }
}; 