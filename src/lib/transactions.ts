import { z } from "zod";
import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import type { Transaction } from "./types";

const TransactionRow = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string(),
  amount: z.preprocess(
    (val) => (typeof val === "number" || typeof val === "string" ? String(val) : val),
    z.string()
  ),
  type: z.enum(["Income", "Expense"]),
  category: z.string(),
  isRecurring: z.union([z.boolean(), z.string()]).optional(),
});

export type TransactionRowType = z.infer<typeof TransactionRow>;

export function validateTransactions(rows: TransactionRowType[]): Transaction[] {
  return rows.map((row, index) => {
    const parsed = TransactionRow.safeParse(row);
    if (!parsed.success) {
      throw new Error(`Invalid row ${index + 1}: ${parsed.error.message}`);
    }
    const data = parsed.data;
    const amountString = data.amount.trim();
    const parsedAmount = parseFloat(amountString);
    if (isNaN(parsedAmount)) {
      throw new Error(
        `Invalid amount in row ${index + 1}: "${data.amount}" cannot be parsed as a number`
      );
    }

    return {
      id: crypto.randomUUID(),
      date: data.date,
      description: data.description,
      amount: parsedAmount,
      type: data.type,
      category: data.category,
      // Default to USD until currency is provided in import sources
      currency: "USD",
      isRecurring:
        typeof data.isRecurring === "boolean"
          ? data.isRecurring
          : data.isRecurring === "true",
    };
  });
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  const colRef = collection(db, "transactions");
  const batch = writeBatch(db);
  transactions.forEach((tx) => {
    const docRef = doc(colRef);
    batch.set(docRef, tx);
  });

  try {
    await batch.commit();
  } catch (err) {
    throw new Error(
      `Failed to save transactions batch: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

export async function importTransactions(rows: TransactionRowType[]): Promise<void> {
  const transactions = validateTransactions(rows);
  try {
    await saveTransactions(transactions);
  } catch (err) {
    throw new Error(
      `Failed to import transactions: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

export interface TransactionPersistence {
  validateTransactions: typeof validateTransactions;
  saveTransactions: typeof saveTransactions;
  importTransactions: typeof importTransactions;
}

export const transactionPersistence: TransactionPersistence = {
  validateTransactions,
  saveTransactions,
  importTransactions,
};

