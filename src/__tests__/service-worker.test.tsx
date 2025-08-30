import { render, act } from "@testing-library/react"
import { ServiceWorker } from "../components/service-worker"

jest.mock("../lib/offline", () => ({
  getQueuedTransactions: jest
    .fn()
    .mockResolvedValue({ ok: true, value: [{ id: 1 }] }),
  clearQueuedTransactions: jest
    .fn()
    .mockResolvedValue({ ok: true, value: undefined }),
}))

jest.mock("../lib/firebase", () => ({
  getFirebase: jest.fn(() => ({
    auth: { currentUser: { getIdToken: jest.fn().mockResolvedValue("token") } },
  })),
}))
import { getFirebase } from "../lib/firebase"

beforeAll(() => {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test"
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test"
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test"
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test"
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test"
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test"
  getFirebase()
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
})
