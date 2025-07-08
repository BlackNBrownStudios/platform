/**
 * Shared test utilities for component and integration testing
 */
import { NavigationContainer } from '@react-navigation/native';
import { render, RenderOptions } from '@testing-library/react-native';
import React, { ReactElement } from 'react';

// Mock API service
export const mockApiService = {
  getGame: jest.fn().mockImplementation((gameId) =>
    Promise.resolve({
      id: gameId || 'game-123',
      category: 'World History',
      difficulty: 'Easy',
      cards: [
        {
          cardId: 'card-1',
          id: 'card-1',
          title: 'First Card',
          date: '1492',
          description: 'First card description',
          position: null,
          imageUrl: '',
        },
        {
          cardId: 'card-2',
          id: 'card-2',
          title: 'Second Card',
          date: '1776',
          description: 'Second card description',
          position: null,
          imageUrl: '',
        },
        {
          cardId: 'card-3',
          id: 'card-3',
          title: 'Third Card',
          date: '1969',
          description: 'Third card description',
          position: null,
          imageUrl: '',
        },
      ],
      timelineCards: [],
      userId: 'user-1',
      status: 'active',
      score: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  ),
  createGame: jest.fn().mockImplementation((category, difficulty) =>
    Promise.resolve({
      id: 'game-123',
      category: category || 'World History',
      difficulty: difficulty || 'Easy',
      userId: 'user-1',
      status: 'active',
      cards: [],
      score: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  ),
  updateCardPlacement: jest.fn().mockImplementation((gameId, cardId, position) =>
    Promise.resolve({
      id: gameId,
      cards: [
        {
          id: 'card-1',
          title: 'First Card',
          date: '1492',
          description: 'First card description',
          position: cardId === 'card-1' ? position : null,
          imageUrl: '',
        },
        {
          id: 'card-2',
          title: 'Second Card',
          date: '1776',
          description: 'Second card description',
          position: cardId === 'card-2' ? position : null,
          imageUrl: '',
        },
        {
          id: 'card-3',
          title: 'Third Card',
          date: '1969',
          description: 'Third card description',
          position: cardId === 'card-3' ? position : null,
          imageUrl: '',
        },
      ],
      timelineCards: [{ id: cardId, position }],
    })
  ),
  endGame: jest.fn().mockImplementation((gameId) =>
    Promise.resolve({
      score: 100,
      correctPlacements: 3,
      totalCards: 3,
      isWin: true,
    })
  ),
  getCardsByCategory: jest.fn().mockImplementation((category) =>
    Promise.resolve([
      {
        id: 'card-1',
        title: 'First Card',
        date: '1492',
        description: 'First card description',
        category: category || 'World History',
        imageUrl: '',
      },
      {
        id: 'card-2',
        title: 'Second Card',
        date: '1776',
        description: 'Second card description',
        category: category || 'World History',
        imageUrl: '',
      },
      {
        id: 'card-3',
        title: 'Third Card',
        date: '1969',
        description: 'Third card description',
        category: category || 'World History',
        imageUrl: '',
      },
    ])
  ),
  abandonGame: jest.fn().mockImplementation((gameId) => Promise.resolve({ success: true })),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  getGamesByUser: jest.fn(),
  getCategories: jest
    .fn()
    .mockImplementation(() => Promise.resolve(['World History', 'Science', 'Technology'])),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  getGames: jest.fn(),
  updateGame: jest.fn(),
  getCard: jest.fn(),
  getScores: jest.fn(),
  submitScore: jest.fn(),
  placeCard: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  getEventImage: jest.fn(),
  searchImages: jest.fn(),
  getLeaderboard: jest.fn(),
  getRandomCards: jest.fn(),
};

// Create a simple wrapper component for children
const SimpleWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

// Create a mock ThemeProvider component
const MockThemeProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

// Mock theme context - we need to do this before using ThemeProvider
jest.mock('../themes/ThemeContext', () => {
  // Create simple theme styles
  const themeStyles = {
    light: {
      primary: '#1976d2',
      secondary: '#f50057',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121',
      timelineColor: '#1976d2',
    },
  };

  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => {
      const React = jest.requireActual('react');
      return React.createElement(React.Fragment, null, children);
    },
    useAppTheme: () => ({
      theme: 'light',
      styles: themeStyles.light,
      setTheme: jest.fn(),
      toggleTheme: jest.fn(),
      themeStyles,
      isDark: false,
    }),
  };
});

// Mock API context
jest.mock('../services/api', () => ({
  useApi: () => mockApiService,
  ApiProvider: ({ children }: any) => children,
}));

// Mock navigation hooks
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');

  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {
        category: 'World History',
        difficulty: 'easy',
      },
      name: 'Test',
    }),
    useIsFocused: () => true,
  };
});

// Define interface for additional render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: {
    params?: Record<string, any>;
    name?: string;
  };
}

// Custom render function
export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { route, ...renderOptions } = options;

  // Update mock navigation if route params provided
  if (route?.params || route?.name) {
    const nav = require('@react-navigation/native');
    const mockUseRoute = jest.fn().mockReturnValue({
      params: route.params || {
        category: 'World History',
        difficulty: 'easy',
      },
      name: route.name || 'Test',
    });
    nav.useRoute = mockUseRoute;
  }

  // Create a simpler wrapper using fragment to bypass NavigationContainer issues
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper to flush promises
export const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

// Mock for AsyncStorage
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
};

// Interface for mock card data
interface MockCard {
  id: string;
  title: string;
  date: string;
  description: string;
  position: number | null;
  imageUrl: string;
}

// Generate mock cards for testing
export function generateMockCards(count = 3, placed = false): MockCard[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `card-${i + 1}`,
    title: `Card ${i + 1}`,
    date: `${1500 + i * 100}`,
    description: `Description for card ${i + 1}`,
    position: placed ? i : null,
    imageUrl: `https://example.com/image${i + 1}.jpg`,
  }));
}
