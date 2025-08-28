import React from "react";
import { render } from "@testing-library/react";
import { ChartStyle, type ChartConfig } from "@/components/ui/chart";

describe("ChartStyle", () => {
  it("renders valid color values", () => {
    const { container } = render(
      <ChartStyle id="test" config={{ valid: { color: "#abc123" } }} />,
    );
    const style = container.querySelector("style");
    expect(style?.textContent).toContain("--color-valid: #abc123;");
  });

  it("rejects invalid color values", () => {
    const unsafe: ChartConfig = {
      bad: { color: "url('javascript:alert(1)')" },
    };
    const { container } = render(<ChartStyle id="test" config={unsafe} />);
    expect(container.querySelector("style")).toBeNull();
  });
});
