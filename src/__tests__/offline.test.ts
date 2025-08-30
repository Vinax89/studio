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
  getDb,
} from "../lib/offline"
import { render, act } from "@testing-library/react"
import { ServiceWorker } from "../components/service-worker"
import * as offline from "../lib/offline"
import { logger } from "../lib/logger"
import React from "react"

const globalAny = globalThis as {
  indexedDB?: unknown
  fetch?: typeof fetch
}

beforeAll(() => {
  globalAny.indexedDB = {}
})

afterAll(() => {
  delete globalAny.indexedDB
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

    const fetchMock = jest.fn()
    globalAny.fetch = fetchMock as unknown as typeof fetch

    render(React.createElement(ServiceWorker))

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getQueuedSpy).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()

    jest.useRealTimers()
    delete globalAny.fetch
  })
})

describe("logging", () => {
  it("logs when IndexedDB is unsupported", async () => {
    const original = globalAny.indexedDB
    delete globalAny.indexedDB
    const spy = jest.spyOn(logger, "error").mockImplementation(() => {})
    const result = await getDb()
    expect(result).toBeNull()
    expect(spy).toHaveBeenCalledWith(
      "IndexedDB is not supported in this environment",
    )
    spy.mockRestore()
    globalAny.indexedDB = original
  })

  it("logs errors from queueTransaction", async () => {
    const error = new Error("fail")
    const db = await getDb()
    if (db) {
      const original = db.add
      ;(db as any).add = jest.fn().mockRejectedValue(error)
      const spy = jest.spyOn(logger, "error").mockImplementation(() => {})
      const result = await queueTransaction({ id: 1 })
      expect(result).toBe(false)
      expect(spy).toHaveBeenCalledWith("queueTransaction error", error)
      spy.mockRestore()
      ;(db as any).add = original
    }
  })

  it("logs errors from getQueuedTransactions", async () => {
    const error = new Error("fail")
    const db = await getDb()
    if (db) {
      const original = db.getAll
      ;(db as any).getAll = jest.fn().mockRejectedValue(error)
      const spy = jest.spyOn(logger, "error").mockImplementation(() => {})
      const result = await getQueuedTransactions()
      expect(result).toBeNull()
      expect(spy).toHaveBeenCalledWith("getQueuedTransactions error", error)
      spy.mockRestore()
      ;(db as any).getAll = original
    }
  })

  it("logs errors from clearQueuedTransactions", async () => {
    const error = new Error("fail")
    const db = await getDb()
    if (db) {
      const original = db.clear
      ;(db as any).clear = jest.fn().mockRejectedValue(error)
      const spy = jest.spyOn(logger, "error").mockImplementation(() => {})
      const result = await clearQueuedTransactions()
      expect(result).toBe(false)
      expect(spy).toHaveBeenCalledWith("clearQueuedTransactions error", error)
      spy.mockRestore()
      ;(db as any).clear = original
    }
  })
})
