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
    (saveTransactions as jest.Mock).mockClear()
  })

  it("saves transactions in batches via saveTransactions", async () => {
    const transactions = Array.from({ length: 501 }, (_, i) => ({
      ...baseTx,
      id: String(i + 1),
    }))

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions }),
    })

    const res = await transactionsSync(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual({ received: 501 })
    expect(saveTransactions).toHaveBeenCalledTimes(2)
    expect(saveTransactions).toHaveBeenNthCalledWith(
      1,
      transactions.slice(0, 500),
    )
    expect(saveTransactions).toHaveBeenNthCalledWith(
      2,
      transactions.slice(500),
    )
  })

  it("returns structured errors when a batch fails", async () => {
    const transactions = Array.from({ length: 501 }, (_, i) => ({
      ...baseTx,
      id: String(i + 1),
    }))

    ;(saveTransactions as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(
        Object.assign(new Error("db failed"), { status: 503 }),
      )

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions }),
    })

    const res = await transactionsSync(req)
    const data = await res.json()

    expect(res.status).toBe(503)
    expect(data).toEqual({ error: { message: "db failed", batch: 2 } })
  })
})
