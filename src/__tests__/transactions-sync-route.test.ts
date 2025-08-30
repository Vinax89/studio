/**
 * @jest-environment node
 */

jest.mock("@/lib/transactions", () => {
  const actual = jest.requireActual("@/lib/transactions");
  return { ...actual, saveTransactions: jest.fn() };
});

import { POST } from "@/app/api/transactions/sync/route";
import { saveTransactions } from "@/lib/transactions";

describe("/api/transactions/sync persistence", () => {
  const tx = {
    id: "1",
    date: "2024-01-01",
    description: "Test",
    amount: 1,
    currency: "USD",
    type: "Income" as const,
    category: "Misc",
  };

  it("persists transactions and returns count", async () => {
    (saveTransactions as jest.Mock).mockResolvedValueOnce(undefined);

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions: [tx] }),
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: 1 });
    expect(saveTransactions).toHaveBeenCalledWith([tx]);
  });

  it("returns 500 and logs on persistence failure", async () => {
    const error = new Error("db fail");
    (saveTransactions as jest.Mock).mockRejectedValueOnce(error);
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions: [tx] }),
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Internal server error",
    });
    expect(saveTransactions).toHaveBeenCalledWith([tx]);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

