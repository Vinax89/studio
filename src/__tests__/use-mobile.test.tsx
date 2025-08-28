import React from "react";
import { render, screen, act } from "@testing-library/react";
import { useIsMobile, MOBILE_BREAKPOINT } from "../hooks/use-mobile";
import ReactDOMServer from "react-dom/server";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";

jest.mock("lucide-react", () => ({ PanelLeft: () => null }));

describe("useIsMobile", () => {
  let listeners: Array<() => void>;

  beforeEach(() => {
    listeners = [];
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

  it("renders on the server without warnings", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    function TestComponent() {
      useIsMobile();
      return null;
    }

    ReactDOMServer.renderToString(<TestComponent />);

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("Sidebar renders on the server without warnings", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    ReactDOMServer.renderToString(
      <SidebarProvider>
        <Sidebar>
          <div />
        </Sidebar>
      </SidebarProvider>
    );

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
