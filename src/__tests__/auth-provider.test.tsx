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

jest.mock('@/lib/firebase', () => ({ auth: { currentUser: null } }));
const { auth: authStub } = require('@/lib/firebase');

let mockUser: any = null;
const onAuthStateChanged = jest.fn((_auth: unknown, cb: (u: any) => void) => {
  cb(mockUser);
  return () => {};
});

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: any[]) => (onAuthStateChanged as any)(...args),
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
});

test('redirects to dashboard when authenticated on "/" and updates context', async () => {
  mockPathname = '/';
  mockUser = { uid: 'abc' } as any;

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
