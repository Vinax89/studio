import { act, render } from "@testing-library/react"
import { ServiceWorker } from "@/components/service-worker"

jest.mock("@/lib/offline", () => ({
  getQueuedTransactions: jest.fn(),
  clearQueuedTransactions: jest.fn(),
}))

const toastMock = jest.fn()
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}))

describe("ServiceWorker", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(toastMock as jest.Mock).mockClear()
    ;(global.fetch as unknown) = jest.fn()
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
  })

  it("syncs queued transactions and notifies on success", async () => {
    const { getQueuedTransactions, clearQueuedTransactions } = require("@/lib/offline")
    ;(getQueuedTransactions as jest.Mock).mockResolvedValue([{ id: 1 }])
    ;(clearQueuedTransactions as jest.Mock).mockResolvedValue(undefined)
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true })

    render(<ServiceWorker />)

    Object.defineProperty(navigator, "onLine", { value: true })
    window.dispatchEvent(new Event("online"))

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(clearQueuedTransactions).toHaveBeenCalled()
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Transactions synced" })
    )
  })

  it("retries with exponential backoff and notifies on failure", async () => {
    const { getQueuedTransactions, clearQueuedTransactions } = require("@/lib/offline")
    ;(getQueuedTransactions as jest.Mock).mockResolvedValue([{ id: 1 }])
    ;(clearQueuedTransactions as jest.Mock).mockResolvedValue(undefined)
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, text: async () => "err" })
      .mockResolvedValueOnce({ ok: true })

    render(<ServiceWorker />)

    Object.defineProperty(navigator, "onLine", { value: true })
    window.dispatchEvent(new Event("online"))

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Sync failed" })
    )

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(clearQueuedTransactions).toHaveBeenCalled()
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Transactions synced" })
    )
  })
})

