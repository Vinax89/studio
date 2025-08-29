/** @jest-environment node */
import React from "react";
import { renderToString } from "react-dom/server";
import { useIsMobile } from "../hooks/use-mobile";

describe("useIsMobile SSR", () => {
  it("renders without warnings", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    function TestComponent() {
      useIsMobile();
      return null;
    }
    renderToString(React.createElement(TestComponent));
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
