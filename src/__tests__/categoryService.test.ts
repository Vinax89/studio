import { addCategory, getCategories, removeCategory, clearCategories } from "@/lib/categoryService";

jest.mock("@/lib/firebase", () => ({ db: {}, categoriesCollection: {} }));

const mockSetDoc = jest.fn().mockResolvedValue(undefined);
const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
const mockGetDocs = jest.fn().mockResolvedValue({ forEach: () => {} });
const mockWriteBatch = jest.fn(() => ({ delete: jest.fn(), commit: jest.fn().mockResolvedValue(undefined) }));
const mockDoc = jest.fn(() => ({}));

jest.mock("firebase/firestore", () => ({
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  writeBatch: (...args: unknown[]) => mockWriteBatch(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
}));

describe("categoryService validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCategories();
  });

  it("ignores invalid category names when adding", () => {
    addCategory("");
    addCategory("has/slash");
    expect(getCategories()).toEqual([]);
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it("ignores invalid category names when removing", () => {
    addCategory("Food");
    removeCategory("");
    removeCategory("bad/slash");
    expect(getCategories()).toEqual(["Food"]);
    expect(mockDeleteDoc).not.toHaveBeenCalled();
  });

  it("does not write to Firestore when category already exists", () => {
    addCategory("Groceries");
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    addCategory("groceries");
    expect(getCategories()).toEqual(["Groceries"]);
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
  });
});
