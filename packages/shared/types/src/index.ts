// Common types shared across all platform applications

export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GameSession {
  id: string;
  gameId: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  score?: number;
  metadata?: Record<string, any>;
}