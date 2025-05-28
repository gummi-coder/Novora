import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsage } from '@/hooks/useUsage';
import { api } from '@/lib/api';

interface UpgradePrompt {
  metric: string;
  currentUsage: number;
  limit: number;
  threshold: number;
}

export const useUpgradePrompt = () => {
  const { subscription } = useSubscription();
  const { usage } = useUsage();
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePrompt | null>(null);

  useEffect(() => {
    if (!subscription || !usage) return;

    const checkUsageThresholds = () => {
      const thresholds = {
        activeUsers: 0.8, // 80%
        storage: 0.8,
        apiCalls: 0.8,
        customReports: 0.8
      };

      for (const [metric, threshold] of Object.entries(thresholds)) {
        const currentUsage = usage[metric as keyof typeof usage] || 0;
        const limit = subscription.limits[metric as keyof typeof subscription.limits] || 0;
        const usagePercentage = currentUsage / limit;

        if (usagePercentage >= threshold) {
          setUpgradePrompt({
            metric,
            currentUsage,
            limit,
            threshold
          });
          return;
        }
      }

      setUpgradePrompt(null);
    };

    checkUsageThresholds();
  }, [subscription, usage]);

  const handleUpgrade = async (tier: string) => {
    try {
      await api.post('/subscription/upgrade', { tier });
      // Refresh subscription data
      window.location.reload();
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
    }
  };

  return {
    upgradePrompt,
    handleUpgrade,
    currentTier: subscription?.tier
  };
}; 