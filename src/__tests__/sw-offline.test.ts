/** @jest-environment node */
import { readFileSync } from 'fs';
import { join } from 'path';
import { runInNewContext } from 'vm';

let fetchHandler: ((event: any) => void) | undefined;
let openDB: any;

beforeAll(async () => {
  const listeners: Record<string, any> = {};
  (global as any).self = {
    addEventListener: (name: string, cb: any) => {
      listeners[name] = cb;
    },
  };

  require('fake-indexeddb/auto');

  const swPath = join(__dirname, '../../public/sw.js');
  ({ openDB } = await import('idb'));
  const source = readFileSync(swPath, 'utf8').replace(/^import[^\n]+\n/, '');
  runInNewContext(source, {
    self: global.self,
    openDB,
    Response: global.Response,
    Request: global.Request,
    fetch: (...args: any[]) => (global as any).fetch(...args),
  });
  fetchHandler = listeners['fetch'];
});

it('queues POST requests when offline', async () => {
  expect(fetchHandler).toBeDefined();
  const request = new Request('http://localhost/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: 1 }),
  });

  const respondWith = jest.fn();
  (global as any).fetch = jest
    .fn()
    .mockRejectedValue(new TypeError('Failed to fetch'));

  fetchHandler!({ request, respondWith });

  const response: Response = await respondWith.mock.calls[0][0];
  expect(response.status).toBe(202);

  const db = await openDB('offline-db', 1);
  const records = await db.getAll('transactions');
  expect(records).toHaveLength(1);
});
