
/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../components/auth/auth-provider';
let mockPathname = '/';
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}));

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    app: { options: { apiKey: 'test' }, name: '[DEFAULT]' },
  },
}));

type MockUser = { uid: string } | null;
let mockUser: MockUser = null;
const onAuthStateChanged = jest.fn(
  (_auth: unknown, cb: (u: MockUser) => void) => {
    cb(mockUser);
    return () => {};
  }
);

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (
    ...args: Parameters<typeof onAuthStateChanged>
  ) => onAuthStateChanged(...args),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { auth: authStub } = require('@/lib/firebase') as {
  auth: {
    currentUser: null;
    app: { options: { apiKey: string }; name: string };
  };
};

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
    <AuthProvider>
      <DisplayUser />
    </AuthProvider>
  );

  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  expect(screen.getByText('abc')).toBeInTheDocument();
});

test('redirects to "/" when unauthenticated on protected route', async () => {
  mockPathname = '/dashboard';
  mockUser = null;

  render(
    <AuthProvider>
      <DisplayUser />
    </AuthProvider>
  );

  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'));
  expect(screen.getByText('none')).toBeInTheDocument();
});

test('handles missing persisted user', () => {
  const key = `firebase:authUser:${authStub.app.options.apiKey}:${authStub.app.name}`;
  localStorage.removeItem(key);
  const renderComponent = () =>
    render(
      <AuthProvider>
        <DisplayUser />
      </AuthProvider>
    );
  expect(renderComponent).not.toThrow();
  expect(screen.getByText('none')).toBeInTheDocument();
});

test('handles corrupted persisted user', () => {
  const key = `firebase:authUser:${authStub.app.options.apiKey}:${authStub.app.name}`;
  localStorage.setItem(key, '{bad json');
  const renderComponent = () =>
    render(
      <AuthProvider>
        <DisplayUser />
      </AuthProvider>
    );
  expect(renderComponent).not.toThrow();
  expect(screen.getByText('none')).toBeInTheDocument();
});
