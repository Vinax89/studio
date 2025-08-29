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
  let addCategory: typeof import("@/lib/categoryService").addCategory;
  let getCategories: typeof import("@/lib/categoryService").getCategories;
  let removeCategory: typeof import("@/lib/categoryService").removeCategory;
  let clearCategories: typeof import("@/lib/categoryService").clearCategories;

  beforeAll(async () => {
    ({ addCategory, getCategories, removeCategory, clearCategories } = await import("@/lib/categoryService"));
  });

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
});

