import React from 'react';
import { isFeatureEnabled } from '@/config/environment';

interface FeatureFlagProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showInDevelopment?: boolean;
}

/**
 * FeatureFlag component that conditionally renders content based on feature flags
 * 
 * @param feature - The feature flag to check
 * @param children - Content to render when feature is enabled
 * @param fallback - Content to render when feature is disabled (optional)
 * @param showInDevelopment - Whether to show feature in development mode (default: true)
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  feature,
  children,
  fallback = null,
  showInDevelopment = true,
}) => {
  const isEnabled = isFeatureEnabled(feature as any);
  
  // Always show in development if showInDevelopment is true
      if (showInDevelopment && import.meta.env.MODE === 'development') {
    return <>{children}</>;
  }
  
  // Show based on feature flag
  if (isEnabled) {
    return <>{children}</>;
  }
  
  // Show fallback if provided
  return <>{fallback}</>;
};

/**
 * Hook to check if a feature is enabled
 */
export const useFeatureFlag = (feature: string): boolean => {
  return isFeatureEnabled(feature as any);
};

/**
 * Higher-order component to wrap components with feature flags
 */
export const withFeatureFlag = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  fallback?: React.ComponentType<P>
) => {
  return (props: P) => (
    <FeatureFlag feature={feature} fallback={fallback ? <fallback {...props} /> : null}>
      <WrappedComponent {...props} />
    </FeatureFlag>
  );
};

export default FeatureFlag;
