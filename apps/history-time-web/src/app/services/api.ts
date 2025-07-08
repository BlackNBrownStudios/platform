/**
 * API service for communicating with the backend
 */
import { useConfig } from '../hooks/useConfig';

// Card interfaces
export interface Card {
  id: string;
  _id?: string; // MongoDB ObjectId, used in some operations
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
  isCorrect: boolean;
  placementOrder: number;
  placementPosition: number | null;
  timeTaken: number;
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

// Multiplayer Game interfaces
export interface MultiplayerGamePlayer {
  userId: string;
  username: string;
  cards: {
    cardId: string | Card;
    drawOrder: number;
  }[];
  isActive: boolean;
  score: number;
  correctPlacements: number;
  incorrectPlacements: number;
}

export interface TimelineCard {
  cardId: string | Card;
  position: number;
  placedBy: string;
  placementTime: string;
}

export interface MultiplayerGame {
  id: string;
  gameMode: 'timeline';
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  players: MultiplayerGamePlayer[];
  timeline: TimelineCard[];
  currentPlayerIndex: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  maxPlayers: number;
  timeStarted?: string;
  timeEnded?: string;
  totalTimeTaken: number;
  categories: string[];
  discardedCards: {
    cardId: string | Card;
    discardedBy: string;
    discardTime: string;
  }[];
  drawPile: {
    cardId: string | Card;
    drawOrder: number;
  }[];
  winnerUserId?: string;
  roomCode: string;
}

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

// API methods
class ApiService {
  private baseApiUrl: string;

  constructor() {
    // Use a fallback for server-side rendering
    this.baseApiUrl =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5001';
  }

  // Set the base API URL (useful for testing or when environment changes)
  setBaseApiUrl(url: string) {
    this.baseApiUrl = url;
  }

  // Get the base API URL
  getBaseApiUrl(): string {
    return this.baseApiUrl;
  }

  // Base fetcher with error handling
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      // Check if endpoint already contains /api/v1 to prevent duplication
      const url = endpoint.startsWith('http')
        ? endpoint
        : endpoint.includes('/api/v1')
          ? `${this.baseApiUrl}${endpoint}`
          : `${this.baseApiUrl}/api/v1${endpoint}`;

      let headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      };

