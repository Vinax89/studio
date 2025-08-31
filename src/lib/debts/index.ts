import { collection, doc, QueryDocumentSnapshot } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { getDb, initFirebase } from "../firebase";
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
initFirebase();
export const debtsCollection = collection(getDb(), "debts").withConverter(debtConverter);
export const debtDoc = (id: string) => doc(getDb(), "debts", id).withConverter(debtConverter);
