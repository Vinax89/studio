import React from "react";
import { render, screen, act } from "@testing-library/react";
import { useIsMobile, MOBILE_BREAKPOINT } from "../hooks/use-mobile";

describe("useIsMobile", () => {
  let listeners: Array<(e: { matches: boolean }) => void>;

  beforeEach(() => {
    listeners = [];
    window.innerWidth = MOBILE_BREAKPOINT + 100;
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: window.innerWidth < MOBILE_BREAKPOINT,
      media: "",
      addEventListener: (_event: string, cb: (e: { matches: boolean }) => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_event: string, cb: (e: { matches: boolean }) => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
    }));
  });

  function triggerChange(matches: boolean) {
    listeners.forEach((cb) => cb({ matches }));
  }

  it("returns false initially and updates on resize", () => {
    function TestComponent() {
      const mobile = useIsMobile();
      return <span>{mobile ? "mobile" : "desktop"}</span>;
    }

    render(<TestComponent />);
    expect(screen.getByText("desktop")).toBeInTheDocument();

    act(() => {
      window.innerWidth = MOBILE_BREAKPOINT - 50;
      triggerChange(window.innerWidth < MOBILE_BREAKPOINT);
    });

    expect(screen.getByText("mobile")).toBeInTheDocument();
  });

  it("handles transitions across the breakpoint", () => {
    function TestComponent() {
      const mobile = useIsMobile();
      return <span>{mobile ? "mobile" : "desktop"}</span>;
    }

    // start below breakpoint
    window.innerWidth = MOBILE_BREAKPOINT - 50;
    render(<TestComponent />);
    expect(screen.getByText("mobile")).toBeInTheDocument();

    // transition to desktop
    act(() => {
      window.innerWidth = MOBILE_BREAKPOINT + 50;
      triggerChange(window.innerWidth < MOBILE_BREAKPOINT);
    });
    expect(screen.getByText("desktop")).toBeInTheDocument();

    // back to mobile
    act(() => {
      window.innerWidth = MOBILE_BREAKPOINT - 50;
      triggerChange(window.innerWidth < MOBILE_BREAKPOINT);
    });
    expect(screen.getByText("mobile")).toBeInTheDocument();
  });
});
