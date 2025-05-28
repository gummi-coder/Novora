import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface FeatureToggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredTier: 'basic' | 'pro' | 'enterprise';
  percentage?: number;
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, any>;
}

interface FeatureToggleContextType {
  features: Record<string, FeatureToggle>;
  isLoading: boolean;
  error: Error | null;
  isFeatureEnabled: (featureId: string, userTier: string) => boolean;
  refreshFeatures: () => Promise<void>;
}

const FeatureToggleContext = createContext<FeatureToggleContextType | undefined>(undefined);

export const FeatureToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Record<string, FeatureToggle>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeatures = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/features');
      setFeatures(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch features'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const isFeatureEnabled = (featureId: string, userTier: string): boolean => {
    const feature = features[featureId];
    if (!feature) return false;

    const tierOrder = ['basic', 'pro', 'enterprise'];
    const userTierIndex = tierOrder.indexOf(userTier);
    const requiredTierIndex = tierOrder.indexOf(feature.requiredTier);

    if (userTierIndex < requiredTierIndex) return false;
    if (!feature.enabled) return false;

    if (feature.startDate && new Date() < new Date(feature.startDate)) return false;
    if (feature.endDate && new Date() > new Date(feature.endDate)) return false;

    if (feature.percentage !== undefined) {
      const random = Math.random() * 100;
      return random <= feature.percentage;
    }

    return true;
  };

  const value = {
    features,
    isLoading,
    error,
    isFeatureEnabled,
    refreshFeatures: fetchFeatures,
  };

  return (
    <FeatureToggleContext.Provider value={value}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

export const useFeatureToggle = () => {
  const context = useContext(FeatureToggleContext);
  if (context === undefined) {
    throw new Error('useFeatureToggle must be used within a FeatureToggleProvider');
  }
  return context;
}; 