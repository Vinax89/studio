/**
 * @jest-environment node
 */

jest.mock("@/lib/transactions", () => {
  const actual = jest.requireActual("@/lib/transactions")
  return {
    ...actual,
    saveTransactions: jest.fn().mockResolvedValue(undefined),
  }
})

import { POST as bankImport } from "@/app/api/bank/import/route"
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

describe("/api/bank/import persistence", () => {
  beforeEach(() => {
    ;(saveTransactions as jest.Mock).mockClear()
  })

  it("saves transactions with user ID", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ provider: "plaid", transactions: [baseTx] }),
    })

    const res = await bankImport(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual({ provider: "plaid", imported: 1 })
    expect(saveTransactions).toHaveBeenCalledTimes(1)
    expect(saveTransactions).toHaveBeenCalledWith([
      { ...baseTx, userId: "test-user" },
    ])
  })

  it("propagates persistence errors", async () => {
    ;(saveTransactions as jest.Mock).mockRejectedValueOnce(
      new Error("db failed"),
    )

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ provider: "plaid", transactions: [baseTx] }),
    })

    const res = await bankImport(req)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data).toEqual({ error: "db failed" })
  })
})
