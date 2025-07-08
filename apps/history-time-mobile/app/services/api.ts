import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

import { generateUUID } from '../utils/uuid';

// Determine the API URL based on platform
// On iOS simulator & Android emulator, localhost/127.0.0.1 points to the device itself, not the host machine
// 10.0.2.2 is the special IP that Android emulator uses to connect to the host loopback interface (localhost)
// 10.0.3.2 is used for GenyMotion
// On iOS, we can use localhost in the simulator when we're serving via webpack-dev-server proxy
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api/v1'; // Android emulator
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:5001/api/v1'; // iOS simulator
  } else {
    return 'http://localhost:5001/api/v1'; // Web
  }
};

const API_URL = getApiBaseUrl();
console.log('Using API URL:', API_URL);

// Set to false to use the real backend
const USE_MOCK_API = false; // Using the real backend to fetch cards from database

// Import types from centralized types package
import type {
  Card,
  Game as GameResponse,
  EndGameResult,
  LeaderboardEntry,
  AuthResponse,
  ApiError as ApiErrorResponse
} from '@history-time/types';

// Re-export for backward compatibility
export type { 
  Card, 
  GameResponse, 
  EndGameResult, 
  LeaderboardEntry, 
  AuthResponse, 
  ApiErrorResponse 
};

// Mock data for development
const MOCK_CARDS: Record<string, Card[]> = {
  Science: [
    {
      id: '1',
      title: 'Discovery of Penicillin',
      date: '1928',
      description: 'Alexander Fleming discovers penicillin, the first antibiotic medication.',
      category: 'Science',
      imageUrl: 'https://picsum.photos/200/300?random=1',
    },
    {
      id: '2',
      title: 'Theory of Relativity Published',
      date: '1905',
      description: 'Albert Einstein publishes his theory of special relativity.',
      category: 'Science',
      imageUrl: 'https://picsum.photos/200/300?random=2',
    },
    {
      id: '3',
      title: 'Structure of DNA Discovered',
      date: '1953',
      description: 'James Watson and Francis Crick describe the structure of DNA.',
      category: 'Science',
      imageUrl: 'https://picsum.photos/200/300?random=3',
    },
    {
      id: '4',
      title: 'First Human in Space',
      date: '1961',
      description: 'Yuri Gagarin becomes the first human to journey into outer space.',
      category: 'Science',
      imageUrl: 'https://picsum.photos/200/300?random=4',
    },
    {
      id: '5',
      title: 'First Human on the Moon',
      date: '1969',
      description: 'Neil Armstrong becomes the first person to walk on the Moon.',
      category: 'Science',
      imageUrl: 'https://picsum.photos/200/300?random=5',
    },
  ],
  'Ancient History': [
    {
      id: '6',
      title: 'Construction of the Great Pyramid',
      date: '2560 BCE',
      description: 'The Great Pyramid of Giza is completed as a tomb for Pharaoh Khufu.',
      category: 'Ancient History',
      imageUrl: 'https://picsum.photos/200/300?random=6',
    },
    {
      id: '7',
      title: 'Founding of Rome',
      date: '753 BCE',
      description: 'According to legend, Romulus founds the city of Rome.',
      category: 'Ancient History',
      imageUrl: 'https://picsum.photos/200/300?random=7',
    },
    {
      id: '8',
      title: 'Battle of Marathon',
      date: '490 BCE',
      description: 'The Athenians defeat the first Persian invasion led by King Darius I.',
      category: 'Ancient History',
      imageUrl: 'https://picsum.photos/200/300?random=8',
    },
    {
      id: '9',
      title: 'Death of Alexander the Great',
      date: '323 BCE',
      description: 'Alexander the Great dies in Babylon, leading to the fracturing of his empire.',
      category: 'Ancient History',
      imageUrl: 'https://picsum.photos/200/300?random=9',
    },
    {
      id: '10',
      title: 'Julius Caesar Crosses the Rubicon',
      date: '49 BCE',
      description: 'Julius Caesar crosses the Rubicon river, precipitating the Roman Civil War.',
      category: 'Ancient History',
      imageUrl: 'https://picsum.photos/200/300?random=10',
    },
  ],
  'Modern History': [
    {
      id: '11',
      title: 'World War I Begins',
      date: '1914',
      description: 'Archduke Franz Ferdinand is assassinated, triggering World War I.',
      category: 'Modern History',
      imageUrl: 'https://picsum.photos/200/300?random=11',
    },
    {
      id: '12',
      title: 'The Great Depression Begins',
      date: '1929',
      description: 'The stock market crashes, initiating the Great Depression.',
      category: 'Modern History',
      imageUrl: 'https://picsum.photos/200/300?random=12',
    },
    {
      id: '13',
      title: 'World War II Ends',
      date: '1945',
      description: 'Japan surrenders after atomic bombings, ending World War II.',
      category: 'Modern History',
      imageUrl: 'https://picsum.photos/200/300?random=13',
    },
    {
      id: '14',
      title: 'Berlin Wall Falls',
      date: '1989',
      description: 'The Berlin Wall falls, symbolizing the end of the Cold War.',
      category: 'Modern History',
      imageUrl: 'https://picsum.photos/200/300?random=14',
    },
    {
      id: '15',
      title: '9/11 Terrorist Attacks',
      date: '2001',
      description: 'Terrorists hijack planes and attack the World Trade Center and Pentagon.',
      category: 'Modern History',
      imageUrl: 'https://picsum.photos/200/300?random=15',
    },
  ],
};

