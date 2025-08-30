import { collection, doc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { getFirebase } from "../firebase";
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

// `debts` collection reference using the converter.
const { db } = getFirebase();
export const debtsCollection = collection(db, "debts").withConverter(debtConverter);
export const debtDoc = (id: string) => doc(db, "debts", id).withConverter(debtConverter);
