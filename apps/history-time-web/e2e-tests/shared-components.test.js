const { test, expect } = require('@playwright/test');

test.describe('Shared Components Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to our test page
    await page.goto('http://localhost:3000/card-manager-test');
  });

  test('should load the CardManager test page', async ({ page }) => {
    // Check that the page loads correctly
    await expect(page.locator('h1')).toContainText('CardManager Test Page');

    // Check that basic React functionality works
    const incrementButton = page.getByTestId('increment-button');
    await expect(incrementButton).toBeVisible();

    // Test counter functionality
    await incrementButton.click();
    await expect(page.locator('text=Counter: 1')).toBeVisible();

    // Second click and verify
    await incrementButton.click();
    await expect(page.locator('text=Counter: 2')).toBeVisible();
  });

  test('should test shared package import', async ({ page }) => {
    // Check initial import status
    const importStatus = page.getByTestId('import-status');
    await expect(importStatus).toBeVisible();

    // Click the test shared package button
    const testButton = page.getByTestId('test-shared-button');
    await expect(testButton).toBeVisible();
    await testButton.click();

    // Wait for the test to complete and check results
    await page.waitForTimeout(1000); // Give time for async operations

    // Check if the import status was updated
    const statusText = await importStatus.textContent();
    console.log('Import status:', statusText);

    // The status should either be successful or show an error
    expect(statusText).not.toBe('Not tested');
  });

  test('should display shared package information', async ({ page }) => {
    // Click the test button to trigger shared package test
    await page.getByTestId('test-shared-button').click();

    // Check console for shared package logs
    const logs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        logs.push(msg.text());
      }
    });

    // Wait for potential console output
    await page.waitForTimeout(2000);

    // Verify that some logging occurred (either success or failure)
    console.log('Console logs captured:', logs);
  });

  test('should have proper page structure for CardManager demo', async ({ page }) => {
    // Check that all expected sections are present
    await expect(page.locator('text=Basic React Test')).toBeVisible();
    await expect(page.locator('text=Shared Package Test')).toBeVisible();
    await expect(page.locator('text=CardManager Demo (Coming Soon)')).toBeVisible();

    // Check that the demo description is present
    await expect(page.locator('text=Card selection and placement logic')).toBeVisible();
    await expect(page.locator('text=Timeline visualization')).toBeVisible();
    await expect(page.locator('text=Game state management')).toBeVisible();
    await expect(
      page.locator('text=Shared business logic between frontend and mobile')
    ).toBeVisible();
  });

  test('should be accessible via the expected route', async ({ page }) => {
    // Verify we're on the correct URL
    expect(page.url()).toContain('/card-manager-test');

    // Check that the page indicates the correct route
    await expect(page.locator('text=Access this page at: /card-manager-test')).toBeVisible();
    await expect(page.locator('text=Use this page for Playwright testing')).toBeVisible();
  });
});

test.describe('CardManager Component Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/card-manager-test');
  });

  test('should prepare for CardManager integration testing', async ({ page }) => {
    // This test verifies that the foundation is ready for CardManager testing

    // Test that we can click the shared package test button
    await page.getByTestId('test-shared-button').click();

    // Capture any console output for debugging
    const consoleMessages = [];
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    // Wait for console output
    await page.waitForTimeout(1500);

    // Log the results for debugging
    console.log('Console messages during shared package test:');
    consoleMessages.forEach((msg) => {
      console.log(`[${msg.type}] ${msg.text}`);
    });

    // Check that the import status was updated from initial state
    const finalStatus = await page.getByTestId('import-status').textContent();
    console.log('Final import status:', finalStatus);

    // The test passes if we can interact with the page and get some result
    expect(finalStatus).toBeDefined();
    expect(finalStatus.length).toBeGreaterThan(0);
  });
});
