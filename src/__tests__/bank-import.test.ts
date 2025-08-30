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

jest.mock("@/lib/logger", () => ({
  logger: { error: jest.fn() },
}))

import { POST as bankImport } from "@/app/api/bank/import/route"
import { saveTransactions } from "@/lib/transactions"
import { logger } from "@/lib/logger"

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
    ;(logger.error as jest.Mock).mockClear()
  })

  it("saves transactions and returns provider", async () => {
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
    expect(saveTransactions).toHaveBeenCalledWith([baseTx])
  })

  it("logs and propagates persistence errors", async () => {
    ;(saveTransactions as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error("db failed"), { status: 503 }),
    )

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ provider: "finicity", transactions: [baseTx] }),
    })

    const res = await bankImport(req)
    const data = await res.json()

    expect(res.status).toBe(503)
    expect(data).toEqual({ error: "db failed" })
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(
      "Failed to import transactions for provider finicity",
      expect.any(Error),
    )
  })
})
