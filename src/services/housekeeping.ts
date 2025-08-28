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
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type WriteBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Transaction, Debt, Goal } from "../lib/types";

export async function paginateCollection<T>(
  colName: string,
  filter: QueryConstraint,
  orderField: string,
  perItem: (snap: QueryDocumentSnapshot<T>, batch: WriteBatch) =>
    | void
    | Promise<void>,
  pageSize = 100
): Promise<void> {
  const col = collection(db, colName);
  let lastDoc: QueryDocumentSnapshot<T> | undefined;

  while (true) {
    const q = lastDoc
      ? query(col, filter, orderBy(orderField), startAfter(lastDoc), limit(pageSize))
      : query(col, filter, orderBy(orderField), limit(pageSize));

    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    const batch = writeBatch(db);
    for (const snap of snapshot.docs as QueryDocumentSnapshot<T>[]) {
      await perItem(snap, batch);
    }

    await runWithRetry(() => batch.commit());

    lastDoc = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot<T>;
    if (snapshot.size < pageSize) break;
  }
}

/**
 * Moves transactions older than the provided cutoff date to an archive collection
 * and removes them from the main transactions collection.
 */
export async function archiveOldTransactions(cutoffDate: string): Promise<void> {
  const cutoff = new Date(cutoffDate).toISOString();

  await paginateCollection<Transaction>(
    "transactions",
    where("date", "<", cutoff),
    "date",
    (snap, batch) => {
      const data = snap.data() as Transaction;
      batch.set(doc(db, "transactions_archive", snap.id), data);
      batch.delete(doc(db, "transactions", snap.id));
    }
  );
}

/**
 * Removes debts that have been fully paid off (currentAmount <= 0).
 */
export async function cleanupDebts(): Promise<void> {
  await paginateCollection<Debt>(
    "debts",
    where("currentAmount", "<=", 0),
    "currentAmount",
    (snap, batch) => {
      batch.delete(doc(db, "debts", snap.id));
    }
  );
}

export async function runWithRetry<T>(
  op: () => Promise<T>,
  retries = 1,
  delayMs = 100
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await op();
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err);
      if (attempt === retries) {
        // Final failure after exhausting retries
        throw err;
      }
      const delay = delayMs * 2 ** attempt;
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
    let lastDoc: any | undefined;

    while (true) {
      const q = lastDoc
        ? query(col, orderBy(orderField), startAfter(lastDoc), limit(pageSize))
        : query(col, orderBy(orderField), limit(pageSize));

      const snap = await getDocs(q);
      if (snap.empty) break;

      for (const d of snap.docs) {
        items.push(d.data() as T);
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
    () =>
      addDoc(collection(db, "backups"), {
        ...data,
        createdAt: new Date().toISOString(),
      }),
    retries,
    delayMs
  );

  return data;
}

