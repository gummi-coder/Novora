import React, { createContext, useContext, useState, useEffect } from 'react';
import { PricingTier, pricingTiers } from '@/config/pricing';

interface SubscriptionContextType {
  currentTier: PricingTier;
  upgradeTier: (tierId: string) => void;
  hasFeature: (featureId: string) => boolean;
  getFeatureLimit: (limitType: keyof PricingTier['limits']) => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [currentTier, setCurrentTier] = useState<PricingTier>(
    pricingTiers.find(tier => tier.id === 'enterprise') || pricingTiers[0]
  );

  const upgradeTier = (tierId: string) => {
    const newTier = pricingTiers.find(tier => tier.id === tierId);
    if (newTier) {
      setCurrentTier(newTier);
      // Here you would typically make an API call to update the subscription
    }
  };

  const hasFeature = (featureId: string) => {
    return currentTier.features.some(feature => feature.id === featureId);
  };

  const getFeatureLimit = (limitType: keyof PricingTier['limits']) => {
    return currentTier.limits[limitType];
  };

  return (
    <SubscriptionContext.Provider
      value={{
        currentTier,
        upgradeTier,
        hasFeature,
        getFeatureLimit
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 