import { render, act } from "@testing-library/react"
import { ServiceWorker } from "../components/service-worker"
import { getQueuedTransactions } from "../lib/offline"
import { logger } from "../lib/logger"

jest.mock("../lib/offline", () => ({
  getQueuedTransactions: jest
    .fn()
    .mockResolvedValue({ ok: true, value: [{ id: 1 }] }),
  clearQueuedTransactions: jest
    .fn()
    .mockResolvedValue({ ok: true, value: undefined }),
}))

jest.mock("../lib/firebase", () => ({
  auth: { currentUser: { getIdToken: jest.fn().mockResolvedValue("token") } },
  initFirebase: jest.fn(),
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

jest.mock("../hooks/use-toast", () => ({ toast: jest.fn() }))

describe("ServiceWorker aborts in-flight sync", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(fetch as jest.Mock).mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("aborts fetch on unmount", async () => {
    let signal: AbortSignal | undefined
    ;(fetch as jest.Mock).mockImplementation(
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
      jest.runOnlyPendingTimers()
    })

    expect(signal).toBeDefined()

    unmount()

    expect(signal!.aborted).toBe(true)
  })

  it("aborts previous fetch when new sync starts", async () => {
    const signals: AbortSignal[] = []
    ;(fetch as jest.Mock).mockImplementation(
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
      jest.runOnlyPendingTimers()
    })

    expect(signals[0].aborted).toBe(false)

    await act(async () => {
      window.dispatchEvent(new Event("online"))
    })

    expect(signals[0].aborted).toBe(true)

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(signals[1]).toBeDefined()
    expect(signals[1].aborted).toBe(false)
  })
})

describe("Service worker registration", () => {
  it("registers with module type", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: jest.fn().mockResolvedValue(undefined) },
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

  it("does not register when existing registration without controller", async () => {
    const register = jest.fn().mockResolvedValue(undefined)
    const getRegistration = jest.fn().mockResolvedValue({})
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

    expect(register).not.toHaveBeenCalled()

    const nav = navigator as Navigator & { serviceWorker?: ServiceWorkerContainer }
    delete nav.serviceWorker
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    })
  })
})

describe("payload size handling", () => {
  const MAX_BODY_SIZE = 1024 * 1024

  beforeEach(() => {
    jest.useFakeTimers()
    ;(fetch as jest.Mock).mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("skips oversized single transaction", async () => {
    const largeTx = { data: "a".repeat(MAX_BODY_SIZE) }
    ;(getQueuedTransactions as jest.Mock).mockResolvedValueOnce({
      ok: true,
      value: [largeTx],
    })
    const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => {})

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    })

    render(<ServiceWorker />)

    await act(async () => {
      jest.runOnlyPendingTimers()
      await Promise.resolve()
    })

    expect(fetch).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it("splits transactions at 1MB boundary", async () => {
    const enc = new TextEncoder()
    const n2 = 10
    const n1 = MAX_BODY_SIZE - 42 - n2
    const tx1 = { data: "a".repeat(n1) }
    const tx2 = { data: "a".repeat(n2) }
    const tx3 = { data: "a" }

    ;(getQueuedTransactions as jest.Mock).mockResolvedValueOnce({
      ok: true,
      value: [tx1, tx2, tx3],
    })

    ;(fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => "" })

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    })

    render(<ServiceWorker />)

    await act(async () => {
      jest.runOnlyPendingTimers()
      await Promise.resolve()
    })

    const fetchMock = fetch as jest.Mock
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const body1 = fetchMock.mock.calls[0][1].body
    const body2 = fetchMock.mock.calls[1][1].body
    expect(enc.encode(body1).length).toBe(MAX_BODY_SIZE)
    expect(JSON.parse(body1).transactions).toHaveLength(2)
    expect(JSON.parse(body2).transactions).toHaveLength(1)
  })
})
