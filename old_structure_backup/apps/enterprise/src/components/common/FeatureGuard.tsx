import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface FeatureGuardProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredTier?: 'basic' | 'pro' | 'enterprise';
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  featureId,
  children,
  fallback,
  requiredTier,
}) => {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isFeatureEnabled = subscription?.features?.includes(featureId);
  const hasRequiredTier = requiredTier ? subscription?.tier === requiredTier : true;

  if (!isFeatureEnabled || !hasRequiredTier) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="p-6 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Feature Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          This feature is not available in your current subscription plan.
        </p>
        <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
          Upgrade Plan
        </Button>
      </Card>
    );
  }

  return <>{children}</>;
}; 