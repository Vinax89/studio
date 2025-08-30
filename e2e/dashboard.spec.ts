import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'password';

test('logs in and shows a chart', async ({ page }) => {
  await page.route('https://identitytoolkit.googleapis.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        idToken: 'test-token',
        email: TEST_EMAIL,
        refreshToken: 'fake-refresh',
        expiresIn: '3600',
        localId: '123',
        registered: true,
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Email').fill(TEST_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(500);
  await page.goto('/dashboard');
  const chartLocator = page.locator('svg, canvas');
  await expect(chartLocator).not.toHaveCount(0);
});
