import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AuthError } from '../services/auth/errors';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        next(new AuthError('Validation failed', { errors }));
      } else {
        next(error);
      }
    }
  };
}; 