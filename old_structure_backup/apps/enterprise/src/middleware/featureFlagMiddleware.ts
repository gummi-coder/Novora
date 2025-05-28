import { Request, Response, NextFunction } from 'express';
import { featureFlagService } from '../services/featureFlagService';
import { subscriptionService } from '../services/subscriptionService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const requireFeature = (featureId: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const subscriptionResponse = await subscriptionService.getCurrentSubscription(req.user.id);
      const subscription = subscriptionResponse.data;

      if (!subscription) {
        res.status(403).json({ error: 'Subscription required' });
        return;
      }

      const isEnabled = await featureFlagService.isFeatureEnabled(featureId, subscription.tier);

      if (!isEnabled) {
        res.status(403).json({
          error: 'Feature not available',
          message: 'This feature is not available for your subscription tier or is currently disabled.',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Feature flag check failed:', error);
      res.status(500).json({ error: 'Failed to verify feature access' });
    }
  };
}; 