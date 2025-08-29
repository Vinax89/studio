import {
  collection,
  getDocs,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Transaction, Debt, Goal } from "../lib/types";
import { getCurrentTime } from "../lib/internet-time";

/**
 * Moves transactions older than the provided cutoff date to an archive collection
 * and removes them from the main transactions collection.
 */
export async function archiveOldTransactions(cutoffDate: string): Promise<void> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoffDate)) {
    throw new Error(`Invalid cutoff date: ${cutoffDate}`);
  }
  const parsed = new Date(cutoffDate);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== cutoffDate
  ) {
    throw new Error(`Invalid cutoff date: ${cutoffDate}`);
  }
  const cutoff = cutoffDate;
  const transCol = collection(db, "transactions");
  const pageSize = 100;
  let lastDoc: QueryDocumentSnapshot<unknown> | undefined;

  for (;;) {
    const q = lastDoc
      ? query(
          transCol,
          where("date", "<", cutoff),
          orderBy("date"),
          startAfter(lastDoc),
          limit(pageSize)
        )
      : query(
          transCol,
          where("date", "<", cutoff),
          orderBy("date"),
          limit(pageSize)
        );

    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    const batch = writeBatch(db);
    for (const snap of snapshot.docs) {
      const data = { id: snap.id, ...(snap.data() as Omit<Transaction, "id">) };
      batch.set(doc(db, "transactions_archive", snap.id), data);
      batch.delete(doc(db, "transactions", snap.id));
    }

    await runWithRetry(() => batch.commit());

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < pageSize) break;
  }
}

/**
 * Removes debts that have been fully paid off (currentAmount <= 0).
 */
export async function cleanupDebts(): Promise<void> {
  const debtsCol = collection(db, "debts");
  const pageSize = 100;
  let lastDoc: QueryDocumentSnapshot<unknown> | undefined;

  for (;;) {
    const q = lastDoc
      ? query(
          debtsCol,
          where("currentAmount", "<=", 0),
          orderBy("currentAmount"),
          startAfter(lastDoc),
          limit(pageSize)
        )
      : query(
          debtsCol,
          where("currentAmount", "<=", 0),
          orderBy("currentAmount"),
          limit(pageSize)
        );

    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    const batch = writeBatch(db);
    for (const snap of snapshot.docs) {
      batch.delete(doc(db, "debts", snap.id));
    }

    await runWithRetry(() => batch.commit());

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < pageSize) break;
  }
}

export async function runWithRetry<T>(
  op: () => Promise<T>,
  retries = 1,
  delayMs = 100,
  maxDelayMs = Number.POSITIVE_INFINITY,
  jitter = 0,
  isRetryable: (err: unknown) => boolean = () => true
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await op();
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err);
      if (!isRetryable(err) || attempt === retries) {
        // Final failure after exhausting retries
        throw err;
      }
      const baseDelay = delayMs * 2 ** attempt;
      const delay = Math.min(
        baseDelay + Math.random() * jitter,
        maxDelayMs
      );
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
export async function backupData(
  retries = 1,
  delayMs = 100
): Promise<{
  transactions: Transaction[];
  debts: Debt[];
  goals: Goal[];
}> {
  async function fetchAll<T>(colName: string, orderField: string): Promise<T[]> {
    const col = collection(db, colName);
    const pageSize = 100;
    const items: T[] = [];
    let lastDoc: QueryDocumentSnapshot<unknown> | undefined;

    for (;;) {
      const q = lastDoc
        ? query(col, orderBy(orderField), startAfter(lastDoc), limit(pageSize))
        : query(col, orderBy(orderField), limit(pageSize));

      const snap = await getDocs(q);
      if (snap.empty) break;

      for (const d of snap.docs) {
        const data = { ...(d.data() as T), id: d.id } as T;
        items.push(data);
      }

      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.size < pageSize) break;
    }
    return items;
  }

  const data = {
    transactions: await fetchAll<Transaction>("transactions", "id"),
    debts: await fetchAll<Debt>("debts", "id"),
    goals: await fetchAll<Goal>("goals", "id"),
  };

  await runWithRetry(
    async () =>
      addDoc(collection(db, "backups"), {
        ...data,
        createdAt: (await getCurrentTime()).toISOString(),
      }),
    retries,
    delayMs
  );

  return data;
}

