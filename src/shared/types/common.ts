export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user' | 'guest';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
} 