import { collection, getDocs, setDoc, deleteDoc, doc, addDoc } from "firebase/firestore";
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

  for (const snap of snapshot.docs) {
    const data = snap.data() as Transaction;
    if (new Date(data.date) < cutoff) {
      await setDoc(doc(db, "transactions_archive", snap.id), data);
      await deleteDoc(doc(db, "transactions", snap.id));
    }
  }
}

/**
 * Removes debts that have been fully paid off (currentAmount <= 0).
 */
export async function cleanupDebts(): Promise<void> {
  const debtsCol = collection(db, "debts");
  const snapshot = await getDocs(debtsCol);

  for (const snap of snapshot.docs) {
    const data = snap.data() as Debt;
    if (data.currentAmount <= 0) {
      await deleteDoc(doc(db, "debts", snap.id));
    }
  }
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

