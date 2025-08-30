module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\\.[tj]sx?$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.test.json', useESM: true },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!lucide-react|d3-.*|recharts|embla-carousel-react)",
  ],
};
