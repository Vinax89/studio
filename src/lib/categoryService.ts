// Utility functions for managing transaction categories stored in Firestore
// with a local cache for offline support. Categories are compared in a
// case-insensitive manner while preserving their original casing for display.

import { doc, getDocs, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db, categoriesCollection } from "./firebase";

const STORAGE_KEY = "categories";

// In non-browser environments (e.g. during testing) `localStorage` is not
// available. We keep an in-memory fallback so the functions still work.
let memoryStore: string[] = [];

const hasLocalStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

const normalize = (value: string) => value.trim().toLowerCase();

const INVALID_KEY_CHARS = /[./#$\[\]]/;
export const isValidCategoryName = (value: string) =>
  value.trim().length > 0 && !INVALID_KEY_CHARS.test(value);

function load(): string[] {
  if (hasLocalStorage()) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }
  return memoryStore;
}

function save(categories: string[]) {
  if (hasLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } else {
    memoryStore = [...categories];
  }
}

// Synchronize the local cache with Firestore in the background.
async function syncFromServer() {
  try {
    const snap = await getDocs(categoriesCollection);
    const list: string[] = [];
    snap.forEach((d) => {
      const data = d.data() as { name?: string };
      if (data.name) list.push(data.name);
    });
    save(list);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Return the list of categories with duplicates removed in a
 * case-insensitive manner. The first occurrence of a category determines
 * the casing that will be preserved for display.
 */
export function getCategories(): string[] {
  if (typeof window !== "undefined") {
    void syncFromServer();
  }
  const categories = load();
  const map = new Map<string, string>();
  for (const cat of categories) {
    const trimmed = cat.trim();
    if (!isValidCategoryName(trimmed)) continue;
    const key = normalize(trimmed);
    if (!map.has(key)) {
      map.set(key, trimmed);
    }
  }
  const unique = Array.from(map.values());
  // Persist the de-duplicated list
  save(unique);
  return unique;
}

/**
 * Add a category if it does not already exist (case-insensitive).
 * Returns the updated list of categories. Firestore writes are performed in
 * the background and failures are logged but do not interrupt the result.
 */
export function addCategory(category: string): string[] {
  const categories = getCategories();
  const trimmed = category.trim();
  if (!isValidCategoryName(trimmed)) {
    console.error('Invalid category name:', category);
    return categories;
  }
  const key = normalize(trimmed);
  const exists = categories.some((c) => normalize(c) === key);
  if (!exists) {
    categories.push(trimmed);
    save(categories);
  }
  void setDoc(doc(categoriesCollection, key), { name: trimmed }).catch(
    console.error
  );
  return categories;
}

/**
 * Remove a category regardless of casing. Returns the updated list. Firestore
 * writes are performed in the background.
 */
export function removeCategory(category: string): string[] {
  if (!isValidCategoryName(category)) {
    return getCategories();
  }
  const key = normalize(category);
  const categories = getCategories().filter((c) => normalize(c) !== key);
  save(categories);
  void deleteDoc(doc(categoriesCollection, key)).catch(console.error);
  return categories;
}

/** Clear all categories locally and in Firestore. */
export function clearCategories() {
  save([]);
  void (async () => {
    try {
      const snap = await getDocs(categoriesCollection);
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  })();
}

