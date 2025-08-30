import { toast, reducer } from "../hooks/use-toast";

describe("useToast reducer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("clears timers when toast is removed manually", () => {
    const { id, dismiss } = toast({ description: "test" });
    dismiss();
    expect(jest.getTimerCount()).toBe(1);
    reducer({ toasts: [{ id }] }, { type: "REMOVE_TOAST", toastId: id });
    expect(jest.getTimerCount()).toBe(0);
  });
});
