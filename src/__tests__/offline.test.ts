jest.mock("idb", () => {
  const store: unknown[] = []
  const createCursor = (index: number) => ({
    async delete() {
      store.splice(index, 1)
    },
    async continue() {
      return index < store.length ? createCursor(index) : null
    },
  })
  return {
    openDB: jest.fn(async () => ({
      add: async (_store: string, value: unknown) => {
        store.push(value)
      },
      getAll: async () => [...store],
      clear: async () => {
        store.length = 0
      },
      count: async () => store.length,
      transaction: () => ({
        store: {
          openKeyCursor: async () => (store.length ? createCursor(0) : null),
        },
        done: Promise.resolve(),
      }),
    })),
  }
})

import {
  queueTransaction,
  getQueuedTransactions,
  clearQueuedTransactions,
} from "../lib/offline"

describe("offline fallbacks", () => {
  it("queues and retrieves transactions", async () => {
    expect(await queueTransaction({ id: 1 })).toBe(true)
    expect(await queueTransaction({ id: 2 })).toBe(true)

    const queued = await getQueuedTransactions<{ id: number }>()
    expect(queued).toEqual([{ id: 1 }, { id: 2 }])

    expect(await clearQueuedTransactions()).toBe(true)
    const empty = await getQueuedTransactions()
    expect(empty).toEqual([])
  })

  it("prunes oldest transactions beyond queue size", async () => {
    for (let i = 1; i <= 5; i++) {
      await queueTransaction({ id: i }, 3)
    }

    const queued = await getQueuedTransactions<{ id: number }>()
    expect(queued).toEqual([{ id: 3 }, { id: 4 }, { id: 5 }])

    await clearQueuedTransactions()
  })
})
