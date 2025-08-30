import { test, expect } from '@playwright/test';

test('renders dashboard chart', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Income vs. Expenses' })).toBeVisible();
});
