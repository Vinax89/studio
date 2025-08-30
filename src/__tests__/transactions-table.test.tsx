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
  userId: string;
};

function makeTransactions(count: number): Tx[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `tx-${i}`,
    userId: 'user1',
    date: '2024-01-01',
    description: `Transaction ${i + 1}`,
    category: 'Misc',
    type: 'Income',
    amount: 100,
    currency: 'USD',
    isRecurring: false,
  }));
}

const ROW_HEIGHT = 56;
const LIST_HEIGHT = 400;

describe('TransactionsTable', () => {
  it('virtualizes transactions', async () => {
    const transactions = makeTransactions(100);
    render(<TransactionsTable transactions={transactions} />);

    const table = screen.getByRole('table');
    const scrollContainer = table.parentElement as HTMLElement;

    Object.defineProperty(scrollContainer, 'scrollHeight', {
      configurable: true,
      value: ROW_HEIGHT * transactions.length,
    });
    Object.defineProperty(scrollContainer, 'clientHeight', {
      configurable: true,
      value: LIST_HEIGHT,
    });

    // Only a subset of rows should render initially
    expect(screen.queryByText('Transaction 100')).not.toBeInTheDocument();

    const scrollOffset = ROW_HEIGHT * transactions.length;
    scrollContainer.scrollTop = scrollOffset;
    fireEvent.scroll(scrollContainer, { target: { scrollTop: scrollOffset } });

    expect(await screen.findByText('Transaction 100')).toBeInTheDocument();
    expect(screen.queryByText('Transaction 1')).not.toBeInTheDocument();
  });
});
