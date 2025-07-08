export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}