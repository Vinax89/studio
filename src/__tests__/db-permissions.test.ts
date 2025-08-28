jest.mock('../lib/firebase', () => ({
  auth: { currentUser: null }
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({ data: () => ({}) }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined)
}));

import { auth } from '../lib/firebase';
import { getDocument } from '../lib/db';

describe('db utilities permissions', () => {
  it('rejects unauthenticated access', async () => {
    (auth as any).currentUser = null;
    await expect(getDocument('test/doc')).rejects.toThrow('Unauthenticated');
  });

  it('rejects missing claim', async () => {
    (auth as any).currentUser = {
      getIdTokenResult: jest.fn().mockResolvedValue({ claims: {} })
    };
    await expect(getDocument('test/doc')).rejects.toThrow('Unauthorized');
  });

  it('allows when claim present', async () => {
    (auth as any).currentUser = {
      getIdTokenResult: jest.fn().mockResolvedValue({ claims: { read: true } })
    };
    await expect(getDocument('test/doc')).resolves.toBeDefined();
  });
});
