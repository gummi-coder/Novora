import { Request, Response, NextFunction } from 'express';
import { usageService } from '../services/usageService';
import { UsageMetrics } from '../services/usageService';

interface ResourceMapping {
  [key: string]: keyof UsageMetrics;
}

const resourceMapping: ResourceMapping = {
  '/api/surveys': 'surveys',
  '/api/responses': 'responses',
  '/api/storage': 'storage',
  '/api/team': 'teamMembers',
};

export const usageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip usage tracking for certain endpoints
    if (req.path.startsWith('/api/usage') || req.path.startsWith('/api/auth')) {
      return next();
    }

    // Determine which resource is being accessed
    const resource = Object.entries(resourceMapping).find(([path]) => 
      req.path.startsWith(path)
    )?.[1];

    if (!resource) {
      return next();
    }

    // Check if the resource is available
    const isAvailable = await usageService.checkResourceAvailability(resource);
    
    if (!isAvailable) {
      return res.status(429).json({
        error: 'Resource limit exceeded',
        message: `You have reached your ${resource} limit. Please upgrade your plan to continue.`,
      });
    }

    // Track the usage
    await usageService.incrementUsage(resource);

    // Add usage information to response headers
    const currentUsage = await usageService.getCurrentUsage();
    res.setHeader('X-Usage-Limit', currentUsage.data[resource].limit);
    res.setHeader('X-Usage-Current', currentUsage.data[resource].usage);

    next();
  } catch (error) {
    console.error('Usage middleware error:', error);
    next(error);
  }
};

export const usageAlertMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await usageService.getUsageAlerts();
    
    if (alerts.data.length > 0) {
      res.setHeader('X-Usage-Alerts', JSON.stringify(alerts.data));
    }

    next();
  } catch (error) {
    console.error('Usage alert middleware error:', error);
    next(error);
  }
}; 