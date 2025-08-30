import { render, act } from "@testing-library/react"
import { ServiceWorker } from "../components/service-worker"

jest.mock("../lib/offline", () => ({
  getQueuedTransactions: jest.fn().mockResolvedValue([{ id: 1 }]),
  clearQueuedTransactions: jest.fn().mockResolvedValue(undefined),
}))

jest.mock("../lib/firebase", () => ({
  auth: { currentUser: { getIdToken: jest.fn().mockResolvedValue("token") } },
}))

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
      (_url: string, options: RequestInit) => {
        signal = options.signal as AbortSignal
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
      (_url: string, options: RequestInit) => {
        signals.push(options.signal as AbortSignal)
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
