import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { subscriptionService } from '../../services/subscription';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPlan?: 'enterprise' | 'pro' | 'core';
  requiredRole?: 'admin' | 'enterprise' | 'pro' | 'core';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPlan,
  requiredRole
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [subscription, setSubscription] = React.useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true);

  React.useEffect(() => {
    const checkSubscription = async () => {
      if (isAuthenticated && requiredPlan) {
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

    checkSubscription();
  }, [isAuthenticated, requiredPlan]);

  if (loading || subscriptionLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPlan && (!subscription || subscription.plan.name !== requiredPlan)) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}; 