import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { FeatureFlagService } from '../services/feature-flag-service';

export function useFeatureFlag(flagName: string) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [variant, setVariant] = useState<{ name: string; payload?: Record<string, unknown> }>({ name: 'disabled' });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkFlag = async () => {
      try {
        const flagService = FeatureFlagService.getInstance();
        
        const enabled = await flagService.isEnabled(flagName, {
          userId: user?.id,
          email: user?.email,
          subscriptionTier: user?.subscriptionTier,
        });

        const variant = await flagService.getVariant(flagName, {
          userId: user?.id,
          email: user?.email,
          subscriptionTier: user?.subscriptionTier,
        });

        setIsEnabled(enabled);
        setVariant(variant);
      } catch (error) {
        console.error('Error checking feature flag:', error);
        setIsEnabled(false);
        setVariant({ name: 'disabled' });
      } finally {
        setIsLoading(false);
      }
    };

    checkFlag();
  }, [flagName, user]);

  return {
    isEnabled,
    variant,
    isLoading,
  };
}

export function useFeatureFlagVariant<T>(flagName: string, defaultValue: T): T {
  const { variant, isLoading } = useFeatureFlag(flagName);

  if (isLoading) {
    return defaultValue;
  }

  return (variant.payload as T) || defaultValue;
} 