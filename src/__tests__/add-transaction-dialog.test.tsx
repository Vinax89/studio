/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { clearCategories } from '@/lib/categoryService';

const onSave = jest.fn();
const toastMock = jest.fn();

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));
jest.mock('lucide-react', () => ({ PlusCircle: () => null }));
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({
    children,
    ...props
  }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  SelectTrigger: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/ui/switch', () => ({
  Switch: ({
    onCheckedChange,
    ...props
  }: { onCheckedChange?: (checked: boolean) => void } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <input type="checkbox" onChange={onCheckedChange} {...props} />
  ),
}));

beforeEach(() => {
  onSave.mockClear();
  toastMock.mockClear();
  clearCategories();
});

async function openAndFill(amount: string) {
  render(<AddTransactionDialog onSave={onSave} />);
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test' } });
  fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: amount } });
  fireEvent.click(screen.getByText(/save transaction/i));
}

describe('AddTransactionDialog', () => {
  it.each(['abc', 'Infinity'])(
    'shows toast and prevents save for invalid amount "%s"',
    async (amount) => {
      await openAndFill(amount);
      expect(onSave).not.toHaveBeenCalled();
      expect(toastMock).toHaveBeenCalled();
    }
  );
});
