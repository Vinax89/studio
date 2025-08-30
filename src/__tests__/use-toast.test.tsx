import React from "react";
import { render, act } from "@testing-library/react";

describe("useToast with UUID ids", () => {
  let captured: any;
  let originalCrypto: any;

  beforeEach(() => {
    jest.useFakeTimers();
    originalCrypto = global.crypto;
    Object.defineProperty(global, "crypto", {
      value: { randomUUID: () => "test-uuid" },
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(global, "crypto", {
      value: originalCrypto,
      configurable: true,
    });
  });

  it("adds, updates, and dismisses toasts using string ids", () => {
    const { toast, useToast } = require("../hooks/use-toast");

    const TestComponent = () => {
      const state = useToast();
      React.useEffect(() => {
        captured = state;
      }, [state]);
      return null;
    };

    render(<TestComponent />);

    let controller: any;
    act(() => {
      controller = toast({ title: "Hello" });
    });

    expect(captured.toasts).toHaveLength(1);
    expect(captured.toasts[0].id).toBe("test-uuid");

    act(() => {
      controller.update({ title: "Updated" });
    });
    expect(captured.toasts[0].title).toBe("Updated");

    act(() => {
      controller.dismiss();
    });
    expect(captured.toasts[0].open).toBe(false);

    act(() => {
      jest.runAllTimers();
    });
    expect(captured.toasts).toHaveLength(0);
  });
});
