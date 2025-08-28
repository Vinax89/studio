// Utility functions for managing transaction categories
// Categories are compared in a case-insensitive manner while preserving
// the original casing for display purposes.

const STORAGE_KEY = "categories";

// In non-browser environments (e.g. during testing) `localStorage` is not
// available.  We keep an in-memory fallback so the functions still work.
let memoryStore: string[] = [];

const hasLocalStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

const normalize = (value: string) => value.trim().toLowerCase();

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

/**
 * Return the list of categories with duplicates removed in a
 * case-insensitive manner. The first occurrence of a category determines
 * the casing that will be preserved for display.
 */
export function getCategories(): string[] {
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
 * Returns the updated list of categories.
 */
export function addCategory(category: string): string[] {
  const categories = getCategories();
  const trimmed = category.trim();
  const key = normalize(trimmed);
  const exists = categories.some((c) => normalize(c) === key);
  if (!exists) {
    categories.push(trimmed);
    save(categories);
  }
  return categories;
}

/**
 * Remove a category regardless of casing. Returns the updated list.
 */
export function removeCategory(category: string): string[] {
  const key = normalize(category);
  const categories = getCategories().filter(
    (c) => normalize(c) !== key
  );
  save(categories);
  return categories;
}

/** Clear all categories. */
export function clearCategories() {
  save([]);
}

