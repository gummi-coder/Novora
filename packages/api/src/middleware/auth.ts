import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { redis } from '../infrastructure/redis';
import { AuthError } from '../services/auth/errors';
import { UserSession } from '../services/auth';

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verify(token, process.env.JWT_SECRET!) as UserSession;

    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AuthError('Token has been invalidated');
    }

    req.user = payload;
    next();
  } catch (error) {
    next(new AuthError('Invalid token'));
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError('Authentication required'));
    }

    const hasRole = req.user.roles.some(role => roles.includes(role));
    if (!hasRole) {
      return next(new AuthError('Insufficient permissions'));
    }

    next();
  };
};

export const requireCompany = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.companyId) {
    return next(new AuthError('Company context required'));
  }
  next();
};

// Rate limiting middleware
export const rateLimit = (windowMs: number, max: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `ratelimit:${req.ip}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowMs / 1000);
    }

    if (current > max) {
      return next(new AuthError('Too many requests'));
    }

    next();
  };
};

export const authenticateToken = requireAuth; 