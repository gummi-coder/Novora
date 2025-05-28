import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@/types/subscription';
import { Check, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  currentTier: SubscriptionTier;
  triggerMetric: string;
  currentUsage: number;
  limit: number;
  onUpgrade: (tier: SubscriptionTier) => void;
}

const tierFeatures: Record<SubscriptionTier, { name: string; features: string[] }> = {
  basic: {
    name: 'Basic',
    features: [
      'Up to 5 team members',
      '10GB storage',
      '1,000 API calls/month',
      'Basic analytics',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro',
    features: [
      'Up to 20 team members',
      '50GB storage',
      '10,000 API calls/month',
      'Advanced analytics',
      'Priority support',
      'Custom reports',
      'API access'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    features: [
      'Unlimited team members',
      '500GB storage',
      'Unlimited API calls',
      'Enterprise analytics',
      '24/7 support',
      'Custom integrations',
      'SSO',
      'Dedicated account manager'
    ]
  }
};

const getNextTier = (currentTier: SubscriptionTier): SubscriptionTier => {
  const tiers: SubscriptionTier[] = ['basic', 'pro', 'enterprise'];
  const currentIndex = tiers.indexOf(currentTier);
  return tiers[Math.min(currentIndex + 1, tiers.length - 1)];
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  currentTier,
  triggerMetric,
  currentUsage,
  limit,
  onUpgrade
}) => {
  const nextTier = getNextTier(currentTier);
  const usagePercentage = Math.round((currentUsage / limit) * 100);

  if (currentTier === 'enterprise') {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Upgrade Your Plan</CardTitle>
            <p className="text-sm text-muted-foreground">
              You're using {usagePercentage}% of your {triggerMetric} limit
            </p>
          </div>
          <Zap className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Current Plan: {tierFeatures[currentTier].name}</h3>
              <ul className="space-y-2">
                {tierFeatures[currentTier].features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-muted-foreground">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Upgrade to {tierFeatures[nextTier].name}</h3>
              <ul className="space-y-2">
                {tierFeatures[nextTier].features.map((feature, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-center text-sm",
                      tierFeatures[currentTier].features.includes(feature)
                        ? "text-muted-foreground"
                        : "text-primary"
                    )}
                  >
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => onUpgrade(nextTier)}
              className="group"
            >
              Upgrade to {tierFeatures[nextTier].name}
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 