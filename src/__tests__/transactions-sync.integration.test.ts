/**
 * @jest-environment node
 */
import type { Transaction } from "@/lib/types";

jest.mock("@/lib/firebase", () => ({ db: {} }));

const store = new Map<string, Transaction>();
let failCommit = false;
const categories = new Set(["Misc"]);

function mockCollection(_db: unknown, name: string) {
  return { name } as const;
}

function mockDoc(col: { name: string }, id: string) {
  return { ...col, id };
}

function mockWriteBatch() {
  const ops: { ref: { name: string; id: string }; data: Transaction }[] = [];
  return {
    set(ref: { name: string; id: string }, data: Transaction) {
      ops.push({ ref, data });
    },
    async commit() {
      if (failCommit) {
        throw new Error("batch commit failed");
      }
      ops.forEach(({ ref, data }) => {
        if (ref.name === "transactions") {
          store.set(ref.id, data);
        }
      });
    },
  };
}

async function mockGetDocs(col: { name: string }) {
  if (col.name === "categories") {
    return {
      docs: Array.from(categories).map((id) => ({ id })),
    };
  }
  return { docs: [] };
}

jest.mock("firebase/firestore", () => ({
  collection: mockCollection,
  doc: mockDoc,
  writeBatch: mockWriteBatch,
  getDocs: mockGetDocs,
}));

import { POST as transactionsSync } from "@/app/api/transactions/sync/route";

const sample = {
  id: "t1",
  date: "2024-01-01",
  description: "test",
  amount: 100,
  currency: "USD",
  type: "Income" as const,
  category: "Misc",
  isRecurring: false,
};

describe("/api/transactions/sync persistence", () => {
  beforeEach(() => {
    store.clear();
    failCommit = false;
  });

  it("persists transactions via importTransactions", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions: [sample] }),
    });

    const res = await transactionsSync(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ imported: 1 });
    expect(store.size).toBe(1);
    const saved = Array.from(store.values())[0];
    expect(saved.description).toBe(sample.description);
    expect(saved.amount).toBe(sample.amount);
  });

  it("returns 500 when persistence fails", async () => {
    failCommit = true;
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions: [sample] }),
    });

    const res = await transactionsSync(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Failed to import transactions/);
  });
});
