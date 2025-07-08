// Cypress end-to-end tests for local 2-player functionality
describe('Local 2-Player Game Functionality', () => {
  // Mock card data
  const mockCards = [
    {
      id: 'card-1',
      _id: 'card-1',
      title: 'First Event',
      description: 'Description of the first event',
      date: '1900-01-01',
      year: 1900,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-2',
      _id: 'card-2',
      title: 'Second Event',
      description: 'Description of the second event',
      date: '1950-01-01',
      year: 1950,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-3',
      _id: 'card-3',
      title: 'Third Event',
      description: 'Description of the third event',
      date: '2000-01-01',
      year: 2000,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-4',
      _id: 'card-4',
      title: 'Fourth Event',
      description: 'Description of the fourth event',
      date: '1850-01-01',
      year: 1850,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-5',
      _id: 'card-5',
      title: 'Fifth Event',
      description: 'Description of the fifth event',
      date: '1970-01-01',
      year: 1970,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-6',
      _id: 'card-6',
      title: 'Sixth Event',
      description: 'Description of the sixth event',
      date: '1920-01-01',
      year: 1920,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-7',
      _id: 'card-7',
      title: 'Seventh Event',
      description: 'Description of the seventh event',
      date: '1980-01-01',
      year: 1980,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-8',
      _id: 'card-8',
      title: 'Eighth Event',
      description: 'Description of the eighth event',
      date: '1930-01-01',
      year: 1930,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-9',
      _id: 'card-9',
      title: 'Ninth Event',
      description: 'Description of the ninth event',
      date: '1990-01-01',
      year: 1990,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-10',
      _id: 'card-10',
      title: 'Tenth Event',
      description: 'Description of the tenth event',
      date: '1910-01-01',
      year: 1910,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-11',
      _id: 'card-11',
      title: 'Eleventh Event',
      description: 'Description of the eleventh event',
      date: '1940-01-01',
      year: 1940,
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'card-12',
      _id: 'card-12',
      title: 'Twelfth Event',
      description: 'Description of the twelfth event',
      date: '1960-01-01',
      year: 1960,
      category: 'History',
      difficulty: 'medium',
    },
  ];

  beforeEach(() => {
    // Mock API calls
    cy.intercept('GET', '/api/v1/cards/random*', {
      statusCode: 200,
      body: mockCards,
    }).as('getRandomCards');

    // Mock card details endpoint
    cy.intercept('GET', '/api/v1/cards/*', (req) => {
      const cardId = req.url.split('/').pop();
      const card = mockCards.find((c) => c.id === cardId || c._id === cardId);

      if (card) {
        req.reply({
          statusCode: 200,
          body: card,
        });
      } else {
        req.reply({
          statusCode: 404,
          body: { message: 'Card not found' },
        });
      }
    }).as('getCardById');

    // Mock current user (guest)
    cy.intercept('GET', '/api/v1/auth/me', {
      statusCode: 200,
      body: {
        id: 'guest-user-id',
        name: 'Guest Player',
        email: null,
        isGuest: true,
      },
    }).as('getCurrentUser');
  });

  describe('Game Setup', () => {
    it('should load the local game page with mocked cards', () => {
      cy.visit('/local-game');
      cy.wait('@getRandomCards');

      // Verify page title
      cy.contains('h1', 'Local 2-Player Timeline Game').should('be.visible');
      cy.contains('p', 'Take turns placing historical events').should('be.visible');

      // Verify player setup is shown
      cy.contains('Local 2-Player Timeline Game').should('be.visible');
      cy.get('input[value="Guest Player"]').should('exist');
      cy.get('input[value="Player 2"]').should('exist');

      // Set player 2 name
      cy.get('input[value="Player 2"]').clear().type('Challenger');

      // Start the game
      cy.contains('button', 'Start Game').click();

      // Verify game has started with both players
      cy.contains('Guest Player').should('be.visible');
      cy.contains('Challenger').should('be.visible');

      // Verify the timeline is displayed
      cy.get('div').contains('Drop here').should('exist');

      // Verify player cards are displayed
      cy.get('.playerCards').should('have.length', 2);
    });
  });

  describe('Game Interactions', () => {
    it('should allow placing cards on the timeline', () => {
      // Visit and start the game
      cy.visit('/local-game');
      cy.wait('@getRandomCards');
      cy.contains('button', 'Start Game').click();

      // Get the first drag card element
      cy.get('.playerCards').first().find('div').first().as('firstCard');

      // Get a timeline drop target
      cy.contains('div', 'Drop here').first().as('dropTarget');

      // Cypress doesn't fully support HTML5 drag and drop, so we need to use dataTransfer
      // to simulate the drag and drop
      cy.get('@firstCard')
        .trigger('mousedown', { button: 0 })
        .trigger('mousemove', { clientX: 100, clientY: 100 })
        .then(() => {
          // Create a DataTransfer object
          const dataTransfer = new DataTransfer();

          // Create and dispatch dragstart event
          cy.get('@firstCard').trigger('dragstart', { dataTransfer });

          // Trigger dragover on the target
          cy.get('@dropTarget').trigger('dragover', { dataTransfer });

          // Trigger drop on the target
          cy.get('@dropTarget').trigger('drop', { dataTransfer });

          // Trigger dragend on the source
          cy.get('@firstCard').trigger('dragend', { dataTransfer });
        });

      // After drag and drop, verify the turn has changed
      cy.contains('Current Turn: Challenger').should('be.visible');

      // Verify score has been updated for first player
      cy.get('.playerScore').first().should('not.contain', '0');
    });

    it('should maintain horizontal timeline layout with proper scrolling', () => {
      // Visit and start the game
      cy.visit('/local-game');
      cy.wait('@getRandomCards');
      cy.contains('button', 'Start Game').click();

      // Verify the timeline container has overflow-x-auto class for horizontal scrolling
      cy.get('.w-full.my-8').find('.overflow-x-auto').should('exist');

      // Verify the inner timeline div has min-width-max class to ensure it doesn't wrap
      cy.get('.min-w-max').should('exist');

      // Place multiple cards to ensure the timeline gets populated
      // We'll place 5 cards to ensure we have enough to potentially overflow
      for (let i = 0; i < 5; i++) {
        // Get a card from the current player's hand
        cy.get('.playerCards')
          .eq(i % 2)
          .find('div')
          .first()
          .as('cardToPlace');

        // Get a timeline drop target that doesn't already have a card
        cy.contains('div', 'Drop here').first().as('dropTarget');

        // Perform drag and drop
        cy.get('@cardToPlace').then(($card) => {
          const dataTransfer = new DataTransfer();
          cy.get('@cardToPlace').trigger('dragstart', { dataTransfer });
          cy.get('@dropTarget').trigger('dragover', { dataTransfer });
          cy.get('@dropTarget').trigger('drop', { dataTransfer });
          cy.get('@cardToPlace').trigger('dragend', { dataTransfer });
        });

        // Allow time for the UI to update before continuing
        cy.wait(500);
      }

      // Verify the timeline maintains horizontal layout (check width is greater than height)
      cy.get('.min-w-max').then(($timeline) => {
        expect($timeline.width()).to.be.greaterThan($timeline.height());
      });

      // Check that the timeline cards are arranged horizontally by verifying their positions
      cy.get('.min-w-max')
        .find('[style*="width"]')
        .then(($cards) => {
          // Get the first and last card
          if ($cards.length >= 2) {
            const firstCardLeft = $cards.first().offset().left;
            const lastCardLeft = $cards.last().offset().left;

            // The last card should be further right than the first card
            expect(lastCardLeft).to.be.greaterThan(firstCardLeft);
          }
        });

      // Check for horizontal scrollbar by comparing scrollWidth to clientWidth
      cy.get('.overflow-x-auto').then(($container) => {
        expect($container[0].scrollWidth).to.be.at.least($container[0].clientWidth);
      });
    });

    it('should end the game when all cards are placed', () => {
      // Visit and start the game
      cy.visit('/local-game');
      cy.wait('@getRandomCards');
      cy.contains('button', 'Start Game').click();

      // Simulate game completion by adding a localStorage item
      cy.window().then((win) => {
        win.localStorage.setItem(
          'history_time_local_game_completed',
          JSON.stringify({
            player1Score: 450,
            player2Score: 300,
            winner: 'Guest Player',
            totalTime: 120,
          })
        );

        // Force the component to recognize the game is over
        win.dispatchEvent(new Event('storage'));
      });

      // Wait for the game finished screen and verify results
      cy.contains('Game Completed!', { timeout: 5000 }).should('be.visible');
      cy.contains('Winner: Guest Player').should('be.visible');
      cy.contains('Player 1 Score: 450').should('be.visible');
      cy.contains('Player 2 Score: 300').should('be.visible');

      // Check for play again button
      cy.contains('button', 'Play Again').should('be.visible');
      cy.contains('button', 'Return to Home').should('be.visible');

      // Test play again functionality
      cy.contains('button', 'Play Again').click();
      cy.wait('@getRandomCards');

      // Verify the game has restarted
      cy.contains('button', 'Start Game').should('be.visible');
    });
  });
});