// Mock store for games
const MOCK_GAMES: Record<string, GameResponse> = {};

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Add token to request headers
apiClient.interceptors.request.use(
  async (request: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        request.headers = request.headers || {};
        request.headers.Authorization = `Bearer ${token}`;
      }
      return request;
    } catch (error) {
      console.error('Error adding auth token to request:', error);
      return request;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock API service implementation
class MockApiService {
  // Get all categories
  async getCategories(): Promise<string[]> {
    return Object.keys(MOCK_CARDS);
  }

  // Get all cards
  async getCards(): Promise<Card[]> {
    // Combine cards from all categories
    const allCards: Card[] = [];
    Object.keys(MOCK_CARDS).forEach((category) => {
      allCards.push(...MOCK_CARDS[category]);
    });
    return allCards;
  }

  // Get cards by category
  async getCardsByCategory(category: string): Promise<Card[]> {
    return MOCK_CARDS[category] || [];
  }

  // Get random cards
  async getRandomCards(category: string, count: number): Promise<Card[]> {
    const cards = MOCK_CARDS[category] || [];
    // Shuffle and take the first 'count' cards
    return [...cards].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Create a new game
  async createGame(category: string, difficulty: string): Promise<GameResponse> {
    const gameId = generateUUID();
    const cards = MOCK_CARDS[category] || [];

    // Shuffle and select 5 cards for the game
    const selectedCards = [...cards]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((card) => ({
        cardId: card.id,
        position: null,
      }));

    const game: GameResponse = {
      id: gameId,
      userId: 'user-1',
      category,
      difficulty,
      status: 'active',
      cards: selectedCards,
      score: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_GAMES[gameId] = game;
    return game;
  }

  // Get a specific game
  async getGame(gameId: string): Promise<GameResponse> {
    const game = MOCK_GAMES[gameId];
    if (!game) {
      throw new Error('Game not found');
    }
    return game;
  }

  // Get cards for a game
  async getGameCards(gameId: string): Promise<Card[]> {
    const game = MOCK_GAMES[gameId];
    if (!game) {
      throw new Error('Game not found');
    }

    // Map cardIds to actual Card objects from MOCK_CARDS
    return game.cards.map((gameCard) => {
      // Find the card in MOCK_CARDS across all categories
      for (const category in MOCK_CARDS) {
        const card = MOCK_CARDS[category].find((c) => c.id === gameCard.cardId);
        if (card) {
          return {
            ...card,
            position: gameCard.position,
          };
        }
      }
      // Return placeholder if card not found
      return {
        id: gameCard.cardId,
        title: 'Unknown Card',
        description: 'Card details not found',
        date: 'Unknown',
        year: 0,
        category: 'Unknown',
        difficulty: 'medium',
        position: gameCard.position,
      };
    });
  }

  // Update card placement
  async updateCardPlacement(
    gameId: string,
    cardId: string,
    position: number
  ): Promise<GameResponse> {
    const game = MOCK_GAMES[gameId];
    if (!game) {
      throw new Error('Game not found');
    }

    // Update the card position
    const updatedCards = game.cards.map((card) => {
      if (card.cardId === cardId) {
        return { ...card, position };
      }
      return card;
    });

    const updatedGame = {
      ...game,
      cards: updatedCards,
      updatedAt: new Date().toISOString(),
    };

    MOCK_GAMES[gameId] = updatedGame;
    return updatedGame;
  }

  // End a game
  async endGame(gameId: string): Promise<EndGameResult> {
    const game = MOCK_GAMES[gameId];
    if (!game) {
      throw new Error('Game not found');
    }

    // Count how many cards have been placed
    const placedCards = game.cards.filter((card) => card.position !== null);
    const totalCards = game.cards.length;

    // Calculate a score based on the difficulty
    let baseScore = 0;
    switch (game.difficulty) {
      case 'easy':
        baseScore = 100;
        break;
      case 'medium':
        baseScore = 200;
        break;
      case 'hard':
        baseScore = 300;
        break;
      case 'expert':
        baseScore = 400;
        break;
      default:
        baseScore = 100;
    }

    // In a real implementation, we would check if the cards are in the correct order
    // For mock purposes, let's say 70% of the placements are correct
    const correctPlacements = Math.ceil(placedCards.length * 0.7);

    // Calculate final score
    const score = Math.round(baseScore * (correctPlacements / totalCards));

    // Update game status
    const updatedGame = {
      ...game,
      status: 'completed',
      score,
      updatedAt: new Date().toISOString(),
    };

    MOCK_GAMES[gameId] = updatedGame;

    return {
      score,
      correctPlacements,
      totalCards,
      isWin: correctPlacements > totalCards / 2, // Win if more than half are correct
    };
  }

  // Abandon a game
  async abandonGame(gameId: string): Promise<{ success: boolean }> {
    const game = MOCK_GAMES[gameId];
    if (!game) {
      throw new Error('Game not found');
    }

    // Update game status
    const updatedGame = {
      ...game,
      status: 'abandoned',
      updatedAt: new Date().toISOString(),
    };

    MOCK_GAMES[gameId] = updatedGame;
    return { success: true };
  }

  // Get leaderboard
  async getLeaderboard(category?: string, timeframe?: string): Promise<LeaderboardEntry[]> {
    await this.simulateNetworkDelay();

    // Generate mock leaderboard data
    return Array.from({ length: 10 }, (_, i) => ({
      userId: {
        _id: `user-${i + 1}`,
        name: `Player ${i + 1}`,
      },
      score: 1000 - i * 50,
      correctPlacements: 10 - Math.floor(i / 3),
      totalCards: 10,
      totalTimeTaken: 300 + i * 20,
      difficulty: i < 3 ? 'hard' : i < 7 ? 'medium' : 'easy',
      date: new Date(Date.now() - i * 86400000).toISOString(),
      rank: i + 1,
    }));
  }

  // User login
  async login(email: string, password: string): Promise<AuthResponse> {
    // Mock successful login
    return {
      user: {
        id: 'user-1',
        username: 'TestUser',
        email,
      },
      tokens: {
        access: {
          token: 'mock-access-token',
          expires: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
        },
        refresh: {
          token: 'mock-refresh-token',
          expires: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
        },
      },
    };
  }

  // User logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('userToken');
  }

  // User registration
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    return this.login(email, password); // Reuse login for simplicity
  }

  // Get user profile
  async getUserProfile(): Promise<any> {
    return {
      id: 'user-1',
      username: 'TestUser',
      email: 'test@example.com',
      stats: {
        gamesPlayed: 25,
        gamesWon: 18,
        totalScore: 3500,
      },
      preferences: {
        theme: 'dark',
        notifications: true,
      },
    };
  }

  // Update user profile
  async updateUserProfile(profileData: any): Promise<any> {
    return {
      ...this.getUserProfile(),
      ...profileData,
    };
  }

  // Get image for a historical event
  async getEventImage(eventTitle: string): Promise<{ url: string; cached: boolean }> {
    // Fallback to placeholder images for mock mode
    return {
      url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(eventTitle)}`,
      cached: false,
    };
  }

  // Search for images related to a query
  async searchImages(query: string, limit = 5): Promise<Array<any>> {
    // Return placeholder images in mock mode
    return Array(limit)
      .fill(null)
      .map((_, index) => ({
        id: `placeholder-${index}`,
        title: query,
        url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(query + ' ' + index)}`,
        source: 'placeholder',
      }));
  }

  private async simulateNetworkDelay() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// API service class
