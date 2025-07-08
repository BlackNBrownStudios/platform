describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Registration', () => {
    it('should register a new user successfully', () => {
      cy.visit('/register');

      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Test123!@#');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/game');
      cy.get('[data-testid="user-menu"]').should('contain', 'Test User');
    });

    it('should show validation errors for invalid input', () => {
      cy.visit('/register');

      cy.get('button[type="submit"]').click();

      cy.get('[data-testid="error-name"]').should('contain', 'Name is required');
      cy.get('[data-testid="error-email"]').should('contain', 'Email is required');
      cy.get('[data-testid="error-password"]').should('contain', 'Password is required');
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('existing@example.com');
      cy.get('input[name="password"]').type('Test123!@#');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/game');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.get('[data-testid="error-message"]').should('contain', 'Invalid email or password');
    });

    it('should allow guest login', () => {
      cy.visit('/login');

      cy.get('[data-testid="guest-login"]').click();

      cy.url().should('include', '/game');
      cy.get('[data-testid="user-menu"]').should('contain', 'Guest');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      cy.visit('/profile');
      cy.url().should('include', '/login');
    });

    it('should allow access to protected route when authenticated', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Test123!@#');
      cy.get('button[type="submit"]').click();

      // Now try to access protected route
      cy.visit('/profile');
      cy.url().should('include', '/profile');
      cy.get('[data-testid="profile-page"]').should('be.visible');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Test123!@#');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/game');
    });

    it('should logout successfully', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      cy.url().should('equal', Cypress.config().baseUrl + '/');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('should clear auth state after logout', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      // Try to access protected route
      cy.visit('/profile');
      cy.url().should('include', '/login');
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token automatically before expiry', () => {
      cy.intercept('POST', '/v1/auth/login', {
        statusCode: 200,
        body: {
          user: { id: '1', name: 'Test User', email: 'test@example.com' },
          tokens: {
            access: {
              token: 'short-lived-token',
              expires: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
            },
            refresh: {
              token: 'refresh-token',
              expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
        },
      }).as('login');

      cy.intercept('POST', '/v1/auth/refresh-tokens', {
        statusCode: 200,
        body: {
          access: {
            token: 'new-access-token',
            expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          },
          refresh: {
            token: 'new-refresh-token',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      }).as('refreshTokens');

      cy.visit('/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Test123!@#');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');

      // Wait for automatic token refresh (should happen before 5 minutes)
      cy.wait('@refreshTokens', { timeout: 5 * 60 * 1000 });

      // Verify user is still authenticated
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });
  });

  describe('Session Persistence', () => {
    it('should persist session on page reload', () => {
      // Login
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Test123!@#');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/game');

      // Reload page
      cy.reload();

      // Should still be authenticated
      cy.get('[data-testid="user-menu"]').should('be.visible');
      cy.get('[data-testid="user-menu"]').should('contain', 'test@example.com');
    });
  });
});
