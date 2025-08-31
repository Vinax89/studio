import '@testing-library/jest-dom'
import { jest } from '@jest/globals'
import { TextEncoder, TextDecoder } from 'node:util'

// Stub all icons from lucide-react to empty components
jest.mock(
  'lucide-react',
  () =>
    new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === '__esModule') return true
          return () => null
        },
      },
    ),
)

Object.assign(globalThis as any, { TextEncoder, TextDecoder })


// Provide a minimal fetch polyfill for tests that expect it
;(global as any).fetch = jest.fn(() =>
  Promise.resolve({
    json: async () => ({}),
  })
)
// Stub out basic Response/Request/Headers constructors if missing
if (typeof (global as any).Response === 'undefined') {
  (global as any).Response = class {}
}
if (typeof (global as any).Request === 'undefined') {
  (global as any).Request = class {}
}
if (typeof (global as any).Headers === 'undefined') {
  (global as any).Headers = class {}
}

// Provide a stub for matchMedia expected by some components
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Stub Firebase environment variables expected by zod validation
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test'
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test'
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test'
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test'
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test'
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test'
