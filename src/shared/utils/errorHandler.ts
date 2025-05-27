export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): { message: string; statusCode: number } => {
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode };
  }
  return { message: 'Internal Server Error', statusCode: 500 };
}; 