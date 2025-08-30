import { useEffect, useState } from "react";
import { onSnapshot, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import type { Debt } from "../types";
import { debtsCollection, debtDoc } from ".";
import { logger } from "../logger";

// Hook to subscribe to debts collection and expose helpers for CRUD operations.
export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      debtsCollection,
      snap => {
        const items = snap.docs.map(d => d.data());
        setDebts(items);
        setError(null);
      },
      err => {
        logger.error("Error subscribing to debts", err);
        setError(err);
      }
    );
    return () => unsub();
  }, []);

  const addOrUpdateDebtFn = async (next: Debt) => {
    try {
      await addOrUpdateDebt(next);
      setError(null);
    } catch (err) {
      logger.error("Error adding/updating debt", err);
      setError(err as Error);
    }
  };

  const deleteDebtFn = async (id: string) => {
    try {
      await deleteDebt(id);
      setError(null);
    } catch (err) {
      logger.error("Error deleting debt", err);
      setError(err as Error);
    }
  };

  const markPaidFn = async (dateISO: string, id: string) => {
    try {
      await markPaid(dateISO, id);
      setError(null);
    } catch (err) {
      logger.error("Error marking debt paid", err);
      setError(err as Error);
    }
  };

  const unmarkPaidFn = async (dateISO: string, id: string) => {
    try {
      await unmarkPaid(dateISO, id);
      setError(null);
    } catch (err) {
      logger.error("Error unmarking debt paid", err);
      setError(err as Error);
    }
  };

  return { debts, error, addOrUpdateDebt: addOrUpdateDebtFn, deleteDebt: deleteDebtFn, markPaid: markPaidFn, unmarkPaid: unmarkPaidFn };
}

export async function addOrUpdateDebt(next: Debt) {
  await setDoc(debtDoc(next.id), next);
}

export async function deleteDebt(id: string) {
  await deleteDoc(debtDoc(id));
}

export async function markPaid(dateISO: string, id: string) {
  await updateDoc(debtDoc(id), { paidDates: arrayUnion(dateISO) });
}

export async function unmarkPaid(dateISO: string, id: string) {
  await updateDoc(debtDoc(id), { paidDates: arrayRemove(dateISO) });
}
