import { useEffect, useState } from "react";
import { onSnapshot, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import type { Debt } from "../types";
import { debtsCollection, debtDoc } from ".";

// Hook to subscribe to debts collection and expose helpers for CRUD operations.
export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(debtsCollection, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Debt, "id">) }));
      setDebts(items);
    });
    return () => unsub();
  }, []);

  return { debts, addOrUpdateDebt, deleteDebt, markPaid, unmarkPaid };
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
