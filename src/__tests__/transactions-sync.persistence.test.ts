/**
 * @jest-environment node
 */

jest.mock("@/lib/transactions", () => {
  const actual = jest.requireActual("@/lib/transactions")
  return { ...actual, saveTransactions: jest.fn() }
})

import { POST as transactionsSync } from "@/app/api/transactions/sync/route"
import { saveTransactions } from "@/lib/transactions"

const baseTx = {
  id: "1",
  date: "2024-01-01",
  description: "Test",
  amount: 1,
  currency: "USD",
  type: "Income" as const,
  category: "Misc",
}

describe("/api/transactions/sync persistence", () => {
  beforeEach(() => {
    (saveTransactions as jest.Mock).mockReset()
  })

  it("persists transactions and returns saved count", async () => {
    (saveTransactions as jest.Mock).mockResolvedValue(undefined)
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions: [baseTx] }),
    })

    const res = await transactionsSync(req)
    expect(saveTransactions).toHaveBeenCalledWith([baseTx])
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ saved: 1 })
  })

  it("returns 500 when persistence fails", async () => {
    (saveTransactions as jest.Mock).mockRejectedValue(new Error("boom"))
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions: [baseTx] }),
    })

    const res = await transactionsSync(req)
    expect(saveTransactions).toHaveBeenCalled()
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: "boom" })
  })
})
