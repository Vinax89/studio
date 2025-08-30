
/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { webcrypto } from 'crypto';
import DebtCalendar from '../components/debts/DebtCalendar';
import { ClientProviders } from '@/components/layout/client-providers';

jest.mock('firebase/firestore', () => {
  const debtsData: any[] = [];
  let snapshotCb: ((snapshot: { docs: Array<{ data: () => unknown }> }) => void) | null = null;
  return {
    getFirestore: jest.fn(),
    collection: jest.fn(() => ({ withConverter: jest.fn().mockReturnValue({}) })),
    doc: jest.fn(() => ({ withConverter: jest.fn().mockReturnValue({}) })),
    onSnapshot: (_: unknown, cb: (snapshot: { docs: Array<{ data: () => unknown }> }) => void) => {
      snapshotCb = cb;
      cb({
        docs: debtsData.map((debt) => ({
          data: () => debt,
        })),
      });
      return () => {};
    },
    setDoc: jest.fn((_ref, data) => {
      debtsData.push(data);
      snapshotCb?.({
        docs: debtsData.map((debt) => ({ data: () => debt })),
      });
      return Promise.resolve();
    }),
    deleteDoc: jest.fn(),
    updateDoc: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn(),
  };
});

let mockPathname = '/';
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}));

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: { uid: 'user' },
    app: { options: { apiKey: 'test' }, name: '[DEFAULT]' },
  },
  initFirebase: jest.fn(),
}));
import { auth as authStub, initFirebase } from '@/lib/firebase';

const onAuthStateChanged = jest.fn(
  (_auth: unknown, cb: (u: unknown) => void) => {
    cb(authStub.currentUser);
    return () => {};
  }
);

jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  onAuthStateChanged: (
    ...args: Parameters<typeof onAuthStateChanged>
  ) => onAuthStateChanged(...args),
}));

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
    initFirebase();
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

  test('adds a debt', async () => {
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
