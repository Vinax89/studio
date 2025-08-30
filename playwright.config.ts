import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'test',
      NODE_ENV: 'test',
    },
  },
});
