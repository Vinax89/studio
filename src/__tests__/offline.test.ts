vi.mock("idb", () => {
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
    openDB: vi.fn(async () => ({
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

vi.mock("../lib/firebase", () => ({
  auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue("token") } },
  initFirebase: vi.fn(),
}))

vi.mock("../lib/offline", () => {
  const actual = vi.requireActual("../lib/offline")
  return {
    ...actual,
    getQueuedTransactions: vi.fn(actual.getQueuedTransactions),
  }
})

import {
  queueTransaction,
  getQueuedTransactions,
  clearQueuedTransactions,
} from "../lib/offline"
import { render, act } from "@testing-library/react"
import * as offline from "../lib/offline"
import React from "react"
import { logger } from "../lib/logger"
import type { Mock } from 'vitest'

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
    expect((await queueTransaction({ id: 1 })).ok).toBe(true)
    expect((await queueTransaction({ id: 2 })).ok).toBe(true)

    const queued = await getQueuedTransactions<{ id: number }>()
    expect(queued.ok).toBe(true)
    expect(queued.value).toEqual([{ id: 1 }, { id: 2 }])

    expect((await clearQueuedTransactions()).ok).toBe(true)
    const empty = await getQueuedTransactions()
    expect(empty.ok).toBe(true)
    expect(empty.value).toEqual([])
  })

  it("prunes oldest transactions beyond queue size", async () => {
    for (let i = 1; i <= 5; i++) {
      expect((await queueTransaction({ id: i }, 3)).ok).toBe(true)
    }

    const queued = await getQueuedTransactions<{ id: number }>()
    expect(queued.ok).toBe(true)
    expect(queued.value).toEqual([{ id: 3 }, { id: 4 }, { id: 5 }])

    await clearQueuedTransactions()
  })

  it("rejects negative maxQueueSize", async () => {
    await clearQueuedTransactions()
    const result = await queueTransaction({ id: 1 }, -1)
    expect(result.ok).toBe(false)
    expect(result.error.message).toBe(
      "maxQueueSize must be a non-negative integer",
    )
    const queued = await getQueuedTransactions()
    expect(queued.ok).toBe(true)
    expect(queued.value).toEqual([])
  })

  it("rejects non-integer maxQueueSize", async () => {
    await clearQueuedTransactions()
    const result = await queueTransaction({ id: 1 }, 1.5)
    expect(result.ok).toBe(false)
    expect(result.error.message).toBe(
      "maxQueueSize must be a non-negative integer",
    )
    const queued = await getQueuedTransactions()
    expect(queued.ok).toBe(true)
    expect(queued.value).toEqual([])
  })
})

describe("ServiceWorker", () => {
  it("handles queued transaction retrieval errors gracefully", async () => {
    vi.useFakeTimers()
    const getQueuedMock = offline.getQueuedTransactions as Mock
    getQueuedMock.mockClear()
    getQueuedMock.mockResolvedValueOnce({
      ok: false,
      error: new Error("failed"),
    })

    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {})

    const fetchMock = vi.fn()
    globalAny.fetch = fetchMock as unknown as typeof fetch

    const { ServiceWorker } = await import("../components/service-worker")
    render(React.createElement(ServiceWorker))

    await act(async () => {
      vi.runOnlyPendingTimers()
    })

    expect(getQueuedMock).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()

    vi.useRealTimers()
    delete globalAny.fetch
    errorSpy.mockRestore()
  })
})
