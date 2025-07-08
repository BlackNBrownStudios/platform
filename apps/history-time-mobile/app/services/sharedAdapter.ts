/**
 * SharedAdapter for Mobile
 * This serves as a bridge between the shared hooks and the mobile-specific API implementation
 */
import React, { useContext, useMemo, useEffect, useState } from 'react';

// Import types from local shared directory
import type {
  Game,
  User,
  Card,
  LeaderboardEntry,
  UserStats,
  ApiResponse,
  AuthResponse,
  HistoricalEvent,
  EventFilters,
  EventsResponse,
} from '../shared/types';

// Define SharedAdapter interface for use in this file
interface SharedAdapter {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (username: string, email: string, password: string) => Promise<AuthResponse>;
  getUserProfile: () => Promise<User>;
  updateUserProfile: (data: Partial<User>) => Promise<User>;
  uploadProfilePicture: (uri: string) => Promise<{ url: string }>;
  getUserStats: (userId: string) => Promise<UserStats>;
  getCards: (params?: {
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) => Promise<Card[]>;
  getCardsByCategory: (category: string) => Promise<Card[]>;
  getCategories: () => Promise<string[]>;
  getRandomCards: (params: {
    category?: string;
    difficulty?: string;
    count?: number;
  }) => Promise<Card[]>;
  createGame: (params: {
    difficulty: string;
    cardCount?: number;
    categories?: string[];
  }) => Promise<Game>;
  getGame: (gameId: string) => Promise<Game>;
  updateCardPlacement: (
    gameId: string,
    cardId: string,
    position: number,
    timeTaken: number
  ) => Promise<Game>;
  endGame: (gameId: string) => Promise<Game>;
  abandonGame: (gameId: string) => Promise<Game>;
  getLeaderboard: (params?: {
    timeFrame?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    category?: string;
    difficulty?: string;
    limit?: number;
  }) => Promise<LeaderboardEntry[]>;
  getHistoricalEvents: (filters?: EventFilters) => Promise<HistoricalEvent[]>;
  getHistoricalEventById: (id: string) => Promise<HistoricalEvent>;
  getHistoricalEventsByCategory: (category: string) => Promise<HistoricalEvent[]>;
  getHistoricalEventsByTimePeriod: (
    startYear: number,
    endYear: number
  ) => Promise<HistoricalEvent[]>;
  getHistoricalEventCategories: () => Promise<string[]>;
  getHistoricalEventYearRange: () => Promise<[number, number]>;
  getRandomHistoricalEvents: (params: {
    count?: number;
    categories?: string[];
    difficulty?: string;
  }) => Promise<HistoricalEvent[]>;
  submitHistoricalEvent: (event: Partial<HistoricalEvent>) => Promise<HistoricalEvent>;
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { configService, CONFIG_KEYS } from './configService';
import { mockHistoricalEventsService } from './mockHistoricalEvents';

// Create a context for the API in this file since imports are failing
const ApiContext = React.createContext<SharedAdapter | null>(null);
export { ApiContext };

// Define token storage functions here
const storeToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem('userToken', token);
};

const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('userToken');
};

const storeRefreshToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem('refreshToken', token);
};

const getRefreshToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('refreshToken');
};

const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('userData');
};

// Get API URL from environment variables
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';

/**
 * Create a shared adapter instance for mobile
 */
