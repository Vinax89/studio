import { saveTransactions } from "../lib/transactions";
import type { Transaction } from "../lib/types";
import { Timestamp } from "firebase/firestore";

jest.mock("../lib/firebase", () => ({ db: {}, initFirebase: jest.fn() }));
import { initFirebase } from "../lib/firebase";

beforeAll(() => {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test";
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test";
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test";
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test";
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test";
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test";
  initFirebase();
});

const store = new Map<string, Transaction>();

function mockCollection(_db: unknown, name: string) {
  return { name } as const;
}

function mockDoc(col: { name: string }, id: string) {
  return { col: col.name, id };
}

function mockWriteBatch() {
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

jest.mock("firebase/firestore", () => {
  class MockTimestamp {
    constructor(public seconds: number, public nanoseconds: number) {}
    static fromDate(date: Date) {
      const ms = date.getTime();
      return new MockTimestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
    }
    toDate() {
      return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
    }
    toMillis() {
      return this.seconds * 1000 + this.nanoseconds / 1e6;
    }
  }
  return {
    collection: mockCollection,
    doc: mockDoc,
    writeBatch: mockWriteBatch,
    Timestamp: MockTimestamp,
  };
});

describe("saveTransactions integration", () => {
  beforeEach(() => {
    store.clear();
  });

  it("stores documents under their transaction ids", async () => {
    const txs: Transaction[] = [
      {
        id: "a1",
        date: Timestamp.fromDate(new Date("2024-01-01")),
        description: "one",
        amount: 1,
        type: "Income",
        category: "Misc",
        currency: "USD",
        isRecurring: false,
      },
      {
        id: "a2",
        date: Timestamp.fromDate(new Date("2024-01-02")),
        description: "two",
        amount: 2,
        type: "Expense",
        category: "Misc",
        currency: "USD",
        isRecurring: false,
      },
    ];

    await saveTransactions(txs);

    expect(Array.from(store.keys()).sort()).toEqual(["a1", "a2"]);
  });

  it("overwrites existing documents with the same id", async () => {
    const tx: Transaction = {
      id: "t1",
      date: Timestamp.fromDate(new Date("2024-01-01")),
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
