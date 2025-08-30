/** @jest-environment jsdom */
import React, { ReactNode, InputHTMLAttributes } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';

const onSave = jest.fn();
const toastMock = jest.fn();

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));
jest.mock('lucide-react', () => ({ PlusCircle: () => null }));
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, ...props }: { children: ReactNode } & Record<string, unknown>) => (
    <div {...props}>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/ui/switch', () => ({
  Switch: (
    { onCheckedChange, ...props }: { onCheckedChange: (checked: boolean) => void } &
      InputHTMLAttributes<HTMLInputElement>
  ) => (
    <input
      type="checkbox"
      onChange={(e) => onCheckedChange(e.target.checked)}
      {...props}
    />
  ),
}));

beforeEach(() => {
  onSave.mockClear();
  toastMock.mockClear();
});

function openAndFill(amount: string) {
  render(<AddTransactionDialog onSave={onSave} />);
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test' } });
  fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: amount } });
  fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Misc' } });
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
