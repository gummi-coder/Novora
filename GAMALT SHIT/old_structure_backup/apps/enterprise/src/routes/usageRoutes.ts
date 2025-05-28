import { Router } from 'express';
import { usageService } from '../services/usageService';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSubscription } from '../middleware/subscriptionMiddleware';

const router = Router();

// Get current usage metrics
router.get('/current', requireAuth, async (req, res) => {
  try {
    const usage = await usageService.getCurrentUsage();
    res.json(usage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage metrics' });
  }
});

// Get usage history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const history = await usageService.getUsageHistory(
      startDate as string,
      endDate as string
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

// Get usage alerts
router.get('/alerts', requireAuth, async (req, res) => {
  try {
    const alerts = await usageService.getUsageAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage alerts' });
  }
});

// Check resource availability
router.get('/check/:resource', requireAuth, async (req, res) => {
  try {
    const { resource } = req.params;
    const isAvailable = await usageService.checkResourceAvailability(resource as any);
    res.json({ isAvailable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check resource availability' });
  }
});

// Increment usage
router.post('/increment', requireAuth, async (req, res) => {
  try {
    const { resource, amount } = req.body;
    await usageService.incrementUsage(resource, amount);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to increment usage' });
  }
});

// Set usage limit (admin only)
router.post('/limits', requireAuth, requireSubscription('enterprise'), async (req, res) => {
  try {
    const { resource, limit } = req.body;
    await usageService.setUsageLimit(resource, limit);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set usage limit' });
  }
});

// Get usage report
router.get('/report', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await usageService.getUsageReport(
      startDate as string,
      endDate as string
    );
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=usage-report.pdf');
    res.send(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate usage report' });
  }
});

// Enterprise-only routes
router.get('/analytics/advanced', requireAuth, requireSubscription('enterprise'), async (req, res) => {
  try {
    const analytics = await usageService.getAdvancedUsageAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch advanced analytics' });
  }
});

router.post('/thresholds', requireAuth, requireSubscription('enterprise'), async (req, res) => {
  try {
    const { thresholds } = req.body;
    await usageService.setCustomUsageThresholds(thresholds);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set usage thresholds' });
  }
});

router.get('/predictions', requireAuth, requireSubscription('enterprise'), async (req, res) => {
  try {
    const predictions = await usageService.getUsagePredictions();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage predictions' });
  }
});

export default router; 