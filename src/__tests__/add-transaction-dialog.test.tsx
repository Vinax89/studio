/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';

const onSave = jest.fn();
const toastMock = jest.fn();
const recordCategoryFeedbackMock = jest.fn();
const loggerErrorMock = jest.fn();
const suggestCategoryMock = jest.fn();

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
jest.mock('@/lib/category-feedback', () => ({
  recordCategoryFeedback: (...args: unknown[]) =>
    recordCategoryFeedbackMock(...args),
}));
jest.mock('@/lib/logger', () => ({
  logger: { error: (...args: unknown[]) => loggerErrorMock(...args) },
}));
jest.mock('@/ai/flows/suggest-category', () => ({
  suggestCategory: (...args: unknown[]) => suggestCategoryMock(...args),
}));

beforeEach(() => {
  onSave.mockClear();
  toastMock.mockClear();
  recordCategoryFeedbackMock.mockClear();
  loggerErrorMock.mockClear();
  suggestCategoryMock.mockClear();
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

describe('recordCategoryFeedback', () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  async function fillAndSave() {
    render(<AddTransactionDialog onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test' },
    });
    await waitFor(() => expect(suggestCategoryMock).toHaveBeenCalled());
    await screen.findByDisplayValue('AI');
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Manual' },
    });
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByText(/save transaction/i));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
  }

  it('records category feedback successfully', async () => {
    process.env.NODE_ENV = 'development';
    suggestCategoryMock.mockResolvedValue({ category: 'AI' });
    recordCategoryFeedbackMock.mockResolvedValue(true);

    await fillAndSave();

    await waitFor(() =>
      expect(recordCategoryFeedbackMock).toHaveBeenCalledWith('Test', 'Manual')
    );
    expect(loggerErrorMock).not.toHaveBeenCalled();
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('notifies user when recording feedback fails', async () => {
    process.env.NODE_ENV = 'development';
    suggestCategoryMock.mockResolvedValue({ category: 'AI' });
    recordCategoryFeedbackMock.mockResolvedValue(false);

    await fillAndSave();

    await waitFor(() => expect(recordCategoryFeedbackMock).toHaveBeenCalled());
    expect(loggerErrorMock).toHaveBeenCalledWith(
      'Failed to record category feedback',
      expect.any(Error)
    );
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Failed to record category feedback',
      })
    );
  });
});
