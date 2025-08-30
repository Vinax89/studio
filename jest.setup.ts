import '@testing-library/jest-dom'
import { jest } from '@jest/globals'
import { TextEncoder, TextDecoder } from 'node:util'

Object.assign(
  globalThis as unknown as { TextEncoder: typeof TextEncoder; TextDecoder: typeof TextDecoder },
  { TextEncoder, TextDecoder }
)

// Provide a minimal fetch polyfill for tests that expect it
const globalMocks = globalThis as unknown as {
  fetch: jest.Mock
  Response?: typeof Response
  Request?: typeof Request
  Headers?: typeof Headers
}

globalMocks.fetch = jest.fn(() =>
  Promise.resolve({
    json: async () => ({}),
  })
)

// Stub out basic Response/Request/Headers constructors if missing
if (typeof globalMocks.Response === 'undefined') {
  globalMocks.Response = class {} as typeof Response
}
if (typeof globalMocks.Request === 'undefined') {
  globalMocks.Request = class {} as typeof Request
}
if (typeof globalMocks.Headers === 'undefined') {
  globalMocks.Headers = class {} as typeof Headers
}

// Stub Firebase environment variables expected by zod validation
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test'
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test'
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test'
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test'
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test'
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test'
