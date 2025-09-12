import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface FeatureGuardProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ featureId, children, fallback }: FeatureGuardProps) {
  const { hasFeature, currentTier } = useSubscription();

  if (hasFeature(featureId)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Lock className="h-4 w-4" />
          Premium Feature
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This feature is only available in the {currentTier.name} plan.
        </p>
        <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
          Upgrade Plan
        </Button>
      </CardContent>
    </Card>
  );
} 