describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('h1').should('contain', 'Log In to History Time');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    cy.contains('Register').should('be.visible');
    cy.contains('Forgot Password').should('be.visible');
    cy.contains('Continue as Guest').should('be.visible');
  });

  it('should show validation errors', () => {
    // Submit without email or password
    cy.get('button[type="submit"]').click();
    cy.get('.bg-red-100')
      .should('be.visible')
      .and('contain', 'Please enter both email and password');

    // Submit with email but no password
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.get('.bg-red-100')
      .should('be.visible')
      .and('contain', 'Please enter both email and password');

    // Submit with password but no email
    cy.get('input[type="email"]').clear();
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.get('.bg-red-100')
      .should('be.visible')
      .and('contain', 'Please enter both email and password');
  });

  it('should handle failed login', () => {
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials',
      },
    }).as('loginAttempt');

    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginAttempt');
    cy.get('.bg-red-100').should('be.visible').and('contain', 'Login failed');
  });

  it('should handle successful login', () => {
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
        tokens: {
          access: { token: 'fake-access-token' },
          refresh: { token: 'fake-refresh-token' },
        },
      },
    }).as('loginAttempt');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginAttempt');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should allow guest login', () => {
    cy.contains('Continue as Guest').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Verify localStorage contains guest user data
    cy.window().then((window) => {
      const guestUserData = window.localStorage.getItem('history_time_guest_user');
      expect(guestUserData).to.not.be.null;
      const guestUser = JSON.parse(guestUserData);
      expect(guestUser.isGuest).to.be.true;
    });
  });
});
