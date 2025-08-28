/**
 * @jest-environment node
 */
import { POST as bankImport } from "@/app/api/bank/import/route";
import { POST as syncTransactions } from "@/app/api/transactions/sync/route";

jest.mock("@/lib/server-auth", () => ({
  verifyFirebaseToken: jest.fn(),
}));

describe("transaction route validation", () => {
  it("bank import returns 400 for invalid transaction", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        provider: "plaid",
        transactions: [
          {
            id: "1",
            date: "2024-01-01",
            description: "test",
            amount: "oops",
            currency: "USD",
            type: "Income",
            category: "salary",
          },
        ],
      }),
    });
    const res = await bankImport(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(Array.isArray(data.error)).toBe(true);
    expect(data.error[0].path).toEqual(["transactions", 0, "amount"]);
  });

  it("transactions sync returns 400 for invalid transaction", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        transactions: [
          {
            id: "1",
            date: "2024-01-01",
            description: "test",
            amount: "oops",
            currency: "USD",
            type: "Income",
            category: "salary",
          },
        ],
      }),
    });
    const res = await syncTransactions(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(Array.isArray(data.error)).toBe(true);
    expect(data.error[0].path).toEqual(["transactions", 0, "amount"]);
  });
});