      // Add authentication if available
      if (typeof window !== 'undefined') {
        // Check for regular auth token first
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers = {
            ...headers,
            Authorization: `Bearer ${token}`,
          };
        }
        // If no token, add guest user header if available
        else {
          const guestUserData = localStorage.getItem('history_time_guest_user');
          if (guestUserData) {
            try {
              const guestUser = JSON.parse(guestUserData);
              // Add custom header for guest user identification
              headers = {
                ...headers,
                'X-Guest-User-ID': guestUser.id,
                'X-Guest-Username': guestUser.name,
              };
            } catch (err) {
              console.error('Error parsing guest user data:', err);
            }
          }
        }
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Network response was not ok' }));
        throw new Error(error.message || 'Network response was not ok');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Card methods
  async getCards(params?: {
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Card>> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.fetchApi<ApiResponse<Card>>(`/api/v1/cards${queryString}`);
  }

  async getCardById(id: string): Promise<Card> {
    return this.fetchApi<Card>(`/api/v1/cards/${id}`);
  }

  async getRandomCards(params: {
    difficulty?: string;
    count?: number;
    category?: string;
  }): Promise<Card[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.fetchApi<Card[]>(`/api/v1/cards/random?${queryParams.toString()}`);
  }

  async getCategories(): Promise<string[]> {
    return this.fetchApi<string[]>('/api/v1/cards/categories');
  }

  // refreshCardImage removed - replaced by new image services architecture

  // Game methods
  async createGame(gameData: {
    difficulty: string;
    cardCount?: number;
    categories?: string[];
    preloadImages?: boolean;
  }): Promise<{ game: Game; imageMapping?: Record<string, string> }> {
    const response = await this.fetchApi<{ game: Game; imageMapping?: Record<string, string> }>(
      '/api/v1/games',
      {
        method: 'POST',
        body: JSON.stringify(gameData),
      }
    );

    // If response is just a game (for backward compatibility), wrap it
    if (!response.game && !response.imageMapping) {
      return { game: response as any };
    }

    return response;
  }

  async getGameById(id: string): Promise<Game> {
    return this.fetchApi<Game>(`/api/v1/games/${id}`);
  }

  async updateCardPlacement(
    gameId: string,
    placementData: {
      cardId: string;
      placementPosition: number;
      timeTaken: number;
    }
  ): Promise<Game> {
    return this.fetchApi<Game>(`/api/v1/games/${gameId}`, {
      method: 'PATCH',
      body: JSON.stringify({ cardPlacement: placementData }),
    });
  }

  async endGame(gameId: string): Promise<Game> {
    return this.fetchApi<Game>(`/api/v1/games/${gameId}/end`, {
      method: 'POST',
    });
  }

  async abandonGame(gameId: string): Promise<Game> {
    return this.fetchApi<Game>(`/api/v1/games/${gameId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'abandoned' }),
    });
  }

  async getLeaderboard(params?: {
    timeFrame?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    difficulty?: string;
    limit?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.fetchApi<any[]>(`/api/v1/leaderboard${query}`);
  }

  // Multiplayer Game methods
  async createMultiplayerGame(gameData: {
    difficulty?: string;
    categories?: string[];
    maxPlayers?: number;
    hostNickname?: string;
  }): Promise<MultiplayerGame> {
    return this.fetchApi<MultiplayerGame>('/api/v1/multiplayer-games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async getMultiplayerGameById(id: string): Promise<MultiplayerGame> {
    return this.fetchApi<MultiplayerGame>(`/api/v1/multiplayer-games/${id}`);
  }

  async getMultiplayerGameByRoomCode(roomCode: string): Promise<MultiplayerGame> {
    return this.fetchApi<MultiplayerGame>(`/api/v1/multiplayer-games/code/${roomCode}`);
  }

  async joinMultiplayerGame(roomCode: string, username?: string): Promise<MultiplayerGame> {
    return this.fetchApi<MultiplayerGame>(`/api/v1/multiplayer-games/join/${roomCode}`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async startMultiplayerGame(gameId: string): Promise<MultiplayerGame> {
    try {
      // Get auth token if available
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (typeof window !== 'undefined') {
        // Check for regular auth token first
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers = {
            ...headers,
            Authorization: `Bearer ${token}`,
          };
        }
        // If no token, check if we have guest user data
        else {
          const guestUserData = localStorage.getItem('history_time_guest_user');
          if (guestUserData) {
            try {
              const guestUser = JSON.parse(guestUserData);
              // Add custom header for guest user identification
              headers = {
                ...headers,
                'X-Guest-User-ID': guestUser.id,
                'X-Guest-Username': guestUser.name,
              };
            } catch (err) {
              console.error('Error parsing guest user data:', err);
            }
          }
        }
      }

      console.log('Starting multiplayer game:', gameId);
      console.log('Headers:', headers);

      // Make direct fetch call with more details
      const response = await fetch(`${this.baseApiUrl}/api/v1/multiplayer-games/${gameId}/start`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        console.error('Error starting game:', errorData);
        throw new Error(errorData.message || 'Failed to start the game');
      }

      return await response.json();
    } catch (error) {
      console.error('API error in startMultiplayerGame:', error);
      throw error;
    }
  }

  async placeCardMultiplayer(
    gameId: string,
    placementData: {
      cardId: string;
      position: number;
    }
  ): Promise<{ game: MultiplayerGame; result: any }> {
    try {
      // Get auth token if available
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (typeof window !== 'undefined') {
        // Check for regular auth token first
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers = {
            ...headers,
            Authorization: `Bearer ${token}`,
          };
        }
        // If no token, check if we have guest user data
        else {
          const guestUserData = localStorage.getItem('history_time_guest_user');
          if (guestUserData) {
            try {
              const guestUser = JSON.parse(guestUserData);
              if (!guestUser.id || !guestUser.name) {
                throw new Error('Invalid guest user data');
              }
              // Add custom headers to identify the guest user
              headers = {
                ...headers,
                'X-Guest-User-ID': guestUser.id,
                'X-Guest-Username': guestUser.name,
              };
              console.log('Added guest user headers:', {
                id: guestUser.id,
                name: guestUser.name,
              });
            } catch (err) {
              console.error('Error parsing guest user data:', err);
              throw new Error('Unable to identify guest user. Please refresh and try again.');
            }
          } else {
            console.error('No authentication found - neither token nor guest data');
            throw new Error('Authentication required. Please log in or continue as guest.');
          }
        }
      }

      console.log('Placing card in multiplayer game:', gameId);
      console.log('Placement data:', placementData);
      console.log('Headers:', headers);

      // Make direct fetch call with more detailed error handling
      const response = await fetch(
        `${this.baseApiUrl}/api/v1/multiplayer-games/${gameId}/place-card`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(placementData),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to place the card';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Detailed error response:', errorData);
        } catch (parseErr) {
          console.error('Could not parse error response:', parseErr);
        }

        // Specific error handling for common status codes
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Not authorized to place cards in this game. Is it your turn?';
        } else if (response.status === 404) {
          errorMessage = 'Game or card not found';
        } else if (response.status === 400) {
          errorMessage = 'Invalid card placement';
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API error in placeCardMultiplayer:', error);
      throw error;
    }
  }

  async leaveMultiplayerGame(gameId: string): Promise<MultiplayerGame | null> {
    return this.fetchApi<MultiplayerGame | null>(`/api/v1/multiplayer-games/${gameId}/leave`, {
      method: 'PATCH',
    });
  }

  async getUserMultiplayerGames(): Promise<MultiplayerGame[]> {
    return this.fetchApi<MultiplayerGame[]>('/api/v1/multiplayer-games');
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ user: any; tokens: any }> {
    return this.fetchApi<{ user: any; tokens: any }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: any; tokens: any }> {
    return this.fetchApi<{ user: any; tokens: any }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout(refreshToken: string): Promise<void> {
    return this.fetchApi<void>('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async refreshToken(refreshToken: string): Promise<any> {
    return this.fetchApi<any>('/api/v1/auth/refresh-tokens', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.fetchApi<any>('/api/v1/users/me');
  }
}

// Export a singleton instance
export const apiService = new ApiService();
