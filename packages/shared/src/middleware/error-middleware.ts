import { Request, Response, NextFunction } from 'express';
import { ErrorService, AppError, ErrorSeverity } from '../services/error-service';

const errorService = new ErrorService();

// Error response interface
interface ErrorResponse {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

// Global error handling middleware
export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Add request context to error
  const context = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    userId: req.user?.id,
    requestId: req.id
  };

  // Handle error
  errorService.handleError(err, context);

  // Convert error to response format
  const errorResponse = convertErrorToResponse(err);

  // Send response
  res.status(errorResponse.status).json(errorResponse);
};

// Convert error to response format
function convertErrorToResponse(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: getStatusCodeFromSeverity(error.severity),
      details: error.context
    };
  }

  if (error instanceof Error) {
    return {
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      code: 'INTERNAL_SERVER_ERROR',
      status: 500
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    status: 500
  };
}

// Get HTTP status code from error severity
function getStatusCodeFromSeverity(severity: ErrorSeverity): number {
  switch (severity) {
    case ErrorSeverity.DEBUG:
    case ErrorSeverity.INFO:
      return 200;
    case ErrorSeverity.WARNING:
      return 400;
    case ErrorSeverity.ERROR:
      return 500;
    case ErrorSeverity.CRITICAL:
      return 503;
    default:
      return 500;
  }
}

// Request validation middleware
export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(errorService.createValidationError('Invalid request data', { error }));
    }
  };
};

// Authentication error middleware
export const handleAuthError = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof Error && error.message.includes('authentication')) {
    next(errorService.createAuthError(error.message));
  } else {
    next(error);
  }
};

// Database error middleware
export const handleDatabaseError = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof Error && error.message.includes('database')) {
    next(errorService.createDatabaseError(error.message));
  } else {
    next(error);
  }
};

// Network error middleware
export const handleNetworkError = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof Error && error.message.includes('network')) {
    next(errorService.createNetworkError(error.message));
  } else {
    next(error);
  }
}; 