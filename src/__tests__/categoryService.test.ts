jest.mock("@/lib/firebase", () => ({ db: {}, categoriesCollection: {} }));

const mockSetDoc = jest.fn().mockResolvedValue(undefined);
const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
const mockGetDocs = jest.fn().mockResolvedValue({ forEach: () => {} });
const mockWriteBatch = jest.fn(() => ({
  delete: jest.fn(),
  commit: jest.fn().mockResolvedValue(undefined),
}));
const mockDoc = jest.fn(() => ({}));

jest.mock("firebase/firestore", () => ({
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  writeBatch: (...args: unknown[]) => mockWriteBatch(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
}));

describe("categoryService validation", () => {
  let addCategory: typeof import("@/lib/categoryService").addCategory;
  let getCategories: typeof import("@/lib/categoryService").getCategories;
  let removeCategory: typeof import("@/lib/categoryService").removeCategory;
  let clearCategories: typeof import("@/lib/categoryService").clearCategories;

  beforeAll(async () => {
    ({ addCategory, getCategories, removeCategory, clearCategories } =
      await import("@/lib/categoryService"));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    clearCategories();
  });

  it("rejects categories with illegal Firestore characters", () => {
    addCategory("Food/Drink");
    addCategory("Bad[Cat]");
    expect(getCategories()).toEqual([]);
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it("ignores removal of invalid category names", () => {
    addCategory("Groceries");
    removeCategory("");
    removeCategory("Bad[Cat]");
    expect(getCategories()).toEqual(["Groceries"]);
    expect(mockDeleteDoc).not.toHaveBeenCalled();
  });

  it("retries Firestore write when category already exists case-insensitively", () => {
    addCategory("Groceries");
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    addCategory("groceries");
    expect(getCategories()).toEqual(["Groceries"]);
    expect(mockSetDoc).toHaveBeenCalledTimes(2);
    expect(mockSetDoc.mock.calls[1][1]).toEqual({ name: "Groceries" });
  });

  it("retries Firestore write for duplicate category with same casing", () => {
    addCategory("Utilities");
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    addCategory("Utilities");
    expect(mockSetDoc).toHaveBeenCalledTimes(2);
  });
});
