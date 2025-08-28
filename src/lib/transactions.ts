import type { Transaction } from './types';
import { mockTransactions } from './data';

/**
 * Persist a batch of transactions.
 * In the current demo this simply updates the in-memory mock dataset.
 * In a real application this would interface with a database or API.
 */
export async function saveTransactions(newTransactions: Transaction[]): Promise<void> {
  // Prepend transactions so newest appear first
  mockTransactions.unshift(...newTransactions);
}

/**
 * Request transaction import from the banking provider via API route.
 */
export async function importTransactions(): Promise<Transaction[]> {
  const res = await fetch('/api/bank/import', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to import transactions');
  const data = (await res.json()) as { transactions: Transaction[] };
  return data.transactions;
}
