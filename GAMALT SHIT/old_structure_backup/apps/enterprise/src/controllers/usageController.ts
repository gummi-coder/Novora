import { Request, Response } from 'express';
import { usageRepository } from '../repositories/usageRepository';
import { subscriptionService } from '../services/subscriptionService';

export class UsageController {
  async getCurrentUsage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const metrics = await usageRepository.getMetrics(userId);
      const subscription = await subscriptionService.getCurrentSubscription(userId);

      const usage = metrics.reduce((acc, metric) => ({
        ...acc,
        [metric.resource]: {
          total: metric.count,
          limit: metric.limit,
          usage: (metric.count / metric.limit) * 100,
        },
      }), {});

      res.json({ data: usage });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch usage metrics' });
    }
  }

  async getUsageHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { startDate, endDate } = req.query;
      const history = await usageRepository.getHistory(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({ data: history });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch usage history' });
    }
  }

  async getUsageAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const alerts = await usageRepository.getAlerts(userId);
      res.json({ data: alerts });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch usage alerts' });
    }
  }

  async checkResourceAvailability(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { resource } = req.params;
      const metric = await usageRepository.getMetric(userId, resource);

      if (!metric) {
        return res.json({ data: { isAvailable: true } });
      }

      const isAvailable = metric.count < metric.limit;
      res.json({ data: { isAvailable } });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check resource availability' });
    }
  }

  async incrementUsage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { resource, amount = 1 } = req.body;
      const metric = await usageRepository.incrementMetric(userId, resource, amount);

      // Check if we need to create an alert
      const threshold = metric.limit * 0.9; // 90% threshold
      if (metric.count >= threshold) {
        await usageRepository.createAlert({
          userId,
          type: metric.count >= metric.limit ? 'critical' : 'warning',
          metric: resource,
          threshold,
          currentValue: metric.count,
          message: `Usage of ${resource} is at ${Math.round((metric.count / metric.limit) * 100)}% of limit`,
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to increment usage' });
    }
  }

  async setUsageLimit(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { resource, limit } = req.body;
      await usageRepository.updateMetric(userId, resource, 0, limit);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to set usage limit' });
    }
  }

  async getUsageReport(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { startDate, endDate } = req.query;
      const history = await usageRepository.getHistory(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      const totalUsage = await usageRepository.getTotalUsage(userId);
      const trends = await usageRepository.getUsageTrends(userId, 30);

      // Generate PDF report
      // TODO: Implement PDF generation

      res.json({ data: { history, totalUsage, trends } });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate usage report' });
    }
  }
}

export const usageController = new UsageController(); 