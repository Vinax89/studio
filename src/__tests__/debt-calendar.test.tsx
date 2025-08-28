/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { webcrypto } from "crypto";
import DebtCalendar from "../components/debts/DebtCalendar";

// Mock UI components to avoid Radix and other dependencies
jest.mock("../components/ui/button", () => ({
  Button: (props: React.ComponentProps<"button">) => <button {...props} />,
}));
jest.mock("../components/ui/input", () => ({
  Input: (props: React.ComponentProps<"input">) => <input {...props} />,
}));
jest.mock("../components/ui/label", () => ({
  Label: (props: React.ComponentProps<"label">) => <label {...props} />,
}));
jest.mock("../components/ui/select", () => ({
  Select: (props: React.ComponentProps<"div">) => <div {...props} />,
  SelectTrigger: (props: React.ComponentProps<"div">) => <div {...props} />,
  SelectContent: (props: React.ComponentProps<"div">) => <div {...props} />,
  SelectItem: (props: React.ComponentProps<"div">) => <div {...props} />,
  SelectValue: () => null,
}));
jest.mock("../components/ui/textarea", () => ({
  Textarea: (props: React.ComponentProps<"textarea">) => (
    <textarea {...props} />
  ),
}));

describe.skip("DebtCalendar", () => {
  beforeAll(() => {
    if (!global.crypto) {
      global.crypto = webcrypto as Crypto;
    }
  });

  beforeEach(() => {
    localStorage.clear();
  });

  function fillRequiredFields() {
    fireEvent.change(screen.getByPlaceholderText("e.g., X1 Card"), {
      target: { value: "Test Debt" },
    });
    fireEvent.change(screen.getByPlaceholderText("5.5"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByPlaceholderText("5000"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByPlaceholderText("3250"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByPlaceholderText("150"), {
      target: { value: "100" },
    });
  }

  test("adds a debt", async () => {
    render(<DebtCalendar storageKey="test" initialDebts={[]} />);

    fireEvent.click(screen.getByRole("button", { name: /new/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText("Test Debt")).toBeInTheDocument();
  });

  test("updates a debt", async () => {
    render(<DebtCalendar storageKey="test" initialDebts={[]} />);

    fireEvent.click(screen.getByRole("button", { name: /new/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    const [chip] = await screen.findAllByText("Test Debt");
    fireEvent.click(chip);
    fireEvent.change(screen.getByPlaceholderText("e.g., X1 Card"), {
      target: { value: "Updated Debt" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText("Updated Debt")).toBeInTheDocument();
  });

  test("deletes a debt", async () => {
    render(<DebtCalendar storageKey="test" initialDebts={[]} />);

    fireEvent.click(screen.getByRole("button", { name: /new/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    const [chip] = await screen.findAllByText("Test Debt");
    fireEvent.click(chip);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText("Test Debt")).not.toBeInTheDocument();
    });
  });

  test("marks and unmarks a debt as paid", async () => {
    render(<DebtCalendar storageKey="test" initialDebts={[]} />);

    fireEvent.click(screen.getByRole("button", { name: /new/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    const [chip] = await screen.findAllByText("Test Debt");
    fireEvent.click(chip);
    fireEvent.click(screen.getByRole("button", { name: /mark paid/i }));
    fireEvent.click(screen.getByLabelText("Close"));
    await waitFor(() =>
      expect(screen.getAllByText("Test Debt")[0]).toHaveClass("line-through"),
    );

    const [chip2] = await screen.findAllByText("Test Debt");
    fireEvent.click(chip2);
    fireEvent.click(screen.getByRole("button", { name: /undo paid/i }));
    fireEvent.click(screen.getByLabelText("Close"));
    await waitFor(() =>
      expect(screen.getAllByText("Test Debt")[0]).not.toHaveClass(
        "line-through",
      ),
    );
  });
});
