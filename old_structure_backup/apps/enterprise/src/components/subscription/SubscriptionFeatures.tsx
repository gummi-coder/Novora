import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SubscriptionFeatures() {
  const { currentTier, hasFeature, getFeatureLimit } = useSubscription();

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited';
    if (limit >= 1000) return `${limit / 1000}K`;
    return limit.toString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan: {currentTier.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Features</h3>
              <div className="space-y-2">
                {currentTier.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Limits</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Surveys</span>
                  <span className="text-sm font-medium">
                    {formatLimit(getFeatureLimit('surveys'))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Team Members</span>
                  <span className="text-sm font-medium">
                    {formatLimit(getFeatureLimit('teamMembers'))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Storage</span>
                  <span className="text-sm font-medium">
                    {formatLimit(getFeatureLimit('storage'))}GB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Calls</span>
                  <span className="text-sm font-medium">
                    {formatLimit(getFeatureLimit('apiCalls'))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 