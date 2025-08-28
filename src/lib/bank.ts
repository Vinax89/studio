import type { Transaction } from "./types";
import { mockTransactions } from "./data";

// Mock bank import; replace with real API integration as needed.
export async function importTransactions(): Promise<Transaction[]> {
  return mockTransactions;
}
