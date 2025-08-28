import {
  collection,
  getDocs,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Transaction, Debt, Goal } from "../lib/types";

/**
 * Moves transactions older than the provided cutoff date to an archive collection
 * and removes them from the main transactions collection.
 */
export async function archiveOldTransactions(cutoffDate: string): Promise<void> {
  const cutoff = new Date(cutoffDate);
  const transCol = collection(db, "transactions");
  const snapshot = await getDocs(transCol);

  const ops: Promise<void>[] = [];

  for (const snap of snapshot.docs) {
    const data = snap.data() as Transaction;
    if (new Date(data.date) < cutoff) {
      ops.push(
        setDoc(doc(db, "transactions_archive", snap.id), data),
        deleteDoc(doc(db, "transactions", snap.id))
      );
    }
  }

  await runWithRetry(() => Promise.all(ops));
}

/**
 * Removes debts that have been fully paid off (currentAmount <= 0).
 */
export async function cleanupDebts(): Promise<void> {
  const debtsCol = collection(db, "debts");
  const snapshot = await getDocs(debtsCol);

  const deletions: Promise<void>[] = [];

  for (const snap of snapshot.docs) {
    const data = snap.data() as Debt;
    if (data.currentAmount <= 0) {
      deletions.push(deleteDoc(doc(db, "debts", snap.id)));
    }
  }

  await runWithRetry(() => Promise.all(deletions));
}

/**
 * Executes an async operation with retries using exponential backoff.
 *
 * @param op      The operation to execute.
 * @param options Optional configuration for retries.
 *                - retries: maximum number of retry attempts (default 3)
 *                - baseDelayMs: initial delay before retrying (default 100ms)
 *                - jitterPct: random jitter percentage applied to the delay
 *                  (default 0.1 meaning ±10%)
 */
export async function runWithRetry<T>(
  op: () => Promise<T>,
  {
    retries = 3,
    baseDelayMs = 100,
    jitterPct = 0.1,
  }: { retries?: number; baseDelayMs?: number; jitterPct?: number } = {}
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await op();
    } catch (err) {
      if (attempt === retries) throw err;
      console.error(`Attempt ${attempt + 1} failed:`, err);
      const baseDelay = baseDelayMs * 2 ** attempt;
      const jitterRange = baseDelay * jitterPct;
      const jitter = (Math.random() * 2 - 1) * jitterRange;
      const delay = Math.round(baseDelay + jitter);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  // Should be unreachable
  throw new Error("retry attempts exhausted");
}

/**
 * Creates a backup snapshot of current transactions, debts, and goals.
 * The snapshot is stored in the `backups` collection with a timestamp and
 * also returned to the caller for convenience.
 */
export async function backupData(): Promise<{
  transactions: Transaction[];
  debts: Debt[];
  goals: Goal[];
}> {
  const transactionsSnap = await getDocs(collection(db, "transactions"));
  const debtsSnap = await getDocs(collection(db, "debts"));
  const goalsSnap = await getDocs(collection(db, "goals"));

  const data = {
    transactions: transactionsSnap.docs.map((d) => d.data() as Transaction),
    debts: debtsSnap.docs.map((d) => d.data() as Debt),
    goals: goalsSnap.docs.map((d) => d.data() as Goal),
  };

  await addDoc(collection(db, "backups"), {
    ...data,
    createdAt: new Date().toISOString(),
  });

  return data;
}

