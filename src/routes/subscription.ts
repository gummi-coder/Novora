import { Router } from 'express';
import { z } from 'zod';
import { SubscriptionService } from '../services/subscription';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const subscriptionService = SubscriptionService.getInstance();

// Validation schemas
const createSubscriptionSchema = z.object({
  planId: z.string(),
  paymentMethodId: z.string()
});

const updateSubscriptionSchema = z.object({
  newPlanId: z.string()
});

// Get available plans
router.get('/plans', async (req, res) => {
  const plans = subscriptionService.getPlans();
  res.json(plans);
});

// Create subscription
router.post(
  '/create',
  requireAuth,
  validateRequest(createSubscriptionSchema),
  async (req, res, next) => {
    try {
      const { planId, paymentMethodId } = req.body;
      const result = await subscriptionService.createSubscription(
        req.user!.userId,
        planId,
        paymentMethodId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Update subscription
router.post(
  '/update',
  requireAuth,
  validateRequest(updateSubscriptionSchema),
  async (req, res, next) => {
    try {
      const { newPlanId } = req.body;
      const result = await subscriptionService.updateSubscription(
        req.user!.userId,
        newPlanId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Cancel subscription
router.post(
  '/cancel',
  requireAuth,
  async (req, res, next) => {
    try {
      await subscriptionService.cancelSubscription(req.user!.userId);
      res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Get billing history
router.get(
  '/billing-history',
  requireAuth,
  async (req, res, next) => {
    try {
      const history = await subscriptionService.getBillingHistory(req.user!.userId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
);

// Webhook handler for Stripe events
router.post(
  '/webhook',
  async (req, res, next) => {
    try {
      const event = req.body;
      await subscriptionService.handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
);

// Check subscription limits
router.get(
  '/limits/:resource',
  requireAuth,
  async (req, res, next) => {
    try {
      const { resource } = req.params;
      const hasAccess = await subscriptionService.checkSubscriptionLimits(
        req.user!.userId,
        resource as any
      );
      res.json({ hasAccess });
    } catch (error) {
      next(error);
    }
  }
);

export default router; 