class ApiService {
  private mockService: MockApiService;

  constructor() {
    this.mockService = new MockApiService();
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    if (USE_MOCK_API) {
      return this.mockService.getCategories();
    }

    try {
      const response = await apiClient.get<string[]>('/cards/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get all cards
  async getCards(): Promise<Card[]> {
    if (USE_MOCK_API) {
      return this.mockService.getCards();
    }

    try {
      // Use any type to handle various response formats
      const response = await apiClient.get<any>('/cards');
      const data = response.data;

      // Handle paginated response format from the backend
      if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
        console.log(`Found ${data.results.length} cards in total`);
        return data.results;
      } else if (Array.isArray(data)) {
        // Handle direct array response format
        console.log(`Found ${data.length} cards in total`);
        return data;
      } else {
        console.warn('Unexpected cards response format:', data);
        return [];
      }
    } catch (error) {
      console.error(
        'Error fetching cards:',
        error instanceof Error ? error.message : String(error)
      );
      return [];
    }
  }

  // Get cards by category
  async getCardsByCategory(category: string): Promise<Card[]> {
    if (USE_MOCK_API) {
      return this.mockService.getCardsByCategory(category);
    }

    try {
      // Use any type to handle various response formats
      const response = await apiClient.get<any>(`/cards?category=${category}`);
      const data = response.data;

      // Handle paginated response format from the backend
      if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
        console.log(`Found ${data.results.length} cards in category ${category}`);
        return data.results;
      } else if (Array.isArray(data)) {
        // Handle direct array response format
        console.log(`Found ${data.length} cards in category ${category}`);
        return data;
      } else {
        console.warn('Unexpected cards response format:', data);
        return [];
      }
    } catch (error) {
      console.error(
        'Error fetching cards by category:',
        error instanceof Error ? error.message : String(error)
      );
      return [];
    }
  }

  // Get random cards
  async getRandomCards(category: string, count: number): Promise<Card[]> {
    if (USE_MOCK_API) {
      return this.mockService.getRandomCards(category, count);
    }

    try {
      // Use any type to handle various response formats
      const response = await apiClient.get<any>('/cards/random', {
        params: { category, count },
      });
      const data = response.data;

      // Handle paginated response format from the backend
      if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
        console.log(`Found ${data.results.length} random cards in category ${category}`);
        return data.results;
      } else if (Array.isArray(data)) {
        // Handle direct array response format
        console.log(`Found ${data.length} random cards in category ${category}`);
        return data;
      } else {
        console.warn('Unexpected random cards response format:', data);
        return [];
      }
    } catch (error) {
      console.error(
        'Error fetching random cards:',
        error instanceof Error ? error.message : String(error)
      );
      return [];
    }
  }

