/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import type { Transaction } from "@/lib/types";

jest.mock("lucide-react", () => ({ Repeat: () => null }));

function createTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `t${i}`,
    date: "2024-01-01",
    description: `Item ${i}`,
    type: i % 2 === 0 ? "Income" : "Expense",
    category: "Misc",
    amount: i,
    currency: "USD",
    isRecurring: false,
  }));
}

describe("TransactionsTable", () => {
  it("renders all transactions without pagination controls", () => {
    const transactions = createTransactions(25);
    render(
      <TransactionsTable
        transactions={transactions}
        height={25 * 56}
      />,
    );

    expect(screen.getByText("Item 0")).toBeInTheDocument();
    expect(screen.getByText("Item 24")).toBeInTheDocument();
    expect(screen.queryByText(/Previous/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Next/i)).not.toBeInTheDocument();
  });
});
