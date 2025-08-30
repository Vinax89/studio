
/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '../components/auth/auth-provider';
import { ClientProviders } from '@/components/layout/client-providers';

let mockPathname = '/';
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}));

jest.mock('lucide-react', () => ({ X: () => null }));

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    app: { options: { apiKey: 'test' }, name: '[DEFAULT]' },
  },
  initFirebase: jest.fn(),
}));
import { auth as authStub, initFirebase } from '@/lib/firebase';

beforeAll(() => {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test';
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test';
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test';
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test';
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test';
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test';
  initFirebase();
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

type User = { uid: string } | null;
let mockUser: User = null;
const onAuthStateChanged = jest.fn(
  (_auth: unknown, cb: (u: User) => void) => {
    cb(mockUser);
    return () => {};
  }
);

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (
    ...args: Parameters<typeof onAuthStateChanged>
  ) => onAuthStateChanged(...args),
}));

function DisplayUser() {
  const { user } = useAuth();
  return <div>{user ? user.uid : 'none'}</div>;
}

beforeEach(() => {
  mockUser = null;
  mockPathname = '/';
  pushMock.mockClear();
  onAuthStateChanged.mockClear();
  localStorage.clear();
});

test('redirects to dashboard when authenticated on "/" and updates context', async () => {
  mockPathname = '/';
  mockUser = { uid: 'abc' };

  render(
    <ClientProviders>
      <DisplayUser />
    </ClientProviders>
  );

  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  expect(screen.getByText('abc')).toBeInTheDocument();
});

test('redirects to "/" when unauthenticated on protected route', async () => {
  mockPathname = '/dashboard';
  mockUser = null;

  render(
    <ClientProviders>
      <DisplayUser />
    </ClientProviders>
  );

  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'));
  expect(screen.getByText('none')).toBeInTheDocument();
});

test('handles missing persisted user', () => {
  const key = `firebase:authUser:${authStub.app.options.apiKey}:${authStub.app.name}`;
  localStorage.removeItem(key);
  const renderComponent = () =>
    render(
      <ClientProviders>
        <DisplayUser />
      </ClientProviders>
    );
  expect(renderComponent).not.toThrow();
  expect(screen.getByText('none')).toBeInTheDocument();
});

test('handles corrupted persisted user', () => {
  const key = `firebase:authUser:${authStub.app.options.apiKey}:${authStub.app.name}`;
  localStorage.setItem(key, '{bad json');
  const renderComponent = () =>
    render(
      <ClientProviders>
        <DisplayUser />
      </ClientProviders>
    );
  expect(renderComponent).not.toThrow();
  expect(screen.getByText('none')).toBeInTheDocument();
});
