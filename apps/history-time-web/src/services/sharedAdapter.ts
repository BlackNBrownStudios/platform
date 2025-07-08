/**
 * Simplified shared adapter service during monorepo migration
 */
import { HistoricalEvent } from '@history-time/data-access';

// Temporary auth storage functions
export const getAuthStorage = () => ({
  token: null,
  user: null,
});

export const setAuthStorage = (data: any) => {
  console.log('Auth storage set temporarily disabled during migration', data);
};

export const clearAuthStorage = () => {
  console.log('Auth storage clear temporarily disabled during migration');
};

// Simplified shared API service
export const sharedApiService = {
  // Auth methods
  login: async (credentials: any) => {
    console.log('Login temporarily disabled during migration', credentials);
    return { user: null, token: null };
  },

  logout: async () => {
    console.log('Logout temporarily disabled during migration');
  },

  register: async (userData: any) => {
    console.log('Register temporarily disabled during migration', userData);
    return { user: null, token: null };
  },

  // Profile methods
  getUserProfile: async () => {
    console.log('Get user profile temporarily disabled during migration');
    return null;
  },

  updateUserProfile: async (data: any) => {
    console.log('Update user profile temporarily disabled during migration', data);
    return null;
  },

  // Game methods
  createGame: async (data: any) => {
    console.log('Create game temporarily disabled during migration', data);
    return null;
  },

  getGame: async (id: string) => {
    console.log('Get game temporarily disabled during migration', id);
    return null;
  },

  updateCardPlacement: async (gameId: string, data: any) => {
    console.log('Update card placement temporarily disabled during migration', gameId, data);
    return null;
  },

  endGame: async (gameId: string) => {
    console.log('End game temporarily disabled during migration', gameId);
    return null;
  },

  abandonGame: async (gameId: string) => {
    console.log('Abandon game temporarily disabled during migration', gameId);
    return null;
  },

  // Configuration methods
  useMockGames: async () => {
    console.log('Mock games config temporarily disabled during migration');
    return false;
  },

  setMockGames: async (enabled: boolean) => {
    console.log('Set mock games temporarily disabled during migration', enabled);
    return enabled;
  },

  toggleMockGames: async () => {
    console.log('Toggle mock games temporarily disabled during migration');
    return false;
  },

  // Historical events methods
  useMockHistoricalEvents: async () => {
    console.log('Mock historical events config temporarily disabled during migration');
    return false;
  },

  setMockHistoricalEvents: async (enabled: boolean) => {
    console.log('Set mock historical events temporarily disabled during migration', enabled);
    return enabled;
  },

  toggleMockHistoricalEvents: async () => {
    console.log('Toggle mock historical events temporarily disabled during migration');
    return false;
  },

  getHistoricalEvents: async (
    params: any
  ): Promise<{ events: HistoricalEvent[]; totalCount: number; hasMore: boolean }> => {
    console.log('Get historical events temporarily disabled during migration', params);
    return { events: [] as HistoricalEvent[], totalCount: 0, hasMore: false };
  },

  getUserGameStats: async (userId: string) => {
    console.log('Get user game stats temporarily disabled during migration', userId);
    return null;
  },

  getUserRecentGames: async (userId: string) => {
    console.log('Get user recent games temporarily disabled during migration', userId);
    return [];
  },
};
