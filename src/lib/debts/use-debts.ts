import { useEffect, useState } from "react";
import { onSnapshot, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import type { Debt } from "../types";
import { debtsCollection, debtDoc } from ".";

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(debtsCollection, (snap) => {
      const items = snap.docs.map((d) => d.data());
      setDebts(items);
    });
    return () => unsub();
  }, []);

  async function addOrUpdateDebt(next: Debt) {
    await setDoc(debtDoc(next.id), next);
  }

  async function deleteDebt(id: string) {
    await deleteDoc(debtDoc(id));
  }

  async function markPaid(dateISO: string, id: string) {
    await updateDoc(debtDoc(id), { paidDates: arrayUnion(dateISO) });
  }

  async function unmarkPaid(dateISO: string, id: string) {
    await updateDoc(debtDoc(id), { paidDates: arrayRemove(dateISO) });
  }

  return { debts, addOrUpdateDebt, deleteDebt, markPaid, unmarkPaid };
}

export type UseDebtsReturn = ReturnType<typeof useDebts>;
