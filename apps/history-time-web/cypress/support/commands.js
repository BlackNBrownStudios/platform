// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Import testing-library commands
import '@testing-library/cypress/add-commands';

// -- Custom Login Command --
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
  });
});

// -- Custom Guest Login Command --
Cypress.Commands.add('loginAsGuest', () => {
  cy.visit('/login');
  cy.contains('Continue as Guest').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});
