// Cypress end-to-end tests for multiplayer functionality
describe('Multiplayer Game Functionality', () => {
  // Room code to share between tests
  let roomCode;

  // Mock game data
  const mockGameId = 'game-123456789';
  const mockGameData = {
    id: mockGameId,
    roomCode: 'ABC123',
    status: 'waiting',
    players: [
      {
        userId: 'test-user-id-1',
        username: 'Test User 1',
        cards: [],
        isActive: true,
      },
    ],
    timeline: [],
    currentPlayerIndex: 0,
    difficulty: 'medium',
    maxPlayers: 4,
    categories: ['History'],
    gameMode: 'timeline',
  };

  // Mock card data
  const mockCards = [
    {
      id: 'card-1',
      title: 'First Event',
      description: 'Description of the first event',
      date: '1900-01-01',
      year: 1900,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-2',
      title: 'Second Event',
      description: 'Description of the second event',
      date: '1950-01-01',
      year: 1950,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-3',
      title: 'Third Event',
      description: 'Description of the third event',
      date: '2000-01-01',
      year: 2000,
      category: 'History',
      difficulty: 'medium',
    },
  ];

  beforeEach(() => {
    // Clear localStorage to start fresh
    cy.clearLocalStorage();

    // Setup mock for random cards
    cy.intercept('GET', '/api/v1/cards/random*', {
      statusCode: 200,
      body: mockCards,
    }).as('getRandomCards');
  });

  describe('Game Creation', () => {
    it('should allow authenticated user to create a game', () => {
      // Mock successful login
      cy.intercept('POST', '/api/v1/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: 'test-user-id-1',
            name: 'Test User 1',
            email: 'test1@example.com',
          },
          tokens: {
            access: { token: 'fake-access-token-1' },
            refresh: { token: 'fake-refresh-token-1' },
          },
        },
      }).as('loginAttempt');

      // Mock game creation
      cy.intercept('POST', '/api/v1/multiplayer-games', {
        statusCode: 201,
        body: mockGameData,
      }).as('createGame');

      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('test1@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginAttempt');

      // Navigate to create game page
      cy.visit('/multiplayer/create');
      cy.contains('Create Multiplayer Game').should('be.visible');

      // Fill out the form
      cy.get('select[name="difficulty"]').select('medium');
      cy.get('input[name="categories"]').check('History');
      cy.get('button[type="submit"]').click();

      // Verify request was made
      cy.wait('@createGame');

      // Should be redirected to the game lobby
      cy.url().should('include', '/multiplayer/game/');
      cy.contains('Game Lobby').should('be.visible');
      cy.contains('Room Code:').should('be.visible');

      // Store the room code for later tests
      cy.contains('Room Code: ')
        .invoke('text')
        .then((text) => {
          roomCode = text.replace('Room Code: ', '').trim();
          cy.log(`Room Code: ${roomCode}`);
        });
    });

    it('should allow guest user to create a game', () => {
      // Mock game creation
      cy.intercept('POST', '/api/v1/multiplayer-games', {
        statusCode: 201,
        body: {
          ...mockGameData,
          players: [
            {
              userId: null,
              username: 'Guest Player',
              cards: [],
              isActive: true,
            },
          ],
        },
      }).as('createGame');

      // Visit the login page and continue as guest
      cy.visit('/login');
      cy.contains('Continue as Guest').click();

      // Navigate to create game page
      cy.visit('/multiplayer/create');
      cy.contains('Create Multiplayer Game').should('be.visible');

      // Fill out the form
      cy.get('select[name="difficulty"]').select('medium');
      cy.get('input[name="categories"]').check('History');
      cy.get('button[type="submit"]').click();

      // Verify request was made
      cy.wait('@createGame');

      // Should be redirected to the game lobby
      cy.url().should('include', '/multiplayer/game/');
      cy.contains('Game Lobby').should('be.visible');
    });
  });

  describe('Game Joining', () => {
    beforeEach(() => {
      // Set up a mock room code
      roomCode = 'ABC123';

      // Mock game details fetch
      cy.intercept('GET', `/api/v1/multiplayer-games/code/${roomCode}`, {
        statusCode: 200,
        body: mockGameData,
      }).as('getGameByCode');

      // Mock joining a game
      cy.intercept('POST', `/api/v1/multiplayer-games/join/${roomCode}`, {
        statusCode: 200,
        body: {
          ...mockGameData,
          players: [
            ...mockGameData.players,
            {
              userId: 'test-user-id-2',
              username: 'Test User 2',
              cards: [],
              isActive: true,
            },
          ],
        },
      }).as('joinGame');
    });

    it('should allow authenticated user to join a game', () => {
      // Mock successful login
      cy.intercept('POST', '/api/v1/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: 'test-user-id-2',
            name: 'Test User 2',
            email: 'test2@example.com',
          },
          tokens: {
            access: { token: 'fake-access-token-2' },
            refresh: { token: 'fake-refresh-token-2' },
          },
        },
      }).as('loginAttempt');

      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('test2@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginAttempt');

      // Navigate to join game page
      cy.visit('/multiplayer/join');
      cy.contains('Join Multiplayer Game').should('be.visible');

      // Fill out the form
      cy.get('input[name="roomCode"]').type(roomCode);
      cy.get('button[type="submit"]').click();

      // Verify request was made
      cy.wait('@joinGame');

      // Should be redirected to the game
      cy.url().should('include', '/multiplayer/game/');
      cy.contains('Game Lobby').should('be.visible');
      cy.contains('Test User 1').should('be.visible');
      cy.contains('Test User 2').should('be.visible');
    });

    it('should allow guest user to join a game', () => {
      // Mock joining a game as guest
      cy.intercept('POST', `/api/v1/multiplayer-games/join/${roomCode}`, {
        statusCode: 200,
        body: {
          ...mockGameData,
          players: [
            ...mockGameData.players,
            {
              userId: null,
              username: 'Guest Player',
              cards: [],
              isActive: true,
            },
          ],
        },
      }).as('joinGameAsGuest');

      // Visit the login page and continue as guest
      cy.visit('/login');
      cy.contains('Continue as Guest').click();

      // Navigate to join game page
      cy.visit('/multiplayer/join');
      cy.contains('Join Multiplayer Game').should('be.visible');

      // Fill out the form
      cy.get('input[name="roomCode"]').type(roomCode);
      cy.get('input[name="username"]').clear().type('Guest Player');
      cy.get('button[type="submit"]').click();

      // Verify request was made
      cy.wait('@joinGameAsGuest');

      // Should be redirected to the game
      cy.url().should('include', '/multiplayer/game/');
      cy.contains('Game Lobby').should('be.visible');
      cy.contains('Guest Player').should('be.visible');
    });
  });

  describe('Game Interactions', () => {
    beforeEach(() => {
      // Mock successful login
      cy.intercept('POST', '/api/v1/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: 'test-user-id-1',
            name: 'Test User 1',
            email: 'test1@example.com',
          },
          tokens: {
            access: { token: 'fake-access-token-1' },
            refresh: { token: 'fake-refresh-token-1' },
          },
        },
      }).as('loginAttempt');

      // Mock game with multiple players
      const gameWithPlayers = {
        ...mockGameData,
        id: mockGameId,
        players: [
          {
            userId: 'test-user-id-1',
            username: 'Test User 1',
            cards: [
              { cardId: 'card-1', drawOrder: 1 },
              { cardId: 'card-2', drawOrder: 2 },
            ],
            isActive: true,
          },
          {
            userId: 'test-user-id-2',
            username: 'Test User 2',
            cards: [{ cardId: 'card-3', drawOrder: 3 }],
            isActive: true,
          },
        ],
      };

      // Mock game retrieval
      cy.intercept('GET', `/api/v1/multiplayer-games/${mockGameId}`, {
        statusCode: 200,
        body: gameWithPlayers,
      }).as('getGame');

      // Mock card details retrieval
      mockCards.forEach((card) => {
        cy.intercept('GET', `/api/v1/cards/${card.id}`, {
          statusCode: 200,
          body: card,
        }).as(`getCard-${card.id}`);
      });

      // Mock starting a game
      cy.intercept('POST', `/api/v1/multiplayer-games/${mockGameId}/start`, {
        statusCode: 200,
        body: {
          ...gameWithPlayers,
          status: 'in_progress',
        },
      }).as('startGame');

      // Mock placing a card
      cy.intercept('POST', `/api/v1/multiplayer-games/${mockGameId}/place-card`, {
        statusCode: 200,
        body: {
          game: {
            ...gameWithPlayers,
            status: 'in_progress',
            timeline: [
              {
                cardId: 'card-1',
                position: 1,
                placedBy: 'test-user-id-1',
                placementTime: new Date().toISOString(),
              },
            ],
            players: [
              {
                userId: 'test-user-id-1',
                username: 'Test User 1',
                cards: [{ cardId: 'card-2', drawOrder: 2 }],
                isActive: true,
              },
              {
                userId: 'test-user-id-2',
                username: 'Test User 2',
                cards: [{ cardId: 'card-3', drawOrder: 3 }],
                isActive: true,
              },
            ],
            currentPlayerIndex: 1,
          },
          result: {
            isCorrect: true,
            cardId: 'card-1',
            position: 1,
          },
        },
      }).as('placeCard');

      // Mock leaving a game
      cy.intercept('PATCH', `/api/v1/multiplayer-games/${mockGameId}/leave`, {
        statusCode: 200,
        body: {
          ...gameWithPlayers,
          players: [
            {
              userId: 'test-user-id-1',
              username: 'Test User 1',
              cards: [
                { cardId: 'card-1', drawOrder: 1 },
                { cardId: 'card-2', drawOrder: 2 },
              ],
              isActive: true,
            },
            {
              userId: 'test-user-id-2',
              username: 'Test User 2',
              cards: [{ cardId: 'card-3', drawOrder: 3 }],
              isActive: false,
            },
          ],
        },
      }).as('leaveGame');
    });

    it('should allow starting a game', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('test1@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginAttempt');

      // Visit the game page directly
      cy.visit(`/multiplayer/game/${mockGameId}`);
      cy.wait('@getGame');

      // Start the game
      cy.contains('Start Game').click();
      cy.wait('@startGame');

      // Should show the game in progress
      cy.contains('Multiplayer Timeline').should('be.visible');
      cy.contains('Your Cards').should('be.visible');
    });

    it('should allow placing a card on the timeline', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('test1@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginAttempt');

      // Set up an in-progress game state
      cy.intercept('GET', `/api/v1/multiplayer-games/${mockGameId}`, {
        statusCode: 200,
        body: {
          ...mockGameData,
          status: 'in_progress',
          players: [
            {
              userId: 'test-user-id-1',
              username: 'Test User 1',
              cards: [
                { cardId: 'card-1', drawOrder: 1 },
                { cardId: 'card-2', drawOrder: 2 },
              ],
              isActive: true,
            },
            {
              userId: 'test-user-id-2',
              username: 'Test User 2',
              cards: [{ cardId: 'card-3', drawOrder: 3 }],
              isActive: true,
            },
          ],
          currentPlayerIndex: 0,
        },
      }).as('getInProgressGame');

      // Visit the in-progress game page
      cy.visit(`/multiplayer/game/${mockGameId}`);
      cy.wait('@getInProgressGame');
      cy.wait(1000); // Give time for cards to load

      // Use cy.get with proper force: true to interact with the draggable elements
      // Note: In real app, you'd need to set up fixtures to allow Cypress to use
      // HTML5 drag and drop effectively, or click the card and then click a valid position
      cy.get('.draggable-card').first().click(); // Select the card

      // Click on a timeline slot
      cy.get('.timeline-slot').first().click();
      cy.wait('@placeCard');

      // Should see the confirmation and updated game state
      cy.contains('Card placed correctly!');
    });

    it('should allow leaving a game', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[type="email"]').type('test1@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginAttempt');

      // Visit the game page
      cy.visit(`/multiplayer/game/${mockGameId}`);
      cy.wait('@getGame');

      // Leave the game
      cy.contains('Leave Game').click();
      cy.wait('@leaveGame');

      // Should be redirected to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });
});
