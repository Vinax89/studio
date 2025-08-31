import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { TextEncoder, TextDecoder } from 'node:util'

// Stub all icons from lucide-react to empty components
vi.mock(
  'lucide-react',
  () => new Proxy({}, { get: () => () => null })
)

Object.assign(globalThis as any, { TextEncoder, TextDecoder })

// Provide a minimal fetch polyfill for tests that expect it
;(global as any).fetch = vi.fn(() =>
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
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
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

// Provide Jest compatibility for existing tests
// eslint-disable-next-line no-var
var jest = Object.assign(vi, { requireActual: vi.importActual })
globalThis.jest = jest
