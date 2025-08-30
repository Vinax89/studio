import { test, expect } from '@playwright/test';

test('displays the login form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('form')).toBeVisible();
});
