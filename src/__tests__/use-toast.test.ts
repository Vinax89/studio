import { renderHook, act } from "@testing-library/react"
import { useToast, toast } from "../hooks/use-toast"

describe("dismissToast", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("schedules removal after dismiss", () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      const { dismiss } = toast({ description: "test" })
      dismiss()
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].open).toBe(false)

    act(() => {
      jest.runAllTimers()
    })

    expect(result.current.toasts).toHaveLength(0)
  })
})
