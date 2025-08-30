module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
    '^.+\\\.(js|jsx|mjs|cjs)$': ['babel-jest', { plugins: ['@babel/plugin-transform-modules-commonjs'] }],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!lucide-react|d3-.*|recharts|embla-carousel-react)",
  ],
};
