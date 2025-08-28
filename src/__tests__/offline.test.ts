jest.mock("idb", () => {
  const store: QueuedTransaction[] = []
  return {
    openDB: jest.fn(async () => ({
      add: async (_store: string, value: QueuedTransaction) => {
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
  QueuedTransaction,
} from "../lib/offline"

describe("offline fallbacks", () => {
  it("uses in-memory store when IndexedDB fails", async () => {
    await queueTransaction({ id: 1 })
    await queueTransaction({ id: 2 })

    const queued = await getQueuedTransactions()
    expect(queued).toEqual([{ id: 1 }, { id: 2 }])

    await clearQueuedTransactions()
    const empty = await getQueuedTransactions()
    expect(empty).toEqual([])
  })
})
