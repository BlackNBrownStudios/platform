/**
 * Mobile-specific implementation of the API service
 */
import {
  ApiResponse,
  Card,
  HistoricalEvent,
  EventFilters,
  EventsResponse,
  Game,
  User,
  LeaderboardEntry,
  UserStats,
  AuthResponse,
} from '../types';

import { BaseApiService, ApiConfig } from './api.base';

export class MobileApiService extends BaseApiService {
  private authToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: ApiConfig) {
    super(config);
  }

  /**
   * Set authentication tokens
   */
  setTokens(authToken: string | null, refreshToken: string | null = null): void {
    this.authToken = authToken;
    this.refreshToken = refreshToken;
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.authToken;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Clear auth tokens (logout)
   */
  logout(): void {
    this.authToken = null;
    this.refreshToken = null;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', 'POST', { email, password });
  }

  /**
   * Register a new user
   */
  async register(userData: Partial<User>): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', 'POST', userData);
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/users/profile', 'GET');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/users/profile', 'PATCH', userData);
  }

  /**
   * Get user game stats
   */
  async getUserGameStats(): Promise<ApiResponse<UserStats>> {
    return this.request<ApiResponse<UserStats>>('/users/stats', 'GET');
  }

  /**
   * Get all cards
   */
  async getCards(filters?: any): Promise<ApiResponse<Card>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/cards${queryString ? `?${queryString}` : ''}`;

    return this.request<ApiResponse<Card>>(endpoint, 'GET');
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<ApiResponse<string>> {
    return this.request<ApiResponse<string>>('/cards/categories', 'GET');
  }

  /**
   * Get random cards
   */
  async getRandomCards(count: number = 10): Promise<ApiResponse<Card>> {
    return this.request<ApiResponse<Card>>(`/cards/random?count=${count}`, 'GET');
  }

  /**
   * Create a new game
   */
  async createGame(): Promise<ApiResponse<Game>> {
    return this.request<ApiResponse<Game>>('/games', 'POST');
  }

  /**
   * Get a game by ID
   */
  async getGame(gameId: string): Promise<ApiResponse<Game>> {
    return this.request<ApiResponse<Game>>(`/games/${gameId}`, 'GET');
  }

  /**
   * Update card placement in a game
   */
  async updateCardPlacement(
    gameId: string,
    cardId: string,
    position: number
  ): Promise<ApiResponse<Game>> {
    return this.request<ApiResponse<Game>>(`/games/${gameId}/place-card`, 'PATCH', {
      cardId,
      position,
    });
  }

  /**
   * End a game
   */
  async endGame(gameId: string): Promise<ApiResponse<Game>> {
    return this.request<ApiResponse<Game>>(`/games/${gameId}/end`, 'PATCH');
  }

  /**
   * Abandon a game
   */
  async abandonGame(gameId: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/games/${gameId}/abandon`, 'PATCH');
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(timeFrame: string = 'allTime'): Promise<ApiResponse<LeaderboardEntry>> {
    return this.request<ApiResponse<LeaderboardEntry>>(
      `/games/leaderboard?timeFrame=${timeFrame}`,
      'GET'
    );
  }

  /**
   * Get historical events
   */
  async getHistoricalEvents(
    filters?: EventFilters,
    page?: number,
    limit?: number
  ): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();

    if (page !== undefined) queryParams.append('page', String(page));
    if (limit !== undefined) queryParams.append('limit', String(limit));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/historical-events${queryString ? `?${queryString}` : ''}`;

    return this.request<EventsResponse>(endpoint, 'GET');
  }

  /**
   * Get a historical event by ID
   */
  async getHistoricalEventById(eventId: string): Promise<ApiResponse<HistoricalEvent>> {
    return this.request<ApiResponse<HistoricalEvent>>(`/historical-events/${eventId}`, 'GET');
  }

  /**
   * Get historical events by category
   */
  async getHistoricalEventsByCategory(
    category: string,
    page?: number,
    limit?: number
  ): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('category', category);

    if (page !== undefined) queryParams.append('page', String(page));
    if (limit !== undefined) queryParams.append('limit', String(limit));

    const queryString = queryParams.toString();
    const endpoint = `/historical-events/category?${queryString}`;

    return this.request<EventsResponse>(endpoint, 'GET');
  }

  /**
   * Get historical events by time period
   */
  async getHistoricalEventsByTimePeriod(
    startYear: number,
    endYear: number,
    page?: number,
    limit?: number
  ): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('startYear', String(startYear));
    queryParams.append('endYear', String(endYear));

    if (page !== undefined) queryParams.append('page', String(page));
    if (limit !== undefined) queryParams.append('limit', String(limit));

    const queryString = queryParams.toString();
    const endpoint = `/historical-events/period?${queryString}`;

    return this.request<EventsResponse>(endpoint, 'GET');
  }

  /**
   * Get historical event categories
   */
  async getHistoricalEventCategories(): Promise<ApiResponse<string[]>> {
    return this.request<ApiResponse<string[]>>('/historical-events/categories', 'GET');
  }

  /**
   * Get historical event year range
   */
  async getHistoricalEventYearRange(): Promise<ApiResponse<{ minYear: number; maxYear: number }>> {
    return this.request<ApiResponse<{ minYear: number; maxYear: number }>>(
      '/historical-events/year-range',
      'GET'
    );
  }

  /**
   * Get random historical events
   */
  async getRandomHistoricalEvents(count: number = 10): Promise<ApiResponse<HistoricalEvent[]>> {
    return this.request<ApiResponse<HistoricalEvent[]>>(
      `/historical-events/random?count=${count}`,
      'GET'
    );
  }

  /**
   * Submit a new historical event
   */
  async submitHistoricalEvent(
    eventData: Partial<HistoricalEvent>
  ): Promise<ApiResponse<HistoricalEvent>> {
    return this.request<ApiResponse<HistoricalEvent>>('/historical-events', 'POST', eventData);
  }

  /**
   * Implementation of abstract request method for mobile platforms
   */
  protected async request<T>(
    path: string,
    method: string,
    data?: any,
    headers: Record<string, string> = {}
  ): Promise<T> {
    // Prepare URL
    const url = `${this.config.baseUrl}${path}`;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    // Add auth token if available
    if (this.authToken) {
      requestHeaders.Authorization = `Bearer ${this.authToken}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      // Make fetch request
      const response = await fetch(url, requestOptions);

      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        let errorJson;

        try {
          errorJson = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        throw new Error(
          errorJson.message || `API Error: ${response.status} ${response.statusText}`
        );
      }

      // Return JSON response or empty object for 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Get cards by category (convenience method)
   */
  async getCardsByCategory(category: string): Promise<ApiResponse<Card>> {
    return this.getCards({ category });
  }

  /**
   * Search historical events
   */
  async searchHistoricalEvents(
    query: string,
    page?: number,
    limit?: number
  ): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);

    if (page !== undefined) queryParams.append('page', String(page));
    if (limit !== undefined) queryParams.append('limit', String(limit));

    const queryString = queryParams.toString();
    const endpoint = `/historical-events/search?${queryString}`;

    return this.request<EventsResponse>(endpoint, 'GET');
  }

  /**
   * Get historical events by category name
   */
  async getHistoricalEventsByCategoryName(
    categoryName: string,
    page?: number,
    limit?: number
  ): Promise<EventsResponse> {
    return this.getHistoricalEventsByCategory(categoryName, page, limit);
  }

  /**
   * Get historical events by period
   */
  async getHistoricalEventsByPeriod(
    startYear: number,
    endYear: number,
    page?: number,
    limit?: number
  ): Promise<EventsResponse> {
    return this.getHistoricalEventsByTimePeriod(startYear, endYear, page, limit);
  }

  /**
   * Mobile-specific implementation for profile picture upload
   * Uses FormData for mobile file uploads
   */
  async uploadProfilePicture(fileUri: string): Promise<{ url: string }> {
    const formData = new FormData();

    // Create a file object from the URI
    // The exact implementation depends on the react-native version and file system
    // This example assumes a direct file URI that can be used
    const fileName = fileUri.split('/').pop() || 'photo.jpg';
    const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // @ts-ignore - React Native's FormData accepts objects with uri property
    formData.append('profilePicture', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    });

    // Make request with FormData
    const url = `${this.config.baseUrl}/users/profile-picture`;

    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Profile Picture Upload Error:', error);
      throw error;
    }
  }

  /**
   * Mobile-specific implementation for historical event image upload
   * Uses FormData for mobile file uploads
   */
  async uploadHistoricalEventImage(eventId: string, fileUri: string): Promise<{ url: string }> {
    const formData = new FormData();

    // Create a file object from the URI
    const fileName = fileUri.split('/').pop() || 'event-image.jpg';
    const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // @ts-ignore - React Native's FormData accepts objects with uri property
    formData.append('eventImage', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    });

    // Make request with FormData
    const url = `${this.config.baseUrl}/historical-events/${eventId}/image`;

    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Historical Event Image Upload Error:', error);
      throw error;
    }
  }

  /**
   * Refresh auth token
   */
  async refreshAuthToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await this.request<{ token: string; refreshToken: string }>(
      '/auth/refresh-token',
      'POST',
      { refreshToken }
    );

    if (response.token) {
      this.setTokens(response.token, response.refreshToken);
    }

    return response;
  }

  /**
   * Helper property to access the base URL directly
   */
  get baseUrl(): string {
    return this.config.baseUrl;
  }
}
