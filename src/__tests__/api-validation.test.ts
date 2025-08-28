/**
 * @jest-environment node
 */
import { POST as bankImport } from "@/app/api/bank/import/route"
import { POST as transactionsSync } from "@/app/api/transactions/sync/route"

describe("/api/bank/import", () => {
  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost", { method: "POST", body: "not json" })
    const res = await bankImport(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid payload", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ provider: 123, transactions: "oops" }),
    })
    const res = await bankImport(req)
    expect(res.status).toBe(400)
  })
})

describe("/api/transactions/sync", () => {
  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost", { method: "POST", body: "nope" })
    const res = await transactionsSync(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid payload", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ transactions: "not-array" }),
    })
    const res = await transactionsSync(req)
    expect(res.status).toBe(400)
  })
})
