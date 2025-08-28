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
import { render, act } from "@testing-library/react"
import { ServiceWorker } from "../components/service-worker"
import * as offline from "../lib/offline"
import React from "react"

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

describe("ServiceWorker", () => {
  it("handles null queued transactions gracefully", async () => {
    jest.useFakeTimers()
    const getQueuedSpy = jest
      .spyOn(offline, "getQueuedTransactions")
      .mockResolvedValueOnce(null)

    const fetchMock = jest.fn()
    ;(global as any).fetch = fetchMock

    render(React.createElement(ServiceWorker))

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getQueuedSpy).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()

    jest.useRealTimers()
    delete (global as any).fetch
  })
})
