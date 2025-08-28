/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';

const onSave = jest.fn();
const toastMock = jest.fn();

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));
jest.mock('lucide-react', () => ({ PlusCircle: () => null }));
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/components/ui/select', () => {
  const React = require('react');
  return {
    Select: ({ children, value, onValueChange, id, 'data-testid': dataTestId }: any) => (
      <select
        id={id}
        data-testid={dataTestId}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        {children}
      </select>
    ),
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: ({ children }: any) => <>{children}</>,
  };
});
jest.mock('@/components/ui/switch', () => ({
  Switch: ({ onCheckedChange, ...props }: any) => (
    <input type="checkbox" onChange={onCheckedChange} {...props} />
  ),
}));
jest.mock('@/components/categories/categories-context', () => ({
  useCategories: () => ({
    categories: ['Misc'],
    addCategory: jest.fn(),
    removeCategory: jest.fn(),
    updateCategory: jest.fn(),
  }),
}));
jest.mock('@/components/categories/category-manager', () => ({
  CategoryManager: () => null,
}));

beforeEach(() => {
  onSave.mockClear();
  toastMock.mockClear();
});

function openAndFill(amount: string) {
  render(<AddTransactionDialog onSave={onSave} />);
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test' } });
  fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: amount } });
  fireEvent.change(screen.getByTestId('category'), { target: { value: 'Misc' } });
  fireEvent.click(screen.getByText(/save transaction/i));
}

describe('AddTransactionDialog', () => {
  it.each(['abc', 'Infinity'])(
    'shows toast and prevents save for invalid amount "%s"',
    (amount) => {
      openAndFill(amount);
      expect(onSave).not.toHaveBeenCalled();
      expect(toastMock).toHaveBeenCalled();
    }
  );
});
