/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DebtForm from "@/components/debts/DebtForm";

jest.mock("@/components/ui/select", () => {
  const Mock = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
  return {
    Select: Mock,
    SelectContent: Mock,
    SelectItem: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    SelectTrigger: Mock,
    SelectValue: Mock,
  };
});

const baseProps = {
  dateISO: "2024-01-01",
  initial: null,
  onClose: jest.fn(),
  onSave: jest.fn(),
  onMarkPaid: jest.fn(),
  onUnmarkPaid: jest.fn(),
};

describe("DebtForm", () => {
  beforeEach(() => {
    baseProps.onSave.mockClear();
  });

  it("calls onSave with valid input", async () => {
    render(<DebtForm {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText("e.g., X1 Card"), { target: { value: "Loan" } });
    fireEvent.change(screen.getByPlaceholderText("5.5"), { target: { value: "5" } });
    fireEvent.change(screen.getByPlaceholderText("5000"), { target: { value: "5000" } });
    fireEvent.change(screen.getByPlaceholderText("3250"), { target: { value: "3000" } });
    fireEvent.change(screen.getByPlaceholderText("150"), { target: { value: "200" } });
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => expect(baseProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
      name: "Loan",
      interestRate: 5,
      initialAmount: 5000,
      currentAmount: 3000,
      minimumPayment: 200,
    })));
  });

  it("shows errors for invalid input", async () => {
    render(<DebtForm {...baseProps} />);
    fireEvent.click(screen.getByText("Save"));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(baseProps.onSave).not.toHaveBeenCalled();
  });
});
