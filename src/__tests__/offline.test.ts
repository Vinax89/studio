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
import { render, act } from "@testing-library/react"
import { ServiceWorker } from "../components/service-worker"
import * as offline from "../lib/offline"
import React from "react"

interface TestGlobal {
  indexedDB?: unknown
  fetch?: jest.MockedFunction<typeof fetch>
}
const g = global as unknown as TestGlobal

beforeAll(() => {
  g.indexedDB = {}
})

afterAll(() => {
  delete g.indexedDB
})

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

describe("ServiceWorker", () => {
  it("handles null queued transactions gracefully", async () => {
    jest.useFakeTimers()
    const getQueuedSpy = jest
      .spyOn(offline, "getQueuedTransactions")
      .mockResolvedValueOnce(null)

    const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>
    g.fetch = fetchMock

    render(React.createElement(ServiceWorker))

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getQueuedSpy).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()

    jest.useRealTimers()
    delete g.fetch
  })
})
