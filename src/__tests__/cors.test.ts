/**
 * @jest-environment node
 */

process.env.ALLOWED_ORIGINS = "http://allowed.com";

jest.mock("@/lib/transactions", () => {
  const actual = jest.requireActual("@/lib/transactions");
  return {
    ...actual,
    saveTransactions: jest.fn().mockResolvedValue(undefined),
  };
});

import { POST as transactionsSync } from "@/app/api/transactions/sync/route";

describe("CORS", () => {
  const body = JSON.stringify({ transactions: [] });

  it("allows requests from configured origins", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: {
        Origin: "http://allowed.com",
        Authorization: "Bearer test-token",
      },
      body,
    });

    const res = await transactionsSync(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://allowed.com"
    );
  });

  it("rejects requests from other origins", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: {
        Origin: "http://evil.com",
        Authorization: "Bearer test-token",
      },
      body,
    });

    const res = await transactionsSync(req);
    expect(res.status).toBe(403);
  });

  it("returns 401 for missing auth even if origin allowed", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Origin: "http://allowed.com" },
      body,
    });

    const res = await transactionsSync(req);
    expect(res.status).toBe(401);
  });
});

