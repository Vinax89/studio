
/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { webcrypto } from 'crypto';
import DebtCalendar from '../components/debts/DebtCalendar';
import { mockDebts } from '@/lib/data';
import { ClientProviders } from '@/components/layout/client-providers';

jest.mock('lucide-react', () => ({ X: () => null }));

const mockPathname = '/';
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}));

jest.mock('firebase/firestore', () => {
  const collectionMock = jest.fn(() => ({
    withConverter: jest.fn().mockReturnThis(),
  }));
  const docMock = jest.fn(() => ({
    withConverter: jest.fn().mockReturnThis(),
  }));
  return {
    getFirestore: jest.fn(),
    collection: collectionMock,
    doc: docMock,
    onSnapshot: (
      _collectionRef: unknown,
      callback: (snapshot: { docs: Array<{ data: () => unknown }> }) => void
    ) => {
      callback({
        docs: mockDebts.map(debt => ({
          data: () => debt,
        })),
      });
      return () => {};
    },
    setDoc: jest.fn(),
    deleteDoc: jest.fn(),
    updateDoc: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn(),
  };
});

// Mock UI components to avoid Radix and other dependencies
jest.mock('../components/ui/button', () => ({
  Button: (props: React.ComponentProps<'button'>) => <button {...props} />,
}));
jest.mock('../components/ui/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}));
jest.mock('../components/ui/label', () => ({
  Label: (props: React.ComponentProps<'label'>) => <label {...props} />,
}));
jest.mock('../components/ui/select', () => ({
  Select: (props: React.ComponentProps<'div'>) => <div {...props} />,
  SelectTrigger: (props: React.ComponentProps<'div'>) => <div {...props} />,
  SelectContent: (props: React.ComponentProps<'div'>) => <div {...props} />,
  SelectItem: (props: React.ComponentProps<'div'>) => <div {...props} />,
  SelectValue: () => null,
}));
jest.mock('../components/ui/textarea', () => ({
  Textarea: (props: React.ComponentProps<'textarea'>) => <textarea {...props} />,
}));

describe('DebtCalendar', () => {
  beforeAll(() => {
    if (!global.crypto) {
      global.crypto = webcrypto as Crypto;
    }
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(() => {
    localStorage.clear();
  });

  function fillRequiredFields() {
    fireEvent.change(screen.getByPlaceholderText('e.g., X1 Card'), { target: { value: 'Test Debt' } });
    fireEvent.change(screen.getByPlaceholderText('5.5'), { target: { value: '5' } });
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '1000' } });
    fireEvent.change(screen.getByPlaceholderText('3250'), { target: { value: '1000' } });
    fireEvent.change(screen.getByPlaceholderText('150'), { target: { value: '100' } });
  }

  test.skip('adds a debt', async () => {
    render(
      <ClientProviders>
        <DebtCalendar />
      </ClientProviders>
    );

    fireEvent.click(screen.getByRole('button', { name: /new/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Test Debt')).toBeInTheDocument();
  });
});
