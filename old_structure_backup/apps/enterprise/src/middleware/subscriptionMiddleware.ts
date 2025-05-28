import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscriptionService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const requireSubscription = (requiredTier: 'basic' | 'pro' | 'enterprise') => {
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

      const tierOrder = ['basic', 'pro', 'enterprise'];
      const userTierIndex = tierOrder.indexOf(subscription.tier);
      const requiredTierIndex = tierOrder.indexOf(requiredTier);

      if (userTierIndex < requiredTierIndex) {
        res.status(403).json({
          error: 'Insufficient subscription tier',
          message: `This feature requires a ${requiredTier} subscription`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify subscription' });
    }
  };
}; 