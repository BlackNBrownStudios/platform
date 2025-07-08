/**
 * Base API service to be extended by platform-specific implementations
 */
import {
  ApiResponse,
  Card,
  Game,
  LeaderboardEntry,
  AuthResponse,
  User,
  UserStats,
  GameSummary,
  HistoricalEvent,
  EventFilters,
  EventsResponse,
} from '../types';

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  getAuthToken?: () => Promise<string | null>;
  getRefreshToken?: () => Promise<string | null>;
}

/**
 * Base API service with common functionality for both web and mobile
 */
export abstract class BaseApiService {
  protected config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Make HTTP request to the API
   * This method is implemented by platform-specific subclasses
   */
  protected abstract request<T>(
    path: string,
    method: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T>;

  /**
   * Get cards with optional filtering
   */
  async getCards(params?: {
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
    random?: boolean;
  }): Promise<ApiResponse<Card>> {
    const queryParams = new URLSearchParams();

    if (params?.category) {
      queryParams.append('category', params.category);
    }

    if (params?.difficulty) {
      queryParams.append('difficulty', params.difficulty);
    }

    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    if (params?.random) {
      queryParams.append('random', 'true');
    }

    const query = queryParams.toString();
    const url = `/cards${query ? `?${query}` : ''}`;

    return this.request<ApiResponse<Card>>(url, 'GET');
  }

  /**
   * Get random cards for a game
   */
  async getRandomCards(params: {
    difficulty?: string;
    count?: number;
    category?: string;
  }): Promise<Card[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('random', 'true');

    if (params.difficulty) {
      queryParams.append('difficulty', params.difficulty);
    }

    if (params.count) {
      queryParams.append('limit', params.count.toString());
    }

    if (params.category) {
      queryParams.append('category', params.category);
    }

    const url = `/cards?${queryParams.toString()}`;
    const response = await this.request<ApiResponse<Card>>(url, 'GET');
    return response.results || [];
  }

  /**
   * Get card categories
   */
  async getCategories(): Promise<string[]> {
    const response = await this.request<{ categories: string[] }>('/cards/categories', 'GET');
    return response.categories;
  }

  /**
   * Create a new game
   */
  async createGame(params: {
    difficulty: string;
    cardCount?: number;
    categories?: string[];
  }): Promise<Game> {
    return this.request<Game>('/games', 'POST', params);
  }

  /**
   * Get a specific game by ID
   */
  async getGame(gameId: string): Promise<Game> {
    return this.request<Game>(`/games/${gameId}`, 'GET');
  }

  /**
   * Update card placement in a game
   */
  async updateCardPlacement(
    gameId: string,
    params: {
      cardId: string;
      placementPosition: number;
      timeTaken: number;
    }
  ): Promise<Game> {
    return this.request<Game>(`/games/${gameId}/cards/${params.cardId}/placement`, 'PUT', {
      placementPosition: params.placementPosition,
      timeTaken: params.timeTaken,
    });
  }

  /**
   * End a game
   */
  async endGame(gameId: string): Promise<Game> {
    return this.request<Game>(`/games/${gameId}/end`, 'PUT');
  }

  /**
   * Abandon a game
   */
  async abandonGame(gameId: string): Promise<Game> {
    return this.request<Game>(`/games/${gameId}/abandon`, 'PUT');
  }

  /**
   * Get leaderboard with optional filtering
   */
  async getLeaderboard(params?: {
    timeFrame?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    difficulty?: string;
    category?: string;
    limit?: number;
  }): Promise<LeaderboardEntry[]> {
    const queryParams = new URLSearchParams();

    if (params?.timeFrame) {
      queryParams.append('timeFrame', params.timeFrame);
    }

    if (params?.difficulty) {
      queryParams.append('difficulty', params.difficulty);
    }

    if (params?.category) {
      queryParams.append('category', params.category);
    }

    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const query = queryParams.toString();
    const url = `/leaderboard${query ? `?${query}` : ''}`;

    return this.request<LeaderboardEntry[]>(url, 'GET');
  }

  /**
   * User login
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', 'POST', { email, password });
  }

  /**
   * User registration
   */
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', 'POST', {
      name: username,
      email,
      password,
    });
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<User> {
    return this.request<User>('/users/profile', 'GET');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/users/profile', 'PUT', data);
  }

  /**
   * Get user game statistics
   */
  async getUserGameStats(userId: string): Promise<UserStats> {
    return this.request<UserStats>(`/users/${userId}/stats`, 'GET');
  }

  /**
   * Get user's recent games
   */
  async getUserRecentGames(userId: string, limit: number = 10): Promise<GameSummary[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());

    return this.request<GameSummary[]>(`/users/${userId}/games?${queryParams.toString()}`, 'GET');
  }

  /**
   * Get historical events with optional filtering
   */
  async getHistoricalEvents(filters?: EventFilters): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.category) {
      queryParams.append('category', filters.category);
    }

    if (filters?.startYear) {
      queryParams.append('startYear', filters.startYear.toString());
    }

    if (filters?.endYear) {
      queryParams.append('endYear', filters.endYear.toString());
    }

    if (filters?.significance) {
      queryParams.append('significance', filters.significance);
    }

    if (filters?.tags && filters.tags.length > 0) {
      queryParams.append('tags', filters.tags.join(','));
    }

    if (filters?.searchTerm) {
      queryParams.append('searchTerm', filters.searchTerm);
    }

    if (filters?.verified !== undefined) {
      queryParams.append('verified', filters.verified.toString());
    }

    if (filters?.page) {
      queryParams.append('page', filters.page.toString());
    }

    if (filters?.limit) {
      queryParams.append('limit', filters.limit.toString());
    }

    if (filters?.sortBy) {
      queryParams.append('sortBy', filters.sortBy);
    }

    const query = queryParams.toString();
    const url = `/historical-events${query ? `?${query}` : ''}`;

    return this.request<EventsResponse>(url, 'GET');
  }

  /**
   * Get a specific historical event by ID
   */
  async getHistoricalEventById(id: string): Promise<HistoricalEvent> {
    return this.request<HistoricalEvent>(`/historical-events/${id}`, 'GET');
  }

  /**
   * Get historical events by category
   */
  async getHistoricalEventsByCategory(category: string): Promise<EventsResponse> {
    return this.request<EventsResponse>(`/historical-events/category/${category}`, 'GET');
  }

  /**
   * Get historical events by time period
   */
  async getHistoricalEventsByTimePeriod(
    startYear: number,
    endYear: number
  ): Promise<EventsResponse> {
    return this.request<EventsResponse>(`/historical-events/period/${startYear}/${endYear}`, 'GET');
  }

  /**
   * Get all available historical event categories
   */
  async getHistoricalEventCategories(): Promise<string[]> {
    const response = await this.request<{ categories: string[] }>(
      '/historical-events/categories',
      'GET'
    );
    return response.categories;
  }

  /**
   * Get historical event year range (min and max years)
   */
  async getHistoricalEventYearRange(): Promise<[number, number]> {
    const response = await this.request<{ range: [number, number] }>(
      '/historical-events/year-range',
      'GET'
    );
    return response.range;
  }

  /**
   * Get random historical events for games or quizzes
   */
  async getRandomHistoricalEvents(params: {
    count?: number;
    categories?: string[];
    difficulty?: string;
  }): Promise<HistoricalEvent[]> {
    const queryParams = new URLSearchParams();

    if (params.count) {
      queryParams.append('count', params.count.toString());
    }

    if (params.categories && params.categories.length > 0) {
      queryParams.append('categories', params.categories.join(','));
    }

    if (params.difficulty) {
      queryParams.append('difficulty', params.difficulty);
    }

    const url = `/historical-events/random?${queryParams.toString()}`;

    const response = await this.request<{ events: HistoricalEvent[] }>(url, 'GET');
    return response.events || [];
  }

  /**
   * Submit a historical event for verification
   */
  async submitHistoricalEvent(event: Partial<HistoricalEvent>): Promise<HistoricalEvent> {
    return this.request<HistoricalEvent>('/historical-events/submit', 'POST', event);
  }

  /**
   * Helper properties for mobile implementation
   */
  get baseUrl(): string {
    return this.config.baseUrl;
  }
}
