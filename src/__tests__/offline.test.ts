jest.mock("idb", () => {
  const store: unknown[] = []
  return {
    openDB: jest.fn(async () => ({
      add: async (_store: string, value: unknown) => {
        store.push(value)
      },
      getAll: async () => [...store],
      clear: async () => {
        store.length = 0
      },
    })),
  }
})

import {
  queueTransaction,
  getQueuedTransactions,
  clearQueuedTransactions,
} from "../lib/offline"

describe("offline fallbacks", () => {
  it("uses in-memory store when IndexedDB fails", async () => {
    await queueTransaction({ id: 1 })
    await queueTransaction({ id: 2 })

    const queued = await getQueuedTransactions<{ id: number }>()
    expect(queued).toEqual([{ id: 1 }, { id: 2 }])

    await clearQueuedTransactions()
    const empty = await getQueuedTransactions()
    expect(empty).toEqual([])
  })
})
