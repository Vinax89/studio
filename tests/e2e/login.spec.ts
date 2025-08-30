import { test, expect } from '@playwright/test';

test('displays login form', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
});
