import '@testing-library/jest-dom'
import { jest } from '@jest/globals'
import { TextEncoder, TextDecoder } from 'node:util'

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

// Stub Firebase module to avoid compiling the real implementation during tests
jest.mock('@/lib/firebase', () => ({}))

// Basic Firestore mocks so modules depending on firebase/firestore don't fail during tests
jest.mock('firebase/firestore', () => ({
  collection: () => ({ withConverter: () => ({}) }),
  doc: () => ({ withConverter: () => ({}) }),
  onSnapshot: (_ref: any, cb: any) => { cb({ docs: [] }); return () => {}; },
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
}))

// Stub Firebase environment variables expected by zod validation
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test'
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test'
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test'
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test'
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test'
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test'
