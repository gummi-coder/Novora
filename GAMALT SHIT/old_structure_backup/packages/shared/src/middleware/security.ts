import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  corsConfig,
  rateLimitConfig,
  apiRateLimitConfig,
  helmetConfig,
  securityHeaders,
  validationRules,
} from '../config/security';

// CORS middleware
export const corsMiddleware = cors(corsConfig);

// Helmet middleware for security headers
export const helmetMiddleware = helmet(helmetConfig);

// Rate limiting middleware
export const rateLimitMiddleware = rateLimit(rateLimitConfig);
export const apiRateLimitMiddleware = rateLimit(apiRateLimitConfig);

// Custom security headers middleware
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
};

// Input validation middleware using Zod
export const validateInput = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  email: z.string().email(),
  password: z.string().regex(validationRules.password.pattern, validationRules.password.message),
  username: z.string().regex(validationRules.username.pattern, validationRules.username.message),
};

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Sanitize string inputs
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove HTML tags and encode special characters
        req.body[key] = req.body[key]
          .replace(/<[^>]*>/g, '')
          .replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          }[char]));
      }
    });
  }
  next();
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
};

// Export all middleware as a single object
export const securityMiddleware = {
  cors: corsMiddleware,
  helmet: helmetMiddleware,
  rateLimit: rateLimitMiddleware,
  apiRateLimit: apiRateLimitMiddleware,
  securityHeaders: securityHeadersMiddleware,
  validateInput,
  sanitizeInput,
  errorHandler,
  requestLogger,
}; 