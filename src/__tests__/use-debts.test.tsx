import React from "react";
import { render, act } from "@testing-library/react";
import { useDebts } from "@/lib/debts/use-debts";

// Mock logger to silence output
jest.mock("@/lib/logger", () => ({ logger: { error: jest.fn() } }));
// Mock debts index module
jest.mock("@/lib/debts", () => ({
  debtsCollection: {},
  debtDoc: (id: string) => ({ id })
}));

const onSnapshotMock = jest.fn();
const deleteDocMock = jest.fn();

jest.mock("firebase/firestore", () => ({
  onSnapshot: (...args: unknown[]) => onSnapshotMock(...args),
  setDoc: jest.fn(),
  deleteDoc: (...args: unknown[]) => deleteDocMock(...args),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
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
