import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Provide a minimal fetch polyfill for tests that expect it
(global as any).fetch = jest.fn(() =>
  Promise.resolve({
    json: async () => ({}),
  })
);
// Stub out basic Response/Request/Headers constructors if missing
if (typeof (global as any).Response === 'undefined') {
  (global as any).Response = class {};
}
if (typeof (global as any).Request === 'undefined') {
  (global as any).Request = class {};
}
if (typeof (global as any).Headers === 'undefined') {
  (global as any).Headers = class {};
}

// Ensure Response.json helper exists for NextResponse.json in tests
if (typeof (global as any).Response.json !== 'function') {
  (global as any).Response.json = (data: any, init?: any) =>
    new (global as any).Response(JSON.stringify(data), init);
}

// Stub Firebase environment variables expected by zod validation
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test';
