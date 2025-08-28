/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/components/ui/switch', () => ({
  Switch: ({ onCheckedChange, ...props }: any) => (
    <input type="checkbox" onChange={onCheckedChange} {...props} />
  ),
}));

jest.mock('@/ai/flows/categorize-transaction', () => ({
  suggestCategory: jest.fn(),
}));
const { suggestCategory: suggestCategoryMock } = require('@/ai/flows/categorize-transaction') as {
  suggestCategory: jest.Mock;
};
suggestCategoryMock.mockResolvedValue('Misc');

beforeEach(() => {
  onSave.mockClear();
  toastMock.mockClear();
  suggestCategoryMock.mockClear();
});

async function openAndFill(amount: string) {
  render(<AddTransactionDialog onSave={onSave} />);
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test' } });
  fireEvent.blur(screen.getByLabelText(/description/i));
  await waitFor(() => expect(suggestCategoryMock).toHaveBeenCalled());
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
