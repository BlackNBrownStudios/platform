describe('Registration Page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display registration form', () => {
    cy.get('h1').should('contain', 'Create Account');
    cy.get('input[name="name"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    cy.contains('Already have an account').should('be.visible');
  });

  it('should validate form inputs', () => {
    // Submit empty form
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-700').should('be.visible');

    // Test name validation
    cy.get('input[name="name"]').type('T');
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-700').should('be.visible');

    // Test email validation
    cy.get('input[name="name"]').clear().type('Test User');
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-700').should('be.visible');

    // Test password validation
    cy.get('input[type="email"]').clear().type('test@example.com');
    cy.get('input[type="password"]').type('123');
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-700').should('be.visible');
  });

  it('should handle successful registration', () => {
    cy.intercept('POST', '/api/v1/auth/register', {
      statusCode: 201,
      body: {
        user: {
          id: 'new-user-id',
          name: 'New User',
          email: 'new@example.com',
        },
        tokens: {
          access: { token: 'fake-access-token' },
          refresh: { token: 'fake-refresh-token' },
        },
      },
    }).as('registerRequest');

    cy.get('input[name="name"]').type('New User');
    cy.get('input[type="email"]').type('new@example.com');
    cy.get('input[type="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest');

    // Should redirect to homepage after successful registration
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Should store the tokens in localStorage
    cy.window().then((window) => {
      expect(window.localStorage.getItem('auth_token')).to.not.be.null;
      expect(window.localStorage.getItem('refresh_token')).to.not.be.null;
    });
  });

  it('should handle registration errors', () => {
    cy.intercept('POST', '/api/v1/auth/register', {
      statusCode: 400,
      body: {
        message: 'Email already in use',
      },
    }).as('registerFailRequest');

    cy.get('input[name="name"]').type('Test User');
    cy.get('input[type="email"]').type('existing@example.com');
    cy.get('input[type="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerFailRequest');

    // Should show error message
    cy.get('.text-red-700').should('be.visible').and('contain', 'Registration failed');

    // Should stay on the registration page
    cy.url().should('include', '/register');
  });

  it('should navigate to login page', () => {
    cy.contains('Log in').click();
    cy.url().should('include', '/login');
  });
});
