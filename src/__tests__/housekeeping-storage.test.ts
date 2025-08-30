/**
 * @jest-environment node
 */
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { runHousekeeping } from '@/lib/housekeeping';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test',
    firestore: { host: '127.0.0.1', port: 8080, rules: '' },
    storage: { host: '127.0.0.1', port: 9199, rules: '' },
  });

  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
  process.env.HOUSEKEEPING_BUCKET = 'housekeeping-test';
  process.env.RETENTION_DAYS = '0';
  initializeApp({ projectId: 'test', storageBucket: 'housekeeping-test' });
});

afterAll(async () => {
  await testEnv.cleanup();
  await Promise.all(getApps().map((a) => a.delete()));
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
});

test('removes old files and metadata', async () => {
  const bucket = getStorage().bucket('housekeeping-test');
  await bucket.file('old.txt').save('data');
  const db = getFirestore();
  await db.collection('backups').doc('old.txt').set({ createdAt: new Date(0).toISOString() });

  await runHousekeeping();

  const [exists] = await bucket.file('old.txt').exists();
  expect(exists).toBe(false);
  const snap = await db.collection('backups').doc('old.txt').get();
  expect(snap.exists).toBe(false);
});

test('keeps recent files', async () => {
  process.env.RETENTION_DAYS = '30';
  const bucket = getStorage().bucket('housekeeping-test');
  await bucket.file('new.txt').save('data');
  const db = getFirestore();
  await db.collection('backups').doc('new.txt').set({ createdAt: new Date().toISOString() });

  await runHousekeeping();

  const [exists] = await bucket.file('new.txt').exists();
  expect(exists).toBe(true);
  const snap = await db.collection('backups').doc('new.txt').get();
  expect(snap.exists).toBe(true);
});
