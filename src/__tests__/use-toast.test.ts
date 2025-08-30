import type { reducer as ReducerType, toast as ToastFn } from "../hooks/use-toast"

describe("toast timer management", () => {
  let toast: typeof ToastFn
  let reducer: typeof ReducerType

  beforeEach(() => {
    jest.useFakeTimers()
    jest.resetModules()
    ;({ toast, reducer } = require("../hooks/use-toast"))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("clears pending timeout when toast is removed", () => {
    const setTimeoutSpy = jest.spyOn(global, "setTimeout")
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout")

    const { id, dismiss } = toast({ title: "test" })
    dismiss()

    const timeoutId = (setTimeoutSpy.mock.results[0] as { value: any }).value

    reducer({ toasts: [{ id } as any] }, { type: "REMOVE_TOAST", toastId: id })

    expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId)
    expect(jest.getTimerCount()).toBe(0)

    setTimeoutSpy.mockRestore()
    clearTimeoutSpy.mockRestore()
  })

  it("clears all timeouts when removing all toasts", () => {
    const setTimeoutSpy = jest.spyOn(global, "setTimeout")
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout")

    const first = toast({ title: "first" })
    const second = toast({ title: "second" })

    first.dismiss()
    second.dismiss()

    expect(jest.getTimerCount()).toBe(2)

    reducer(
      { toasts: [{ id: first.id } as any, { id: second.id } as any] },
      { type: "REMOVE_TOAST" }
    )

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(2)
    expect(jest.getTimerCount()).toBe(0)

    setTimeoutSpy.mockRestore()
    clearTimeoutSpy.mockRestore()
  })
})
