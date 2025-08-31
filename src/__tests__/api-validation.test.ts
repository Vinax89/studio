/**
 * @vitest-environment node
 */
import { POST as bankImport } from "@/app/api/bank/import/route"
import { POST as transactionsSync } from "@/app/api/transactions/sync/route"

const baseTx = {
  id: "1",
  date: "2024-01-01",
  description: "Test",
  amount: 1,
  currency: "USD",
  type: "Income" as const,
  category: "Misc",
}

describe("/api/bank/import", () => {
  it("returns 401 when auth is missing", async () => {
    const req = new Request("http://localhost", { method: "POST" })
    const res = await bankImport(req)
    expect(res.status).toBe(401)
  })

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: "not json",
    })
    const res = await bankImport(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid payload", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ provider: 123, transactions: "oops" }),
    })
    const res = await bankImport(req)
    expect(res.status).toBe(400)
  })
})

describe("/api/transactions/sync", () => {
  it("returns 401 when auth is missing", async () => {
    const req = new Request("http://localhost", { method: "POST" })
    const res = await transactionsSync(req)
    expect(res.status).toBe(401)
  })

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: "nope",
    })
    const res = await transactionsSync(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid payload", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions: "not-array" }),
    })
    const res = await transactionsSync(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid date format", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({
        transactions: [{ ...baseTx, date: "2024/01/01" }],
      }),
    })
    const res = await transactionsSync(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid currency code", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({
        transactions: [{ ...baseTx, currency: "US" }],
      }),
    })
    const res = await transactionsSync(req)
    expect(res.status).toBe(400)
  })
})
