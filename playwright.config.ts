import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'cross-env NEXT_PUBLIC_FIREBASE_API_KEY=1 NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=demo NEXT_PUBLIC_FIREBASE_APP_ID=demo npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
