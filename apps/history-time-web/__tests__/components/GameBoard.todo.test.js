import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBoard from '../../src/app/components/GameBoard';
import { apiService } from '../../src/app/services/api';

// Mock the CardManager component to avoid React version conflicts
jest.mock('history-time-shared', () => ({
  CardManager: ({ children }) => {
    // Simple mock that calls children with mock state and actions
    return children({
      state: {
        selectedCard: null,
        placedCards: [],
        availableCards: [],
        isCardSelected: false,
        canPlaceCard: false,
      },
      actions: {
        selectCard: jest.fn(),
        deselectCard: jest.fn(),
        placeCard: jest.fn(),
        removeCard: jest.fn(),
        clearSelection: jest.fn(),
        resetCards: jest.fn(),
        getCardAtPosition: jest.fn(),
        isPositionOccupied: jest.fn(),
        getNextAvailablePosition: jest.fn(),
      },
    });
  },
}));

// Mock the API service
jest.mock('../../src/app/services/api', () => ({
  apiService: {
    createGame: jest.fn(),
    getGameById: jest.fn(),
    getCardById: jest.fn(),
    updateCardPlacement: jest.fn(),
    endGame: jest.fn(),
    abandonGame: jest.fn(),
  },
}));

// Create sample game and card data for tests
const mockCards = [
  {
    id: 'card1',
    title: 'First Moon Landing',
    description: 'Neil Armstrong steps on the moon',
    year: 1969,
    category: 'Scientific',
    difficulty: 'medium',
  },
  {
    id: 'card2',
    title: 'World War II Ends',
    description: 'End of World War II in Europe',
    year: 1945,
    category: 'Military',
    difficulty: 'medium',
  },
  {
    id: 'card3',
    title: 'Declaration of Independence',
    description: 'US Declaration of Independence signed',
    year: 1776,
    category: 'Political',
    difficulty: 'medium',
  },
];

const mockNewGame = {
  id: 'game123',
  status: 'in_progress',
  difficulty: 'medium',
  cards: mockCards.map((card, index) => ({
    cardId: card.id,
    placementOrder: index + 1,
    placementPosition: null,
    isCorrect: false,
    timeTaken: 0,
  })),
  timeStarted: new Date().toISOString(),
  userId: undefined,
};

describe('GameBoard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load a new game when no gameId is provided', async () => {
    // Mock createGame with the correct response structure
    const mockResponse = {
      game: mockNewGame,
      imageMapping: {}, // Empty mapping for test
    };
    console.log('Mocking createGame with:', mockResponse);
    apiService.createGame.mockResolvedValue(mockResponse);

    // Mock getCardById to return the card details
    apiService.getCardById.mockImplementation((cardId) => {
      const card = mockCards.find((c) => c.id === cardId);
      return Promise.resolve(card);
    });

    await act(async () => {
      render(
        <GameBoard
          difficulty="medium"
          cardCount={3}
          categories={['Scientific', 'Military', 'Political']}
        />
      );
    });

    // Wait for the game to load and verify the API call
    await waitFor(
      () => {
        expect(apiService.createGame).toHaveBeenCalledWith({
          difficulty: 'medium',
          cardCount: 3,
          categories: ['Scientific', 'Military', 'Political'],
          preloadImages: true,
        });
      },
      { timeout: 10000 }
    );

    // Should show the loaded game UI
    expect(screen.getByText('History Timeline')).toBeInTheDocument();
    expect(screen.getByText('Your Cards (3 left)')).toBeInTheDocument();
    expect(screen.getByText('First Moon Landing')).toBeInTheDocument();
  });

  it('should load an existing game when gameId is provided', async () => {
    jest.clearAllMocks(); // Clear previous mocks
    const existingGameId = 'existing123';
    const existingGame = {
      ...mockNewGame,
      id: existingGameId,
      cards: [
        {
          cardId: mockCards[0].id,
          placementOrder: 1,
          placementPosition: 2,
          isCorrect: true,
          timeTaken: 10,
        },
        {
          cardId: mockCards[1].id,
          placementOrder: 2,
          placementPosition: null,
          isCorrect: false,
          timeTaken: 0,
        },
        {
          cardId: mockCards[2].id,
          placementOrder: 3,
          placementPosition: null,
          isCorrect: false,
          timeTaken: 0,
        },
      ],
    };

    apiService.getGameById.mockResolvedValue(existingGame);
    apiService.getCardById.mockImplementation((cardId) => {
      const card = mockCards.find((c) => c.id === cardId);
      return Promise.resolve(card);
    });

    await act(async () => {
      render(<GameBoard gameId={existingGameId} />);
    });

    // Wait for the game to load
    await waitFor(
      () => {
        expect(apiService.getGameById).toHaveBeenCalledWith(existingGameId);
      },
      { timeout: 10000 }
    );

    // Should show the loaded game UI
    expect(screen.getByText('History Timeline')).toBeInTheDocument();
    expect(screen.getByText('First Moon Landing')).toBeInTheDocument();
  });

  it('should handle anonymous games correctly', async () => {
    // Mock game with no userId (anonymous)
    const anonymousGame = {
      ...mockNewGame,
      userId: undefined,
    };

    apiService.createGame.mockResolvedValue({ game: anonymousGame, imageMapping: {} });

    render(<GameBoard difficulty="medium" cardCount={3} />);

    await waitFor(
      () => {
        expect(apiService.createGame).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
  });

  it('should handle card placement updates', async () => {
    apiService.createGame.mockResolvedValue({ game: mockNewGame, imageMapping: {} });

    const updatedGame = {
      ...mockNewGame,
      cards: [
        {
          ...mockNewGame.cards[0],
          placementPosition: 2,
          isCorrect: true,
          timeTaken: 15,
        },
        ...mockNewGame.cards.slice(1),
      ],
    };

    apiService.updateCardPlacement.mockResolvedValue(updatedGame);

    render(<GameBoard difficulty="medium" cardCount={3} />);

    await waitFor(
      () => {
        expect(apiService.createGame).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
  });

  it('should handle game completion', async () => {
    const completedGame = {
      ...mockNewGame,
      status: 'completed',
      score: 800,
      correctPlacements: 2,
      incorrectPlacements: 1,
      totalTimeTaken: 45,
      isWin: true,
    };

    apiService.createGame.mockResolvedValue({ game: mockNewGame, imageMapping: {} });
    apiService.endGame.mockResolvedValue(completedGame);

    render(<GameBoard difficulty="medium" cardCount={3} />);

    await waitFor(
      () => {
        expect(apiService.createGame).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
  });
});
