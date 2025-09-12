import React from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

interface FeatureGateProps {
  feature: keyof ReturnType<typeof useFeatureFlags>['features'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback = null 
}) => {
  const { features } = useFeatureFlags();
  
  if (features[feature]) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default FeatureGate;
