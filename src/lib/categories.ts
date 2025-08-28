export const CATEGORY_STORAGE_KEY = "categories";

export const seedCategories = [
  "Salary",
  "Uniforms",
  "Food",
  "Certifications",
  "Loans",
  "Transport",
  "Housing"
];

function readStorage(): string[] | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as string[] : null;
  } catch {
    return null;
  }
}

function writeStorage(categories: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

export function getCategories(): string[] {
  const stored = readStorage();
  if (stored) {
    return stored;
  }
  writeStorage(seedCategories);
  return [...seedCategories];
}

export function addCategory(category: string): void {
  const categories = getCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    writeStorage(categories);
  }
}

export function updateCategory(oldCategory: string, newCategory: string): void {
  const categories = getCategories();
  const index = categories.indexOf(oldCategory);
  if (index !== -1) {
    categories[index] = newCategory;
    writeStorage(categories);
  }
}

export function deleteCategory(category: string): void {
  const categories = getCategories().filter((c) => c !== category);
  writeStorage(categories);
}
