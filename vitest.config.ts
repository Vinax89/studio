import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./jest.setup.ts'],
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  },
})
