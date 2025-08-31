import { render, act } from "@testing-library/react"
import { ServiceWorker } from "../components/service-worker"
import type { Mock } from 'vitest'
import React from "react"

vi.mock("../lib/offline", () => ({
  getQueuedTransactions: vi
    .fn()
    .mockResolvedValue({ ok: true, value: [{ id: 1 }] }),
  clearQueuedTransactions: vi
    .fn()
    .mockResolvedValue({ ok: true, value: undefined }),
}))

vi.mock("../lib/firebase", () => ({
  auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue("token") } },
  initFirebase: vi.fn(),
}))
import { initFirebase } from "../lib/firebase"

beforeAll(() => {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test"
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test"
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test"
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test"
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test"
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test"
  initFirebase()
})

vi.mock("../hooks/use-toast", () => ({ toast: vi.fn() }))

describe("ServiceWorker aborts in-flight sync", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    ;(fetch as Mock).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("aborts fetch on unmount", async () => {
    let signal: AbortSignal | undefined
    ;(fetch as Mock).mockImplementation(
      (_url: string, options: { signal: AbortSignal }) => {
        signal = options.signal
        return new Promise(() => {})
      }
    )

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    })

    const { unmount } = render(<ServiceWorker />)

    await act(async () => {
      vi.runOnlyPendingTimers()
    })

    expect(signal).toBeDefined()

    unmount()

    expect(signal!.aborted).toBe(true)
  })

  it("aborts previous fetch when new sync starts", async () => {
    const signals: AbortSignal[] = []
    ;(fetch as Mock).mockImplementation(
      (_url: string, options: { signal: AbortSignal }) => {
        signals.push(options.signal)
        return new Promise(() => {})
      }
    )

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    })

    render(<ServiceWorker />)

    await act(async () => {
      vi.runOnlyPendingTimers()
    })

    expect(signals[0].aborted).toBe(false)

    await act(async () => {
      window.dispatchEvent(new Event("online"))
    })

    expect(signals[0].aborted).toBe(true)

    await act(async () => {
      vi.runOnlyPendingTimers()
    })

    expect(signals[1]).toBeDefined()
    expect(signals[1].aborted).toBe(false)
  })
})

describe("Service worker registration", () => {
  it("registers with module type", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    })

    render(<ServiceWorker />)

    await act(async () => {})

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js", {
      type: "module",
    })

    const nav = navigator as Navigator & { serviceWorker?: ServiceWorkerContainer }
    delete nav.serviceWorker
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    })
  })

  it("updates existing registration when controller is missing", async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    const update = vi.fn().mockResolvedValue(undefined)
    const getRegistration = vi.fn().mockResolvedValue({ update })
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register,
        getRegistration,
        controller: undefined,
      },
      configurable: true,
    })
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    })

    render(<ServiceWorker />)

    await act(async () => {})

    expect(update).toHaveBeenCalled()
    expect(register).not.toHaveBeenCalled()

    const nav = navigator as Navigator & { serviceWorker?: ServiceWorkerContainer }
    delete nav.serviceWorker
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    })
  })
})
