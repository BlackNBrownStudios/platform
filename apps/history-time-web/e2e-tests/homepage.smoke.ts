import { test, expect } from '@playwright/test';

test('homepage loads & shows title', async ({ page }) => {
  await page.goto('/');
  // Wait for body to render
  await expect(page).toHaveTitle(/History Time/i);
  // Basic sanity: ensure header or main element exists
  await expect(page.locator('main')).toBeVisible();
});