export const createSharedAdapter = (): SharedAdapter => {
  // Initialize the API service
  const api = {
    async login(email: string, password: string): Promise<AuthResponse> {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error(`Login failed: ${response.status} ${await response.text()}`);
        }

        return response.json();
      } catch (error) {
        console.error('Error logging in:', error);
        throw error;
      }
    },

    async register(username: string, email: string, password: string): Promise<AuthResponse> {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
          throw new Error(`Registration failed: ${response.status} ${await response.text()}`);
        }

        return response.json();
      } catch (error) {
        console.error('Error registering:', error);
        throw error;
      }
    },

    async getUserProfile(): Promise<User> {
      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/users/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to get user profile: ${response.status}`);
        }

        return response.json();
      } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
      }
    },

    async updateUserProfile(data: Partial<User>): Promise<User> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async uploadProfilePicture(uri: string): Promise<string> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/users/me/picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uri,
      });
      return response.json();
    },

    async getUserGameStats(userId: string): Promise<UserStats> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/users/${userId}/stats`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getCards(params?: {
      category?: string;
      difficulty?: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<Card>> {
      try {
        const token = await getToken();
        let url = `${API_URL}/cards`;

        // Add query parameters if provided
        if (params) {
          const queryParams = [];
          if (params.category) queryParams.push(`category=${encodeURIComponent(params.category)}`);
          if (params.difficulty)
            queryParams.push(`difficulty=${encodeURIComponent(params.difficulty)}`);
          if (params.page) queryParams.push(`page=${params.page}`);
          if (params.limit) queryParams.push(`limit=${params.limit}`);

          if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`;
          }
        }

        console.log('Fetching cards from URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching cards: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Cards API response:', data);

        // Handle both direct array responses and paginated responses with results key
        if (Array.isArray(data)) {
          return { results: data };
        } else if (data.results && Array.isArray(data.results)) {
          return data;
        } else {
          console.warn('Unexpected cards API response format:', data);
          return { results: [] };
        }
      } catch (error) {
        console.error('Error in getCards:', error);
        return { results: [] };
      }
    },

    async getCardsByCategory(category: string): Promise<ApiResponse<Card>> {
      try {
        const token = await getToken();
        // Properly encode the category in the URL
        const url = `${API_URL}/cards?category=${encodeURIComponent(category)}`;

        console.log(`Fetching cards by category from URL: ${url}`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        console.log(
          `Category ${category} data received:`,
          typeof data,
          Array.isArray(data) ? 'array' : 'object'
        );

        // Handle paginated response format
        if (data && typeof data === 'object' && 'results' in data) {
          return data;
        } else if (Array.isArray(data)) {
          // If the API returns an array directly, wrap it in the expected format
          return {
            results: data,
            page: 1,
            limit: data.length,
            totalPages: 1,
            totalResults: data.length,
          };
        } else {
          console.warn('Unexpected category card data format:', data);
          return { results: [], page: 1, limit: 0, totalPages: 0, totalResults: 0 };
        }
      } catch (error) {
        console.error(`Error in getCardsByCategory (${category}):`, error);
        return { results: [], page: 1, limit: 0, totalPages: 0, totalResults: 0 };
      }
    },

    async getCategories(): Promise<string[]> {
      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/categories`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API error ${response.status}: ${await response.text()}`);
        }

        return response.json();
      } catch (error) {
        console.error('Error in getCategories:', error);
        return [];
      }
    },

    async getRandomCards(params: {
      category?: string;
      difficulty?: string;
      count?: number;
    }): Promise<Card[]> {
      const token = await getToken();
      let url = `${API_URL}/cards/random`;
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.difficulty) queryParams.append('difficulty', params.difficulty);
      if (params.count) queryParams.append('count', params.count.toString());
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async createGame(params: {
      difficulty: string;
      cardCount?: number;
      categories?: string[];
    }): Promise<Game> {
      try {
        const token = await getToken();

        // The backend only accepts 'difficulty' parameter
        const payload = {
          difficulty: params.difficulty,
        };

        console.log(`Creating game with payload:`, payload);

        const response = await fetch(`${API_URL}/games`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Game creation API error ${response.status}: ${await response.text()}`);
        }

        const game = await response.json();
        console.log('Game created successfully:', game);
        return game;
      } catch (error) {
        console.error('Error in createGame:', error);
        throw error; // Re-throw so the UI can handle the error
      }
    },

    async getGame(gameId: string): Promise<Game> {
      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/games/${gameId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API error ${response.status}: ${await response.text()}`);
        }

        const game = await response.json();
        console.log('Game data fetched:', game);
        return game;
      } catch (error) {
        console.error(`Error in getGame (${gameId}):`, error);
        throw error;
      }
    },

    async updateCardPlacement(
      gameId: string,
      cardId: string,
      position: number,
      timeTaken: number
    ): Promise<Game> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/games/${gameId}/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ position, timeTaken }),
      });
      return response.json();
    },

    async endGame(gameId: string): Promise<Game> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/games/${gameId}/end`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async abandonGame(gameId: string): Promise<Game> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/games/${gameId}/abandon`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getLeaderboard(params?: {
      timeFrame?: 'daily' | 'weekly' | 'monthly' | 'all_time';
      category?: string;
      difficulty?: string;
      limit?: number;
    }): Promise<LeaderboardEntry[]> {
      const token = await getToken();
      let url = `${API_URL}/leaderboard`;
      const queryParams = new URLSearchParams();
      if (params?.timeFrame) queryParams.append('timeFrame', params.timeFrame);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getHistoricalEvents(filters?: EventFilters): Promise<EventsResponse> {
      const token = await getToken();
      let url = `${API_URL}/historical-events`;
      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.startYear) queryParams.append('startYear', filters.startYear.toString());
      if (filters?.endYear) queryParams.append('endYear', filters.endYear.toString());
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getHistoricalEventById(id: string): Promise<HistoricalEvent> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/historical-events/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getHistoricalEventsByCategory(category: string): Promise<EventsResponse> {
      const token = await getToken();
      const url = `${API_URL}/historical-events?category=${encodeURIComponent(category)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getHistoricalEventsByTimePeriod(
      startYear: number,
      endYear: number
    ): Promise<EventsResponse> {
      const token = await getToken();
      const url = `${API_URL}/historical-events?startYear=${startYear}&endYear=${endYear}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getHistoricalEventCategories(): Promise<string[]> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/historical-events/categories`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getHistoricalEventYearRange(): Promise<[number, number]> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/historical-events/year-range`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getRandomHistoricalEvents(params: {
      count?: number;
      categories?: string[];
      difficulty?: string;
    }): Promise<HistoricalEvent[]> {
      try {
        const token = await getToken();
        let url = `${API_URL}/historical-events/random`;

        // Build query string from params
        const queryParams = [];
        if (params.count) queryParams.push(`count=${params.count}`);
        if (params.difficulty)
          queryParams.push(`difficulty=${encodeURIComponent(params.difficulty)}`);
        if (params.categories && params.categories.length > 0) {
          // Handle array of categories
          params.categories.forEach((category) => {
            queryParams.push(`categories=${encodeURIComponent(category)}`);
          });
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join('&')}`;
        }

        console.log('Fetching random historical events from URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching random historical events: ${response.status}`);
        }

        const data = await response.json();
        console.log('Random historical events response:', data);

        // Handle both direct array and paginated responses
        if (Array.isArray(data)) {
          return data;
        } else if (data.results && Array.isArray(data.results)) {
          return data.results;
        } else {
          console.warn('Unexpected response format for random historical events:', data);
          return [];
        }
      } catch (error) {
        console.error('Error fetching random historical events:', error);
        return [];
      }
    },

    async submitHistoricalEvent(event: Partial<HistoricalEvent>): Promise<HistoricalEvent> {
      const token = await getToken();
      const response = await fetch(`${API_URL}/historical-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      });
      return response.json();
    },
  };

  // Initialize configuration service
  configService.init().catch((error) => {
    console.error('Failed to initialize configuration service:', error);
  });

  return {
    api,

    // Config methods
    async useMockHistoricalEvents() {
      return configService.useMockHistoricalEvents();
    },

    async toggleMockHistoricalEvents() {
      return configService.toggleMockHistoricalEvents();
    },

    // Auth methods
    async login(email: string, password: string) {
      try {
        const response = await api.login(email, password);
        console.log('Login response:', JSON.stringify(response, null, 2));

        if (response.tokens?.access?.token) {
          await storeToken(response.tokens.access.token);

          if (response.tokens?.refresh?.token) {
            await storeRefreshToken(response.tokens.refresh.token);
          }
        }

        // Create a valid AuthResponse with required fields
        const authResponse = {
          tokens: {
            access: {
              token: response.tokens?.access?.token || '',
              expires:
                response.tokens?.access?.expires || new Date(Date.now() + 86400000).toISOString(), // Default 24h
            },
            refresh: {
              token: response.tokens?.refresh?.token || '',
              expires:
                response.tokens?.refresh?.expires || new Date(Date.now() + 604800000).toISOString(), // Default 7d
            },
          },
          user: response.user,
        };

        return authResponse;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    async register(username: string, email: string, password: string) {
      try {
        const response = await api.register(username, email, password);
        console.log('Register response:', JSON.stringify(response, null, 2));

        if (response.tokens?.access?.token) {
          await storeToken(response.tokens.access.token);

          if (response.tokens?.refresh?.token) {
            await storeRefreshToken(response.tokens.refresh.token);
          }
        }

        // Create a valid AuthResponse with required fields
        const authResponse = {
          tokens: {
            access: {
              token: response.tokens?.access?.token || '',
              expires:
                response.tokens?.access?.expires || new Date(Date.now() + 86400000).toISOString(), // Default 24h
            },
            refresh: {
              token: response.tokens?.refresh?.token || '',
              expires:
                response.tokens?.refresh?.expires || new Date(Date.now() + 604800000).toISOString(), // Default 7d
            },
          },
          user: response.user,
        };

        return authResponse;
      } catch (error) {
        console.error('Register error:', error);
        throw error;
      }
    },

    async logout() {
      await removeToken();
    },

    async isAuthenticated() {
      const token = await getToken();
      return !!token;
    },

    // Profile methods
    async getUserProfile() {
      return api.getUserProfile();
    },

    async updateUserProfile(data) {
      return api.updateUserProfile(data);
    },

    async uploadProfilePicture(uri: string) {
      try {
        const result = await api.uploadProfilePicture(uri);
        // Handle both string and object response formats
        if (typeof result === 'string') {
          return { url: result };
        } else if (result && typeof result === 'object' && 'url' in result) {
          return result;
        } else {
          console.warn('Unexpected profile picture upload response format:', result);
          return { url: '' };
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        return { url: '' };
      }
    },

    async getUserStats(userId) {
      return api.getUserGameStats(userId);
    },

    // Card methods
    async getCards(params) {
      try {
        const response = await api.getCards(params);
        // Extract the results array from the paginated response
        if (response && response.results && Array.isArray(response.results)) {
          return response.results;
        }
        return [];
      } catch (error) {
        console.error('Error in getCards adapter method:', error);
        return [];
      }
    },

    async getCardsByCategory(category) {
      try {
        // First try to get cards using direct category filter API
        try {
          console.log(`Trying to get cards by category: ${category}`);
          const response = await api.getCardsByCategory(category);
          // Extract the results array from the paginated response
          if (response && response.results && Array.isArray(response.results)) {
            console.log(`Success! Found ${response.results.length} cards in category: ${category}`);
            return response.results;
          }
        } catch (categoryError) {
          console.log(
            `Direct category API failed, trying fallback with main getCards: ${categoryError.message}`
          );
        }

        // If that fails, try using the main getCards endpoint with category filter
        console.log(`Trying fallback method with getCards and category parameter: ${category}`);
        const fallbackResponse = await api.getCards({ category });
        if (
          fallbackResponse &&
          fallbackResponse.results &&
          Array.isArray(fallbackResponse.results)
        ) {
          console.log(
            `Success with fallback! Found ${fallbackResponse.results.length} cards in category: ${category}`
          );
          return fallbackResponse.results;
        }

        console.log(`No cards found for category: ${category}, returning empty array`);
        return [];
      } catch (error) {
        console.error(
          `Error in getCardsByCategory adapter method for category ${category}:`,
          error
        );
        return [];
      }
    },

    async getCategories() {
      return api.getCategories();
    },

    async getRandomCards(params) {
      return api.getRandomCards(params);
    },

    // Game methods
    async createGame(params) {
      try {
        console.log('Creating game with params:', JSON.stringify(params));

        // Extract just the difficulty, which is what the backend requires
        const simplifiedParams = {
          difficulty: params.difficulty || 'medium',
        };

        // Log the simplified parameters
        console.log('Using simplified params for game creation:', JSON.stringify(simplifiedParams));

        const game = await api.createGame(
          params.categories?.[0] || null,
          params.difficulty || 'medium'
        );
        console.log('Game created response:', JSON.stringify(game));

        // Ensure cards have string IDs
        if (game && game.cards) {
          game.cards = game.cards.map((card) => {
            // Make sure cardId is always a string to prevent id.substring errors
            if (card.cardId && typeof card.cardId !== 'string') {
              console.log('Converting non-string cardId to string:', card.cardId);
              return {
                ...card,
                cardId: String(card.cardId),
              };
            }
            return card;
          });
        }

        return game;
      } catch (error) {
        console.error('Error creating game:', error);
        throw error;
      }
    },

    async getGame(gameId) {
      return api.getGame(gameId);
    },

    async updateCardPlacement(gameId, cardId, position, timeTaken) {
      return api.updateCardPlacement(gameId, cardId, position, timeTaken);
    },

    async endGame(gameId) {
      return api.endGame(gameId);
    },

    async abandonGame(gameId) {
      return api.abandonGame(gameId);
    },

    // Leaderboard methods
    async getLeaderboard(params) {
      return api.getLeaderboard(params);
    },

    // Historical Events methods
    async getHistoricalEvents(filters) {
      const useMock = await configService.useMockHistoricalEvents();

      if (useMock) {
        return mockHistoricalEventsService.getHistoricalEvents(filters);
      }

      try {
        const response = await api.getHistoricalEvents(filters);
        // Extract the results array from the paginated response
        if (response && response.results && Array.isArray(response.results)) {
          console.log(`Retrieved ${response.results.length} historical events`);
          return response.results;
        } else if (Array.isArray(response)) {
          return response;
        }
        console.warn('Unexpected historical events response format:', response);
        return [];
      } catch (error) {
        console.error('Error in getHistoricalEvents adapter method:', error);
        return [];
      }
    },

    async getHistoricalEventById(id) {
      const useMock = await configService.useMockHistoricalEvents();

      if (useMock) {
        return mockHistoricalEventsService.getHistoricalEventById(id);
      }

      try {
        const event = await api.getHistoricalEventById(id);
        console.log(`Retrieved historical event with id ${id}:`, event?.title || 'Unknown');
        return event;
      } catch (error) {
        console.error(`Error retrieving historical event with id ${id}:`, error);
        return null; // Return null instead of throwing to be consistent with other methods
      }
    },

    async getHistoricalEventsByCategory(category) {
      const useMock = await configService.useMockHistoricalEvents();

      if (useMock) {
        return mockHistoricalEventsService.getHistoricalEventsByCategory(category);
      }

      try {
        const response = await api.getHistoricalEventsByCategory(category);
        // Extract the results array from the paginated response
        if (response && response.results && Array.isArray(response.results)) {
          console.log(
            `Retrieved ${response.results.length} historical events for category: ${category}`
          );
          return response.results;
        } else if (Array.isArray(response)) {
          return response;
        }
        console.warn(
          `Unexpected historical events by category response format for ${category}:`,
          response
        );
        return [];
      } catch (error) {
        console.error(`Error in getHistoricalEventsByCategory for ${category}:`, error);
        return [];
      }
    },

    async getHistoricalEventsByTimePeriod(startYear, endYear) {
      const useMock = await configService.useMockHistoricalEvents();

      if (useMock) {
        return mockHistoricalEventsService.getHistoricalEventsByTimePeriod(startYear, endYear);
      }

      try {
        const response = await api.getHistoricalEventsByTimePeriod(startYear, endYear);
        // Extract the results array from the paginated response
        if (response && response.results && Array.isArray(response.results)) {
          console.log(
            `Retrieved ${response.results.length} historical events for time period ${startYear}-${endYear}`
          );
          return response.results;
        } else if (Array.isArray(response)) {
          return response;
        }
        console.warn(
          `Unexpected historical events by time period response format for ${startYear}-${endYear}:`,
          response
        );
        return [];
      } catch (error) {
        console.error(
          `Error in getHistoricalEventsByTimePeriod for ${startYear}-${endYear}:`,
          error
        );
        return [];
      }
    },

    async getHistoricalEventCategories() {
      const useMock = await configService.useMockHistoricalEvents();

      if (useMock) {
        return mockHistoricalEventsService.getHistoricalEventCategories();
      }

      return api.getHistoricalEventCategories();
    },

    async getHistoricalEventYearRange() {
      const useMock = await configService.useMockHistoricalEvents();

      if (useMock) {
        return mockHistoricalEventsService.getHistoricalEventYearRange();
      }

      return api.getHistoricalEventYearRange();
    },

    async getRandomHistoricalEvents(count = 5) {
      const useMock = await configService.useMockHistoricalEvents();

      if (useMock) {
        return mockHistoricalEventsService.getRandomHistoricalEvents(count);
      }

      try {
        const response = await api.getRandomHistoricalEvents(count);
        // Extract the results array from the paginated response
        if (response && response.results && Array.isArray(response.results)) {
          console.log(`Retrieved ${response.results.length} random historical events`);
          return response.results;
        } else if (Array.isArray(response)) {
          return response;
        }
        console.warn('Unexpected random historical events response format:', response);
        return [];
      } catch (error) {
        console.error(`Error in getRandomHistoricalEvents(${count}):`, error);
        return [];
      }
    },

    async submitHistoricalEvent(event) {
      const useMock = await configService.useMockHistoricalEvents();

      if (useMock) {
        return mockHistoricalEventsService.submitHistoricalEvent(event);
      }

      return api.submitHistoricalEvent(event);
    },
  };
};

/**
 * Create an API provider component
 */
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adapter = useMemo(() => createSharedAdapter(), []);

  return React.createElement(ApiContext.Provider, { value: adapter }, children);
};

/**
 * Custom hook to use the shared adapter
 */
export const useSharedAdapter = (): SharedAdapter => {
  const apiContext = useContext(ApiContext);

  if (!apiContext) {
    throw new Error('useSharedAdapter must be used within an ApiProvider');
  }

  return apiContext;
};
