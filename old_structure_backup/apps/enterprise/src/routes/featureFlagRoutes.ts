import { Router } from 'express';
import { featureFlagService } from '../services/featureFlagService';
import { subscriptionService } from '../services/subscriptionService';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSubscription } from '../middleware/subscriptionMiddleware';

const router = Router();

// Get all feature flags (admin only)
router.get('/', requireAuth, requireSubscription('enterprise'), async (req, res): Promise<void> => {
  try {
    const flags = await featureFlagService.getFeatureFlags();
    res.json({ data: flags });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feature flags' });
  }
});

// Get a specific feature flag
router.get('/:id', requireAuth, async (req, res): Promise<void> => {
  try {
    const flag = await featureFlagService.getFeatureFlag(req.params.id);
    if (!flag) {
      res.status(404).json({ error: 'Feature flag not found' });
      return;
    }
    res.json({ data: flag });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feature flag' });
  }
});

// Update a feature flag (admin only)
router.patch('/:id', requireAuth, requireSubscription('enterprise'), async (req, res): Promise<void> => {
  try {
    const flag = await featureFlagService.updateFeatureFlag(req.params.id, req.body);
    if (!flag) {
      res.status(404).json({ error: 'Feature flag not found' });
      return;
    }
    res.json({ data: flag });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update feature flag' });
  }
});

// Delete a feature flag (admin only)
router.delete('/:id', requireAuth, requireSubscription('enterprise'), async (req, res): Promise<void> => {
  try {
    const success = await featureFlagService.deleteFeatureFlag(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Feature flag not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete feature flag' });
  }
});

// Check if a feature is enabled for the current user
router.get('/:id/check', requireAuth, async (req, res): Promise<void> => {
  try {
    const subscriptionResponse = await subscriptionService.getCurrentSubscription(req.user.id);
    const subscription = subscriptionResponse.data;

    if (!subscription) {
      res.status(403).json({ error: 'Subscription required' });
      return;
    }

    const isEnabled = await featureFlagService.isFeatureEnabled(req.params.id, subscription.tier);
    res.json({ data: { enabled: isEnabled } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check feature flag' });
  }
});

export default router; 