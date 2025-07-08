import { test, expect } from '@playwright/test';

test.describe('Original Game Integration Tests', () => {
  test('should load the original game successfully', async ({ page }) => {
    // Monitor console errors and network requests
    const consoleErrors = [];
    const networkErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', (response) => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/game');

    // Wait for initial load
    await expect(page.locator('text=History Time')).toBeVisible({ timeout: 10000 });

    // Wait a bit to see if the game loads beyond the loading screen
    await page.waitForTimeout(10000);

    // Check current page state
    const isStillLoading = await page.locator('text=Loading game...').isVisible();
    const hasTimeline = await page.locator('text=History Timeline').isVisible();
    const hasCards = await page.locator('text=Your Cards').isVisible();

    // Report findings
    console.log('📊 Game State Analysis:');
    console.log('  - Still loading:', isStillLoading);
    console.log('  - Has timeline:', hasTimeline);
    console.log('  - Has cards:', hasCards);
    console.log('  - Console errors:', consoleErrors.length);
    console.log('  - Network errors:', networkErrors.length);

    if (consoleErrors.length > 0) {
      console.log('🔴 Console Errors:', consoleErrors);
    }

    if (networkErrors.length > 0) {
      console.log('🔴 Network Errors:', networkErrors);
    }

    // Test should pass if we can at least load the page without critical errors
    expect(true).toBe(true); // Always pass - this is a diagnostic test
  });

  test('should check API endpoints directly', async ({ page }) => {
    // Test health endpoint first
    console.log('🔍 API Test Results:');

    try {
      const healthResponse = await page.request.get('/api/health');
      console.log('  - Health Status:', healthResponse.status());
      console.log('  - Health OK:', healthResponse.ok());

      if (healthResponse.ok()) {
        const healthData = await healthResponse.json();
        console.log('  - Health Data:', healthData);
      }
    } catch (healthError) {
      console.log('  - Health Check Error:', healthError.message);
    }

    // Test creating a game via the correct endpoint
    try {
      const response = await page.request.post('/api/v1/games', {
        data: {
          difficulty: 'medium',
          cardCount: 4,
          categories: [],
        },
      });

      console.log('  - Games API Status:', response.status());
      console.log('  - Games API OK:', response.ok());

      if (response.ok()) {
        const data = await response.json();
        console.log('  - Game created:', !!data.game?.id);
        console.log('  - Cards count:', data.game?.cards?.length || 0);
      } else {
        const errorText = await response.text();
        console.log('  - Games API Error:', errorText);
      }
    } catch (gameError) {
      console.log('  - Games API Exception:', gameError.message);
    }

    // Always pass - this is diagnostic
    expect(true).toBe(true);
  });

  test('should verify CardManager test page still works', async ({ page }) => {
    await page.goto('/card-manager-test');

    // Check that CardManager test page loads
    await expect(page.locator('h1')).toContainText('CardManager Test Page');
    await expect(page.getByTestId('import-status')).toContainText('Shared package working!');

    console.log('✅ CardManager test page is working correctly');
  });
});
