import { collection, doc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { getDb } from "../firebase";
import type { Debt } from "../types";

// Firestore data converter for `Debt` documents.
const debtConverter = {
  toFirestore(debt: Omit<Debt, "id">): DocumentData {
    return debt;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Debt {
    const data = snapshot.data() as Omit<Debt, "id">;
    return { id: snapshot.id, ...data };
  },
};

export function getDebtsCollection() {
  return collection(getDb(), "debts").withConverter(debtConverter);
}

export function getDebtDoc(id: string) {
  return doc(getDb(), "debts", id).withConverter(debtConverter);
}
