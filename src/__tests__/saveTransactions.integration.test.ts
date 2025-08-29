import { saveTransactions } from "../lib/transactions";
import type { Transaction } from "../lib/types";

jest.mock("../lib/firebase", () => ({ db: {} }));

const store = new Map<string, Transaction>();

function mockCollection(_db: unknown, name: string) {
  return { name } as const;
}

function mockDoc(col: { name: string }, id: string) {
  return { col: col.name, id };
}

function mockWriteBatch(_db: unknown) {
  const ops: { ref: { id: string }; data: Transaction }[] = [];
  return {
    set(ref: { id: string }, data: Transaction) {
      ops.push({ ref, data });
    },
    async commit() {
      ops.forEach(({ ref, data }) => {
        store.set(ref.id, data);
      });
    },
  };
}

jest.mock("firebase/firestore", () => ({
  collection: mockCollection,
  doc: mockDoc,
  writeBatch: mockWriteBatch,
}));

describe("saveTransactions integration", () => {
  beforeEach(() => {
    store.clear();
  });

  it("overwrites existing documents with the same id", async () => {
    const tx: Transaction = {
      id: "t1",
      date: "2024-01-01",
      description: "first",
      amount: 100,
      type: "Income",
      category: "Misc",
      currency: "USD",
      isRecurring: false,
    };

    await saveTransactions([tx]);
    const updated = { ...tx, description: "updated" };
    await saveTransactions([updated]);

    expect(store.size).toBe(1);
    expect(store.get("t1")?.description).toBe("updated");
  });
});
