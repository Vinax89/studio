import { test, expect } from '@playwright/test';

test('renders income and expense chart for authenticated user', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('firebase:authUser:1:[DEFAULT]', JSON.stringify({ uid: 'test-user' }));
  });
  await page.goto('/dashboard');
  await expect(page.getByText('Income vs. Expenses')).toBeVisible();
});
