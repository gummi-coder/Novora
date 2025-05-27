import { Request, Response, NextFunction } from 'express';
import { rateLimitService } from '../services/rateLimitService';

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const endpoint = req.path;
    const { isAllowed, remaining, resetTime } = await rateLimitService.checkRateLimit(
      req.user.id,
      endpoint
    );

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', remaining);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (!isAllowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      });
    }

    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // Fail open - allow request if rate limiting fails
    next();
  }
}; 