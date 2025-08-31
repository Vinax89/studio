
/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { webcrypto } from 'crypto';
import DebtCalendar from '../components/debts/DebtCalendar';
import { mockDebts } from '@/lib/data';
import { ClientProviders } from '@/components/layout/client-providers';
import type { Debt } from '@/lib/types';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/',
}));

// Mock UI components to avoid Radix and other dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));
vi.mock('@/components/service-worker', () => ({
  ServiceWorker: () => null,
}));

let snapshotCallback: ((snapshot: { docs: Array<{ data: () => unknown }> }) => void) | null = null;
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(() => ({ withConverter: vi.fn(() => ({})) })),
  doc: vi.fn(() => ({ withConverter: vi.fn(() => ({})) })),
  onSnapshot: (_: unknown, cb: (snapshot: { docs: Array<{ data: () => unknown }> }) => void) => {
    snapshotCallback = cb;
    cb({ docs: mockDebts.map(debt => ({ data: () => debt })) });
    return () => {};
  },
  setDoc: vi.fn((_: unknown, debt: Debt) => {
    const index = mockDebts.findIndex(d => d.id === debt.id);
    if (index === -1) {
      mockDebts.push(debt);
    } else {
      mockDebts[index] = debt;
    }
    snapshotCallback?.({ docs: mockDebts.map(d => ({ data: () => d })) });
  }),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
}));
vi.mock('../components/ui/button', () => ({
  Button: (props: React.ComponentProps<'button'>) => <button {...props} />,
}));
vi.mock('../components/ui/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}));
vi.mock('../components/ui/label', () => ({
  Label: (props: React.ComponentProps<'label'>) => <label {...props} />,
}));
vi.mock('../components/ui/select', () => ({
  Select: (props: React.ComponentProps<'div'>) => <div {...props} />,
  SelectTrigger: (props: React.ComponentProps<'div'>) => <div {...props} />,
  SelectContent: (props: React.ComponentProps<'div'>) => <div {...props} />,
  SelectItem: (props: React.ComponentProps<'div'>) => <div {...props} />,
  SelectValue: () => null,
}));
vi.mock('../components/ui/textarea', () => ({
  Textarea: (props: React.ComponentProps<'textarea'>) => <textarea {...props} />,
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

  test('renders calendar', () => {
    render(
      <ClientProviders>
        <DebtCalendar />
      </ClientProviders>
    );

    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
  });
});
