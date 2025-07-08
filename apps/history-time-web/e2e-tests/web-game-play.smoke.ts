import { test, expect } from '@playwright/test';

test('web-game-play – start a game and navigate to game page', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Verify page loads correctly
  await expect(page).toHaveTitle(/History Time/i);

  // Start a game - look for the start game button
  const startButton = page.getByRole('button', { name: /start.*game/i });
  await expect(startButton).toBeVisible();
  await startButton.click();

  // Wait for navigation to game page
  await page.waitForURL('**/game**');

  // Verify we're on the game page - use first() since there might be multiple h1 elements
  await expect(page.locator('h1:has-text("History Time")').first()).toBeVisible();

  // Verify the URL contains game parameters
  const url = page.url();
  expect(url).toContain('/game');
  expect(url).toContain('difficulty=');
  expect(url).toContain('cards=');

  console.log('✅ Successfully navigated to game page');
});
