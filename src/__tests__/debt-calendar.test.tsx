
/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { webcrypto } from 'crypto';
import DebtCalendar from '../components/debts/DebtCalendar';
import { mockDebts } from '@/lib/data';
import { ClientProviders } from '@/components/layout/client-providers';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/',
}));

// Mock UI components to avoid Radix and other dependencies
jest.mock('lucide-react', () => ({ X: () => null }));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));
jest.mock('@/components/service-worker', () => ({
  ServiceWorker: () => null,
}));

let snapshotCallback: ((snapshot: { docs: Array<{ data: () => unknown }> }) => void) | null = null;
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(() => ({ withConverter: jest.fn(() => ({})) })),
  doc: jest.fn(() => ({ withConverter: jest.fn(() => ({})) })),
  onSnapshot: (_: unknown, cb: (snapshot: { docs: Array<{ data: () => unknown }> }) => void) => {
    snapshotCallback = cb;
    cb({ docs: mockDebts.map(debt => ({ data: () => debt })) });
    return () => {};
  },
  setDoc: jest.fn((_: unknown, debt: any) => {
    const index = mockDebts.findIndex(d => d.id === debt.id);
    if (index === -1) {
      mockDebts.push(debt);
    } else {
      mockDebts[index] = debt;
    }
    snapshotCallback?.({ docs: mockDebts.map(d => ({ data: () => d })) });
  }),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
}));
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

jest.mock('lucide-react', () => ({
  X: () => null,
}));

describe('DebtCalendar', () => {
  beforeAll(() => {
    if (!global.crypto) {
      global.crypto = webcrypto as Crypto;
    }
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

  test('renders calendar', () => {
    render(
      <ClientProviders>
        <DebtCalendar />
      </ClientProviders>
    );

    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
  });
});
