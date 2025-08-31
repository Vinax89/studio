/**
 * @jest-environment node
 */

import { vi, type Mock } from "vitest"

vi.mock("@/lib/transactions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/transactions")>(
    "@/lib/transactions",
  )
  return {
    ...actual,
    saveTransactions: vi.fn().mockResolvedValue(undefined),
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
    (saveTransactions as Mock).mockClear()
  })

  it("saves transactions via saveTransactions", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions: [baseTx] }),
    })

    const res = await transactionsSync(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual({ received: 1 })
    expect(saveTransactions).toHaveBeenCalledTimes(1)
    expect(saveTransactions).toHaveBeenCalledWith([baseTx])
  })

  it("propagates persistence errors", async () => {
    (saveTransactions as Mock).mockRejectedValueOnce(
      Object.assign(new Error("db failed"), { status: 503 }),
    )

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions: [baseTx] }),
    })

    const res = await transactionsSync(req)
    const data = await res.json()

    expect(res.status).toBe(503)
    expect(data).toEqual({ error: "db failed" })
  })
})
