import { useFeatureToggle } from '@/contexts/FeatureToggleContext';
import { useSubscription } from '@/hooks/useSubscription';

export const useFeatureAccess = (featureId: string) => {
  const { isFeatureEnabled, isLoading: isFeaturesLoading } = useFeatureToggle();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();

  const isLoading = isFeaturesLoading || isSubscriptionLoading;
  const isEnabled = !isLoading && subscription?.tier
    ? isFeatureEnabled(featureId, subscription.tier)
    : false;

  const requiredTier = !isLoading
    ? subscription?.tier
    : undefined;

  const canAccess = !isLoading && isEnabled;

  return {
    isLoading,
    isEnabled,
    canAccess,
    requiredTier,
    subscription,
  };
}; 