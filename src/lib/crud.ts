import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { z } from "zod";
import { db } from "./db";
import { transactionSchema, goalSchema, debtSchema, Transaction, Goal, Debt } from "./types";

async function createItem<T>(collection: string, schema: z.ZodType<T>, data: T): Promise<T> {
  const parsed = schema.parse(data);
  await setDoc(doc(db, collection, parsed.id), parsed);
  return parsed;
}

async function getItem<T>(collection: string, schema: z.ZodType<T>, id: string): Promise<T | undefined> {
  const snap = await getDoc(doc(db, collection, id));
  if (!snap.exists()) return undefined;
  return schema.parse(snap.data());
}

async function updateItem<T>(collection: string, schema: z.ZodType<T>, id: string, data: Partial<T>): Promise<void> {
  const parsed = schema.partial().parse(data);
  await updateDoc(doc(db, collection, id), parsed);
}

async function deleteItem(collection: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collection, id));
}

export const createTransaction = (data: Transaction) => createItem("transactions", transactionSchema, data);
export const getTransaction = (id: string) => getItem("transactions", transactionSchema, id);
export const updateTransaction = (id: string, data: Partial<Transaction>) => updateItem("transactions", transactionSchema, id, data);
export const deleteTransaction = (id: string) => deleteItem("transactions", id);

export const createGoal = (data: Goal) => createItem("goals", goalSchema, data);
export const getGoal = (id: string) => getItem("goals", goalSchema, id);
export const updateGoal = (id: string, data: Partial<Goal>) => updateItem("goals", goalSchema, id, data);
export const deleteGoal = (id: string) => deleteItem("goals", id);

export const createDebt = (data: Debt) => createItem("debts", debtSchema, data);
export const getDebt = (id: string) => getItem("debts", debtSchema, id);
export const updateDebt = (id: string, data: Partial<Debt>) => updateItem("debts", debtSchema, id, data);
export const deleteDebt = (id: string) => deleteItem("debts", id);
