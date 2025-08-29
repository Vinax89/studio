jest.mock('firebase/firestore', () => ({
  collection: () => ({ withConverter: () => ({}) }),
  doc: () => ({ withConverter: () => ({}) }),
  onSnapshot: (_ref: any, cb: any) => { cb({ docs: [] }); return () => {}; },
  setDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  getDocs: jest.fn(async () => ({ forEach: () => {} })),
  writeBatch: () => ({ delete: jest.fn(), commit: jest.fn() }),
}));

import { addCategory, getCategories, clearCategories, isValidCategoryName } from '@/lib/categoryService';

describe('categoryService', () => {
  beforeEach(() => {
    clearCategories();
  });

  it('rejects invalid category names', () => {
    addCategory('Food');
    addCategory('bad/category');
    addCategory('bad.name');
    expect(getCategories()).toEqual(['Food']);
  });

  it('validates category names', () => {
    expect(isValidCategoryName('Valid')).toBe(true);
    expect(isValidCategoryName('invalid#name')).toBe(false);
  });
});