  // Create a new game
  async createGame(category: string | null, difficulty: string): Promise<GameResponse> {
    if (USE_MOCK_API) {
      return this.mockService.createGame(category || '', difficulty);
    }

    try {
      // Backend API only accepts 'difficulty' parameter, not 'category'
      const payload: { difficulty: string } = {
        difficulty,
      };

      // Log the actual parameters being sent
      console.log('Creating game with payload:', payload);

      const response = await apiClient.post<GameResponse>('/games', payload);
      console.log('Game created successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating game:', error instanceof Error ? error.message : String(error));

      // Add specific error handling for parameter issues
      // Need to type check error before accessing properties
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 400
      ) {
        console.warn('API validation error - trying alternate payload format');
        try {
          // Try with just difficulty as a fallback
          const simplePayload = { difficulty };
          const retryResponse = await apiClient.post<GameResponse>('/games', simplePayload);
          console.log('Game created successfully with simplified payload:', retryResponse.data);
          return retryResponse.data;
        } catch (retryError) {
          console.error(
            'Retry also failed:',
            retryError instanceof Error ? retryError.message : String(retryError)
          );
          throw retryError;
        }
      }

      throw error;
    }
  }

  // Get a specific game
  async getGame(gameId: string): Promise<GameResponse> {
    if (USE_MOCK_API) {
      return this.mockService.getGame(gameId);
    }

    try {
      const response = await apiClient.get<GameResponse>(`/games/${gameId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching game:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch game');
    }
  }

  // Get cards for a game
  async getGameCards(gameId: string): Promise<Card[]> {
    if (USE_MOCK_API) {
      return this.mockService.getGameCards(gameId);
    }

    try {
      // Use any to handle potential format differences
      const response = await apiClient.get<any>(`/games/${gameId}`);
      const game = response.data;

      // Enhanced logging to diagnose card data format
      console.log(
        `Game data fetched for ID ${gameId}:`,
        JSON.stringify({
          hasCards: !!game.cards,
          cardType: game.cards ? typeof game.cards : 'undefined',
          isArray: game.cards ? Array.isArray(game.cards) : false,
          cardCount: game.cards && Array.isArray(game.cards) ? game.cards.length : 0,
        })
      );

      if (game.cards && Array.isArray(game.cards)) {
        if (game.cards.length > 0) {
          console.log('First card structure:', Object.keys(game.cards[0]));
        }
        return game.cards;
      } else {
        console.warn('No cards found in game or unexpected format');
        return [];
      }
    } catch (error) {
      console.error(
        'Error fetching game cards:',
        error instanceof Error ? error.message : String(error)
      );
      return [];
    }
  }

  // Update card placement
  async updateCardPlacement(
    gameId: string,
    cardId: string,
    position: number
  ): Promise<GameResponse> {
    if (USE_MOCK_API) {
      return this.mockService.updateCardPlacement(gameId, cardId, position);
    }

    try {
      // Backend expects PATCH /games/:gameId with cardPlacement object
      const response = await apiClient.patch<GameResponse>(`/games/${gameId}`, {
        cardPlacement: {
          cardId,
          placementPosition: position,
          timeTaken: 0, // TODO: Track actual time taken
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating card placement:', error);
      throw new Error(error.response?.data?.message || 'Failed to update card placement');
    }
  }

  // End a game
  async endGame(gameId: string): Promise<EndGameResult> {
    if (USE_MOCK_API) {
      return this.mockService.endGame(gameId);
    }

    try {
      // Backend expects POST /games/:gameId/end
      const response = await apiClient.post<EndGameResult>(`/games/${gameId}/end`);
      return response.data;
    } catch (error: any) {
      console.error('Error ending game:', error);
      throw new Error(error.response?.data?.message || 'Failed to end game');
    }
  }

  // Abandon a game
  async abandonGame(gameId: string): Promise<{ success: boolean }> {
    if (USE_MOCK_API) {
      return this.mockService.abandonGame(gameId);
    }

    try {
      // Backend expects POST /games/:gameId/abandon
      const response = await apiClient.post<{ success: boolean }>(`/games/${gameId}/abandon`);
      return response.data;
    } catch (error: any) {
      console.error('Error abandoning game:', error);
      throw new Error(error.response?.data?.message || 'Failed to abandon game');
    }
  }

  // Get leaderboard
  async getLeaderboard(category?: string, timeframe?: string): Promise<LeaderboardEntry[]> {
    if (USE_MOCK_API) {
      return this.mockService.getLeaderboard(category, timeframe);
    }

    try {
      const response = await apiClient.get<LeaderboardEntry[]>('/leaderboard', {
        params: { category, timeframe },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }

  // User login
  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return this.mockService.login(email, password);
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      await AsyncStorage.setItem('userToken', response.data.tokens.access.token);
      return response.data;
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  }

  // Get image for a historical event
  async getEventImage(eventTitle: string): Promise<{ url: string; cached: boolean }> {
    if (USE_MOCK_API) {
      // Fallback to placeholder images for mock mode
      return {
        url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(eventTitle)}`,
        cached: false,
      };
    }

    try {
      const response = await apiClient.get<{ url: string; cached: boolean }>(
        `/images/event/${encodeURIComponent(eventTitle)}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching event image:', error);
      // Fallback to placeholder
      return {
        url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(eventTitle)}`,
        cached: false,
      };
    }
  }

  // Search for images related to a query
  async searchImages(query: string, limit = 5): Promise<Array<any>> {
    if (USE_MOCK_API) {
      // Return placeholder images in mock mode
      return Array(limit)
        .fill(null)
        .map((_, index) => ({
          id: `placeholder-${index}`,
          title: query,
          url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(
            query + ' ' + index
          )}`,
          source: 'placeholder',
        }));
    }

    try {
      const response = await apiClient.get<{ results: Array<any> }>('/images', {
        params: { query, limit },
      });
      return response.data.results;
    } catch (error: any) {
      console.error('Error searching images:', error);
      return [];
    }
  }

  // User logout
  async logout(): Promise<void> {
    if (USE_MOCK_API) {
      return this.mockService.logout();
    }

    try {
      await apiClient.post('/auth/logout');
      await AsyncStorage.removeItem('userToken');
    } catch (error: any) {
      console.error('Error logging out:', error);
      throw new Error(error.response?.data?.message || 'Failed to logout');
    }
  }
}

export const apiService = new ApiService();
