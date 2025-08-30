// Utility functions for managing transaction categories stored in Firestore
// with a local cache for offline support. Categories are compared in a
// case-insensitive manner while preserving their original casing for display.

import { doc, getDocs, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db, categoriesCollection, initFirebase } from "./firebase";
import { logger } from "./logger";

initFirebase();

const STORAGE_KEY = "categories";

// In non-browser environments (e.g. during testing) `localStorage` is not
// available. We keep an in-memory fallback so the functions still work.
let memoryStore: string[] = [];

const hasLocalStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

const normalize = (value: string) => value.trim().toLowerCase();

const isValidKey = (key: string) => key.length > 0 && !/[/*[\]]/.test(key);

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

// Track the last sync attempt so callers can await its completion.
let pendingSync: Promise<void> | null = null;

// Synchronize the local cache with Firestore.
async function syncFromServer() {
  const snap = await getDocs(categoriesCollection);
  const list: string[] = [];
  snap.forEach((d) => {
    const data = d.data() as { name?: string };
    if (data.name) list.push(data.name);
  });
  save(list);
}

/**
 * Exposed sync function so callers can await completion and handle errors.
 * Retries with exponential backoff when requested.
 */
export async function syncCategories(retries = 0): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    try {
      await syncFromServer();
      return;
    } catch (err) {
      if (attempt >= retries) throw err;
      // exponential backoff: 500ms, 1s, 2s, ...
      const delay = 500 * Math.pow(2, attempt);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

/** Retrieve the promise for the most recent background sync. */
export function waitForCategorySync(): Promise<void> | null {
  return pendingSync;
}

/**
 * Return the list of categories with duplicates removed in a
 * case-insensitive manner. The first occurrence of a category determines
 * the casing that will be preserved for display.
 */
export function getCategories(): string[] {
  if (typeof window !== "undefined") {
    pendingSync = syncCategories(3).catch((err) => {
      logger.warn("Failed to sync categories", err);
      throw err;
    });
  }
  const categories = load();
  const map = new Map<string, string>();
  for (const cat of categories) {
    const trimmed = cat.trim();
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
  const key = normalize(trimmed);
  if (!isValidKey(key)) {
    logger.error("Invalid category name");
    return categories;
  }
  const exists = categories.some((c) => normalize(c) === key);
  if (!exists) {
    categories.push(trimmed);
    void setDoc(doc(categoriesCollection, key), { name: trimmed }).catch((err) =>
      logger.error("Failed to save category", err)
    );
  }
  save(categories);
  return categories;
}

/**
 * Remove a category regardless of casing. Returns the updated list. Firestore
 * writes are performed in the background.
 */
export function removeCategory(category: string): string[] {
  const key = normalize(category);
  if (!isValidKey(key)) {
    logger.error("Invalid category name");
    return getCategories();
  }
  const categories = getCategories().filter((c) => normalize(c) !== key);
  save(categories);
  void deleteDoc(doc(categoriesCollection, key)).catch((err) =>
    logger.error("Failed to delete category", err)
  );
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
      logger.error("Failed to clear categories", err);
    }
  })();
}

