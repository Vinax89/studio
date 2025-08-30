module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.test.json' },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!lucide-react|d3-.*|recharts|embla-carousel-react)',
  ],
};
