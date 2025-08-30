/**
 * @jest-environment node
 */
import { POST } from "@/app/api/transactions/sync/route"

jest.mock("@/lib/firebase", () => ({ db: {} }))

const mockSetDoc = jest.fn()
const mockDoc = jest.fn(() => ({}))
const mockCollection = jest.fn(() => ({}))

jest.mock("firebase/firestore", () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
}))

const transactions = [
  {
    id: "1",
    date: "2024-01-01",
    description: "Test1",
    amount: 100,
    currency: "USD",
    type: "Income" as const,
    category: "Misc",
    isRecurring: false,
  },
  {
    id: "2",
    date: "2024-01-02",
    description: "Test2",
    amount: 200,
    currency: "USD",
    type: "Expense" as const,
    category: "Misc",
    isRecurring: true,
  },
]

describe("/api/transactions/sync persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("persists all transactions and returns their ids", async () => {
    mockSetDoc.mockResolvedValue(undefined)

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(mockSetDoc).toHaveBeenCalledTimes(transactions.length)
    expect(data.saved).toEqual(["1", "2"])
    expect(data.errors).toBeUndefined()
  })

  it("reports errors for failed writes", async () => {
    mockSetDoc.mockResolvedValueOnce(undefined)
    mockSetDoc.mockRejectedValueOnce(new Error("write failed"))

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: JSON.stringify({ transactions }),
    })

    const res = await POST(req)
    expect(res.status).toBe(207)
    const data = await res.json()
    expect(mockSetDoc).toHaveBeenCalledTimes(transactions.length)
    expect(data.saved).toEqual(["1"])
    expect(data.errors).toEqual([{ id: "2", error: "write failed" }])
  })
})
