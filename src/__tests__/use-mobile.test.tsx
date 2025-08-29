import React from "react";
import { render, screen, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";

describe("useIsMobile", () => {
  let listeners: Array<() => void>;
  let MOBILE_BREAKPOINT: number;
  let useIsMobile: () => boolean;

  beforeEach(() => {
    listeners = [];
    ({ useIsMobile, MOBILE_BREAKPOINT } = require("../hooks/use-mobile"));
    window.innerWidth = MOBILE_BREAKPOINT + 100;
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: window.innerWidth < MOBILE_BREAKPOINT,
      media: "",
      addEventListener: (_event: string, cb: () => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_event: string, cb: () => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
    }));
  });

  function triggerChange() {
    listeners.forEach((cb) => cb());
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
      triggerChange();
    });

    expect(screen.getByText("mobile")).toBeInTheDocument();
  });

});
