import React from "react";
import { render, act } from "@testing-library/react";
import { useDebts } from "@/lib/debts/use-debts";
import type {
  onSnapshot as firestoreOnSnapshot,
  deleteDoc as firestoreDeleteDoc,
} from "firebase/firestore";

// Mock logger to silence output
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
// Mock debts index module
vi.mock("@/lib/debts", () => ({
  debtsCollection: {},
  debtDoc: (id: string) => ({ id })
}));

const onSnapshotMock = vi.fn();
const deleteDocMock = vi.fn();

vi.mock("firebase/firestore", () => ({
  onSnapshot: (
    ...args: Parameters<typeof firestoreOnSnapshot>
  ): ReturnType<typeof firestoreOnSnapshot> =>
    onSnapshotMock(...args),
  setDoc: vi.fn(),
  deleteDoc: (
    ...args: Parameters<typeof firestoreDeleteDoc>
  ): ReturnType<typeof firestoreDeleteDoc> =>
    deleteDocMock(...args),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
}));

describe("useDebts", () => {
  beforeEach(() => {
    onSnapshotMock.mockReset();
    deleteDocMock.mockReset();
  });

  it("exposes subscription errors", () => {
    const err = new Error("subscribe failed");
    onSnapshotMock.mockImplementation((_col, _onNext, onError) => {
      onError(err);
      return () => {};
    });

    let result: ReturnType<typeof useDebts>;
    function TestComponent() {
      result = useDebts();
      return null;
    }
    render(<TestComponent />);
    expect(result.error).toBe(err);
  });

  it("captures errors from operations", async () => {
    // Successful subscription
    onSnapshotMock.mockImplementation((_col, onNext) => {
      onNext({ docs: [] });
      return () => {};
    });
    const err = new Error("delete failed");
    deleteDocMock.mockRejectedValue(err);

    let result: ReturnType<typeof useDebts>;
    function TestComponent() {
      result = useDebts();
      return null;
    }
    render(<TestComponent />);

    await act(async () => {
      await result.deleteDebt("1");
    });

    expect(result.error).toBe(err);
  });
});
