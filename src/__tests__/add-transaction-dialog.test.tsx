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
  Dialog: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogDescription: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogFooter: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectItem: (
    { children, ...props }: React.PropsWithChildren<Record<string, unknown>>
  ) => <div {...props}>{children}</div>,
  SelectTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectValue: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('@/components/ui/switch', () => ({
  Switch: ({
    onCheckedChange,
    ...props
  }: { onCheckedChange?: (checked: boolean) => void } & Record<string, unknown>) => (
    <input
      type="checkbox"
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
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
