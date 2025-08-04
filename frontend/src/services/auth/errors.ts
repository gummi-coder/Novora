export class AuthError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = 401;
    this.details = details;
  }
}

export class ValidationError extends AuthError {
  constructor(message: string, details?: any) {
    super(message, details);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export class PermissionError extends AuthError {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'PermissionError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends AuthError {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
} 