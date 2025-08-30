import { addCategory, getCategories, removeCategory, clearCategories } from "@/lib/categoryService";
import { setDoc, deleteDoc } from "firebase/firestore";

jest.mock("@/lib/firebase", () => ({ db: {}, categoriesCollection: {} }));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  getDocs: jest.fn(async () => ({ forEach: () => {} })),
  writeBatch: jest.fn(() => ({ delete: jest.fn(), commit: jest.fn() })),
}));

describe("categoryService validation", () => {
  beforeEach(() => {
    clearCategories();
    jest.clearAllMocks();
  });

  it("rejects categories with illegal Firestore characters", () => {
    addCategory("Food/Drink");
    addCategory("Bad[Cat]");
    expect(getCategories()).toEqual([]);
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("ignores removal of invalid category names", () => {
    addCategory("Groceries");
    removeCategory("");
    removeCategory("Bad[Cat]");
    expect(getCategories()).toEqual(["Groceries"]);
    expect(deleteDoc).not.toHaveBeenCalled();
  });

  it("writes to Firestore when category already exists case-insensitively", () => {
    addCategory("Groceries");
    expect(setDoc).toHaveBeenCalledTimes(1);
    addCategory("groceries");
    expect(getCategories()).toEqual(["Groceries"]);
    expect(setDoc).toHaveBeenCalledTimes(2);
  });

  it("writes to Firestore for duplicate category with same casing", () => {
    addCategory("Utilities");
    expect(setDoc).toHaveBeenCalledTimes(1);
    addCategory("Utilities");
    expect(setDoc).toHaveBeenCalledTimes(2);
  });
});
