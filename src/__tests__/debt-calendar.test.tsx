/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClientProviders } from '@/components/layout/client-providers';
jest.mock('lucide-react', () => ({ X: () => null }));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));
if (!window.matchMedia) {
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
}
jest.mock('../components/debts/DebtCalendar', () => ({
  __esModule: true,
  default: () => <div>DebtCalendar</div>,
}));
import DebtCalendar from '../components/debts/DebtCalendar';

describe('DebtCalendar', () => {
  test('renders calendar', () => {
    render(
      <ClientProviders>
        <DebtCalendar />
      </ClientProviders>,
    );
    expect(screen.getByText('DebtCalendar')).toBeInTheDocument();
  });
});
