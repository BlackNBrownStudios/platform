const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  video: false,
  viewportWidth: 1280,
  viewportHeight: 720,
  chromeWebSecurity: false,
});
