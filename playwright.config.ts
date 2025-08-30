import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'test',
      OPENAI_API_KEY: 'test',
    },
  },
});
