jest.mock("idb", () => {
  const actual = jest.requireActual("idb")
  return { ...actual, openDB: jest.fn() }
})

let openDB: jest.Mock

describe("offline db", () => {
  beforeEach(() => {
    jest.resetModules()
    openDB = require("idb").openDB as jest.Mock
    openDB.mockReset()
  })

  it("returns error when queueTransaction fails", async () => {
    openDB.mockResolvedValue({
      add: jest.fn().mockRejectedValue(new Error("fail")),
      count: jest.fn(),
    })
    const { queueTransaction } = await import("../lib/offline")
    const result = await queueTransaction({})
    expect(result.ok).toBe(false)
  })

  it("returns error when getQueuedTransactions fails", async () => {
    openDB.mockResolvedValue({
      getAll: jest.fn().mockRejectedValue(new Error("fail")),
    })
    const { getQueuedTransactions } = await import("../lib/offline")
    const result = await getQueuedTransactions()
    expect(result.ok).toBe(false)
  })

  it("returns error when clearQueuedTransactions fails", async () => {
    openDB.mockResolvedValue({
      clear: jest.fn().mockRejectedValue(new Error("fail")),
    })
    const { clearQueuedTransactions } = await import("../lib/offline")
    const result = await clearQueuedTransactions()
    expect(result.ok).toBe(false)
  })

  it("trims oldest entries when exceeding max records", async () => {
    openDB.mockImplementation(jest.requireActual("idb").openDB)
    await import("fake-indexeddb/auto")
    if (typeof (globalThis as any).structuredClone !== "function") {
      ;(globalThis as any).structuredClone = (val: unknown) =>
        JSON.parse(JSON.stringify(val))
    }
    const { queueTransaction, getQueuedTransactions } = await import(
      "../lib/offline"
    )
    const max = 100
    for (let i = 0; i < max + 5; i++) {
      const res = await queueTransaction(i)
      expect(res.ok).toBe(true)
    }
    const result = await getQueuedTransactions<number>()
    expect(result.ok).toBe(true)
    expect(result.value.length).toBe(max)
    expect(result.value[0]).toBe(5)
  })
})

