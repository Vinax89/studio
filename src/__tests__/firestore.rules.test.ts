/** @jest-environment node */
import { readFileSync } from 'fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import nodeFetch from 'node-fetch';

(global as any).fetch = nodeFetch as any;

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

(emulatorHost ? describe : describe.skip)('Firestore security rules', () => {
  let testEnv: RulesTestEnvironment;
  const collections = ['debts', 'bnplPlans', 'obligations', 'budgets', 'goals'];

  beforeAll(async () => {
    const [fsHost, fsPortStr] = emulatorHost.split(':');
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-test',
      firestore: {
        host: fsHost,
        port: Number(fsPortStr),
        rules: readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  collections.forEach((col) => {
    it(`denies non-owner read/write for ${col}`, async () => {
      const ownerDb = testEnv.authenticatedContext('user1').firestore();
      const otherDb = testEnv.authenticatedContext('user2').firestore();
      const docRef = doc(ownerDb, col, 'doc1');
      await assertSucceeds(setDoc(docRef, { userId: 'user1' }));
      await assertFails(getDoc(doc(otherDb, col, 'doc1')));
      await assertFails(setDoc(doc(otherDb, col, 'doc1'), { userId: 'user2' }));
      await assertFails(setDoc(doc(otherDb, col, 'doc2'), { userId: 'user1' }));
    });
  });
});
