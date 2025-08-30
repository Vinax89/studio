/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';

let suggestCategoryMock: jest.Mock;
const onSave = jest.fn();
const toastMock = jest.fn();

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));
jest.mock('lucide-react', () => ({ PlusCircle: () => null }));
jest.mock('@/components/ui/dialog', () => {
  const Mock = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
  return {
    Dialog: Mock,
    DialogTrigger: Mock,
    DialogContent: Mock,
    DialogDescription: Mock,
    DialogFooter: Mock,
    DialogHeader: Mock,
    DialogTitle: Mock,
  };
});
jest.mock('@/components/ui/select', () => {
  const Mock = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
  return {
    Select: Mock,
    SelectContent: Mock,
    SelectItem: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    SelectTrigger: Mock,
    SelectValue: Mock,
  };
});
jest.mock('@/components/ui/switch', () => ({
  Switch: ({
    onCheckedChange,
    ...props
  }: {
    onCheckedChange: (checked: boolean) => void;
    [key: string]: unknown;
  }) => (
    <input
      type="checkbox"
      onChange={(e) => onCheckedChange(e.target.checked)}
      {...props}
    />
  ),
}));
jest.mock('@/ai/flows/suggest-category', () => ({
  suggestCategory: (...args: unknown[]) => suggestCategoryMock(...args),
}));

const originalEnv = process.env.NODE_ENV;

beforeEach(() => {
  onSave.mockClear();
  toastMock.mockClear();
  suggestCategoryMock = jest.fn().mockResolvedValue({ category: 'Food' });
  process.env.NODE_ENV = 'development';
  jest.useFakeTimers();
});

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
  jest.useRealTimers();
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

  it('fires only one suggestion request when typing rapidly', async () => {
    render(<AddTransactionDialog onSave={onSave} />);
    const input = screen.getByLabelText(/description/i);
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.change(input, { target: { value: 'AB' } });
    fireEvent.change(input, { target: { value: 'ABC' } });

    expect(suggestCategoryMock).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => expect(suggestCategoryMock).toHaveBeenCalledTimes(1));
  });
});
