/**
 * Shared type definitions for History Time web and mobile applications
 */

// Card interfaces
export interface Card {
  id: string;
  title: string;
  description: string;
  date: string;
  year: number;
  imageUrl?: string;
  category: string;
  subcategory?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  region?: string;
  tags?: string[];
}

// Game interfaces
export interface GameCard {
  cardId: string | Card; // Can be string ID or full Card object when populated
  isCorrect?: boolean;
  placementOrder: number;
  placementPosition: number | null;
  timeTaken?: number;
}

export interface Game {
  id: string;
  cards: GameCard[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  correctPlacements: number;
  incorrectPlacements: number;
  timeStarted: string;
  timeEnded?: string;
  totalTimeTaken: number;
  categories: string[];
  isWin: boolean;
}

// Game creation options
export interface GameOptions {
  difficulty: string;
  cardCount?: number;
  categories?: string[];
}

// Leaderboard interfaces
export interface LeaderboardEntry {
  userId:
    | {
        _id: string;
        name: string;
      }
    | string
    | null;
  score: number;
  correctPlacements: number;
  totalCards: number;
  totalTimeTaken: number;
  difficulty: string;
  date: string;
  rank?: number;
}

// Leaderboard query options
export interface LeaderboardOptions {
  category?: string;
  timeFrame?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  difficulty?: string;
  limit?: number;
}

// Alias for LeaderboardEntry to maintain type compatibility with existing code
export type Leaderboard = LeaderboardEntry;

// API response interfaces
export interface ApiResponse<T> {
  results?: T[];
  totalResults?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
  message?: string;
}

// API error interface
export interface ApiError {
  code: number;
  message: string;
}

// User interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  stats?: UserStats;
  bio?: string;
  profilePicture?: string;
  preferredCategory?: string;
}

// User statistics interface
export interface UserStats {
  totalGames: number;
  completedGames: number;
  abandonedGames: number;
  bestScore: number;
  averageScore: number;
  totalTimePlayed: number;
  favoriteCategory: string | null;
  gamesWon?: number;
  highScore?: number;
}

// Game summary for profile display
export interface GameSummary {
  id: string;
  date: Date;
  status: string;
  score: number;
  timeTaken: number;
  difficulty: string;
  categories: string[];
  correctCards: number;
  totalCards: number;
}

// Auth interfaces
export interface AuthTokens {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Historical Events exports
export * from './historicalEvents';
