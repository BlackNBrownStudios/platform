import { apiService } from '../../src/app/services/api';
import fetchMock from 'jest-fetch-mock';

describe('API Service', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = ['Political', 'Military', 'Scientific'];
      fetchMock.mockResponseOnce(JSON.stringify(mockCategories));

      const result = await apiService.getCategories();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/cards/categories'),
        expect.any(Object)
      );
      expect(result).toEqual(mockCategories);
    });

    it('should handle errors when fetching categories', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(apiService.getCategories()).rejects.toThrow();
    });
  });

  describe('createGame', () => {
    it('should create a game for anonymous user successfully', async () => {
      const mockGame = {
        _id: 'game123',
        cards: [{ cardId: 'card1', placementOrder: 1 }],
        difficulty: 'medium',
        status: 'in_progress',
      };

      const mockResponse = { game: mockGame };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const gameOptions = {
        difficulty: 'medium',
        cardCount: 10,
      };

      const result = await apiService.createGame(gameOptions);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/games'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(gameOptions),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create a game with categories', async () => {
      const mockGame = {
        _id: 'game123',
        cards: [{ cardId: 'card1', placementOrder: 1 }],
        difficulty: 'medium',
        status: 'in_progress',
        categories: ['Military', 'Political'],
      };

      const mockResponse = { game: mockGame };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const gameOptions = {
        difficulty: 'medium',
        cardCount: 10,
        categories: ['Military', 'Political'],
      };

      const result = await apiService.createGame(gameOptions);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/games'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(gameOptions),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when creating a game', async () => {
      fetchMock.mockRejectOnce(new Error('Server error'));

      const gameOptions = {
        difficulty: 'medium',
        cardCount: 10,
      };

      await expect(apiService.createGame(gameOptions)).rejects.toThrow();
    });
  });

  describe('getGameById', () => {
    it('should fetch a game by ID successfully', async () => {
      const mockGame = {
        _id: 'game123',
        cards: [{ cardId: 'card1', placementOrder: 1 }],
        difficulty: 'medium',
        status: 'in_progress',
      };

      fetchMock.mockResponseOnce(JSON.stringify(mockGame));

      const result = await apiService.getGameById('game123');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/games/game123'),
        expect.any(Object)
      );
      expect(result).toEqual(mockGame);
    });

    it('should handle errors when fetching a game', async () => {
      fetchMock.mockRejectOnce(new Error('Game not found'));

      await expect(apiService.getGameById('nonexistent')).rejects.toThrow();
    });
  });

  describe('updateCardPlacement', () => {
    it('should update card placement successfully', async () => {
      const mockUpdatedGame = {
        _id: 'game123',
        cards: [
          {
            cardId: 'card1',
            placementOrder: 1,
            placementPosition: 3,
            timeTaken: 15,
            isCorrect: true,
          },
        ],
        status: 'in_progress',
      };

      fetchMock.mockResponseOnce(JSON.stringify(mockUpdatedGame));

      const placementData = {
        cardId: 'card1',
        placementPosition: 3,
        timeTaken: 15,
      };

      const result = await apiService.updateCardPlacement('game123', placementData);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/games/game123'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ cardPlacement: placementData }),
        })
      );
      expect(result).toEqual(mockUpdatedGame);
    });
  });

  describe('endGame', () => {
    it('should end a game successfully', async () => {
      const mockEndedGame = {
        _id: 'game123',
        cards: [{ cardId: 'card1', placementOrder: 1, isCorrect: true }],
        status: 'completed',
        score: 850,
        correctPlacements: 8,
        incorrectPlacements: 2,
        totalTimeTaken: 300,
        isWin: true,
      };

      fetchMock.mockResponseOnce(JSON.stringify(mockEndedGame));

      const result = await apiService.endGame('game123');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/games/game123/end'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockEndedGame);
    });
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard data successfully', async () => {
      const mockLeaderboard = [
        {
          _id: 'game1',
          userId: { _id: 'user1', name: 'Player 1' },
          score: 950,
          difficulty: 'hard',
        },
        {
          _id: 'game2',
          userId: { _id: 'user2', name: 'Player 2' },
          score: 800,
          difficulty: 'medium',
        },
      ];

      fetchMock.mockResponseOnce(JSON.stringify(mockLeaderboard));

      const options = {
        timeFrame: 'weekly' as 'weekly' | 'daily' | 'monthly' | 'all_time',
        difficulty: 'medium',
        limit: 10,
      };

      const result = await apiService.getLeaderboard(options);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/leaderboard?timeFrame=weekly&difficulty=medium&limit=10'),
        expect.any(Object)
      );
      expect(result).toEqual(mockLeaderboard);
    });
  });
});
