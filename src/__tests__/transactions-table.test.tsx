/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionsTable } from '@/components/transactions/transactions-table';
jest.mock('lucide-react', () => ({ Repeat: () => null }));

type Tx = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'Income' | 'Expense';
  amount: number;
  currency: string;
  isRecurring: boolean;
};

function makeTransactions(count: number): Tx[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `tx-${i}`,
    date: '2024-01-01',
    description: `Transaction ${i + 1}`,
    category: 'Misc',
    type: 'Income',
    amount: 100,
    currency: 'USD',
    isRecurring: false,
  }));
}

describe('TransactionsTable', () => {
  it('paginates transactions', () => {
    const transactions = makeTransactions(25);
    render(<TransactionsTable transactions={transactions} />);

    // first page
    expect(screen.getByText('Transaction 1')).toBeInTheDocument();
    expect(screen.queryByText('Transaction 21')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('Transaction 21')).toBeInTheDocument();
    expect(screen.queryByText('Transaction 1')).not.toBeInTheDocument();
  });
});
