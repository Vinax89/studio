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
      getAllKeys: async () => store.map((_, i) => i),
      delete: async () => {
        store.shift()
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
    expect(await queueTransaction({ id: 1 })).toBe(true)
    expect(await queueTransaction({ id: 2 })).toBe(true)

    const queued = await getQueuedTransactions<{ id: number }>()
    expect(queued).toEqual([{ id: 1 }, { id: 2 }])

    expect(await clearQueuedTransactions()).toBe(true)
    const empty = await getQueuedTransactions()
    expect(empty).toEqual([])
  })
})
