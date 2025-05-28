import { ErrorResponse } from '../types/common';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'APP_ERROR',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): ErrorResponse => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.statusCode,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      status: 500
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500
  };
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const createError = (
  statusCode: number,
  message: string,
  code?: string,
  details?: Record<string, any>
): AppError => {
  return new AppError(statusCode, message, code, details);
}; 