/**
 * @jest-environment node
 */
import { POST as bankImport } from "@/app/api/bank/import/route"
import { POST as transactionsSync } from "@/app/api/transactions/sync/route"

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

  it("returns 400 when transactions contain invalid entries", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ provider: "test", transactions: [{ id: "1" }] }),
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
})
