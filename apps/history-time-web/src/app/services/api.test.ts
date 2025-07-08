import { apiService } from './api';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocks
fetchMock.enableMocks();

describe('API Service', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      // Setup mock response
      const mockCategories = ['Political', 'Military', 'Scientific', 'Technological'];
      fetchMock.mockResponseOnce(JSON.stringify(mockCategories));

      // Call the service method
      const result = await apiService.getCategories();

      // Verify the result
      expect(result).toEqual(mockCategories);

      // Verify correct endpoint was called
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual('http://localhost/api/v1/cards/categories');
    });

    it('should handle errors when fetching categories', async () => {
      // Setup mock response with error
      fetchMock.mockRejectOnce(new Error('Failed to fetch categories'));

      // Call the service method and expect it to throw
      await expect(apiService.getCategories()).rejects.toThrow('Failed to fetch categories');
    });
  });

  describe('getRandomCards', () => {
    it('should fetch random cards with correct parameters', async () => {
      // Setup mock response
      const mockCards = [
        {
          id: '1',
          title: 'World War II Ends',
          description: 'Japan surrenders, ending World War II',
          date: '1945-09-02',
          year: 1945,
          category: 'Military',
          difficulty: 'medium',
        },
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockCards));

      // Call the service method with parameters
      const result = await apiService.getRandomCards({
        difficulty: 'medium',
        count: 5,
        category: 'Military',
      });

      // Verify the result
      expect(result).toEqual(mockCards);

      // Verify correct endpoint was called with the right parameters
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(
        'http://localhost/api/v1/cards/random?difficulty=medium&count=5&category=Military'
      );
    });
  });

  describe('createGame', () => {
    it('should create a game with the correct data', async () => {
      // Setup mock response
      const mockGame = {
        id: 'game123',
        cards: [],
        difficulty: 'medium',
        status: 'in_progress',
        score: 0,
        correctPlacements: 0,
        incorrectPlacements: 0,
        timeStarted: new Date().toISOString(),
        totalTimeTaken: 0,
        categories: ['Military', 'Political'],
        isWin: false,
      };
      fetchMock.mockResponseOnce(JSON.stringify({ game: mockGame }));

      // Game data to send
      const gameData = {
        difficulty: 'medium',
        cardCount: 10,
        categories: ['Military', 'Political'],
      };

      // Call the service method
      const result = await apiService.createGame(gameData);

      // Verify the result
      expect(result).toEqual({ game: mockGame });

      // Verify correct endpoint was called with the right method and body
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual('http://localhost/api/v1/games');
      expect(fetchMock.mock.calls[0][1]?.method).toEqual('POST');
      expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual(gameData);
    });
  });

  describe('updateCardPlacement', () => {
    it('should update a card placement correctly', async () => {
      // Setup mock response
      const mockGame = {
        id: 'game123',
        status: 'in_progress',
        // ... other game properties
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockGame));

      // Placement data
      const gameId = 'game123';
      const placementData = {
        cardId: 'card123',
        placementPosition: 2,
        timeTaken: 30,
      };

      // Call the service method
      const result = await apiService.updateCardPlacement(gameId, placementData);

      // Verify the result
      expect(result).toEqual(mockGame);

      // Verify correct endpoint and data
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual('http://localhost/api/v1/games/game123');
      expect(fetchMock.mock.calls[0][1]?.method).toEqual('PATCH');
      expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
        cardPlacement: placementData,
      });
    });
  });

  describe('endGame', () => {
    it('should end a game correctly', async () => {
      // Setup mock response
      const mockGame = {
        id: 'game123',
        status: 'completed',
        score: 850,
        // ... other game properties
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockGame));

      // Call the service method
      const result = await apiService.endGame('game123');

      // Verify the result
      expect(result).toEqual(mockGame);

      // Verify correct endpoint and method
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual('http://localhost/api/v1/games/game123/end');
      expect(fetchMock.mock.calls[0][1]?.method).toEqual('POST');
    });
  });
});
