import { addCategory, getCategories, removeCategory, clearCategories } from "@/lib/categoryService";
import { setDoc, deleteDoc } from "firebase/firestore";
import { logger } from "@/lib/logger";

vi.mock("@/lib/firebase", () => ({
  db: {},
  categoriesCollection: {},
  initFirebase: vi.fn(),
}));
import { initFirebase } from "@/lib/firebase";

beforeAll(() => {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test";
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test";
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test";
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test";
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test";
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test";
  initFirebase();
});

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  getDocs: vi.fn(async () => ({ forEach: () => {} })),
  writeBatch: vi.fn(() => ({ delete: vi.fn(), commit: vi.fn() })),
}));

describe("categoryService", () => {
  beforeEach(() => {
    clearCategories();
    vi.clearAllMocks();
  });

  it("rejects categories with illegal Firestore characters", () => {
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    addCategory("Food/Drink");
    expect(getCategories()).toEqual([]);
    expect(setDoc).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("Invalid category name");
    errorSpy.mockRestore();
  });

  it("ignores removal of invalid category names", () => {
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    addCategory("Groceries");
    removeCategory("Bad[Cat]");
    expect(getCategories()).toEqual(["Groceries"]);
    expect(deleteDoc).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("Invalid category name");
    errorSpy.mockRestore();
  });

  it("does not write to Firestore when category already exists", () => {
    addCategory("Groceries");
    expect(setDoc).toHaveBeenCalledTimes(1);
    addCategory("groceries");
    expect(getCategories()).toEqual(["Groceries"]);
    expect(setDoc).toHaveBeenCalledTimes(1);
  });

  it("does not write to Firestore for duplicate category with same casing", () => {
    addCategory("Utilities");
    expect(setDoc).toHaveBeenCalledTimes(1);
    addCategory("Utilities");
    expect(setDoc).toHaveBeenCalledTimes(1);
  });
});
