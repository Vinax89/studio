import { z } from "zod";
import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { db, initFirebase } from "./firebase";
import type { Transaction } from "./types";
import { currencyCodeSchema } from "./currency";

initFirebase();

export const TransactionPayloadSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string(),
  amount: z.number(),
  currency: currencyCodeSchema,
  type: z.enum(["Income", "Expense"]),
  category: z.string(),
  isRecurring: z.boolean().optional(),
});

export type TransactionPayload = z.infer<typeof TransactionPayloadSchema>;

const BaseTransactionRow = z.object({
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

export type TransactionRowType = z.infer<typeof BaseTransactionRow>;

function createTransactionRowSchema(validCategories: string[]) {
  return BaseTransactionRow.extend({
    category: z.string().refine((cat) => validCategories.includes(cat), {
      message: "Unknown category",
    }),
  });
}

/**
 * Split an array of transactions into chunks of at most 500 items.
 *
 * Firestore limits batch writes to 500 operations. This helper ensures that
 * transaction arrays are partitioned accordingly so they can be written in
 * multiple batches if necessary.
 *
 * @param transactions - Transactions to split into chunks.
 * @param chunkSize - Maximum size of each chunk. Defaults to 500.
 * @returns Array of transaction chunks.
 */
export function chunkTransactions<T>(
  transactions: T[],
  chunkSize = 500
): T[][] {
  if (chunkSize <= 0) {
    throw new Error("chunkSize must be greater than 0");
  }
  const chunks: T[][] = [];
  for (let i = 0; i < transactions.length; i += chunkSize) {
    chunks.push(transactions.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Validate a list of raw transaction rows and normalize them into the
 * internal {@link Transaction} format.
 *
 * Each row should contain a `date` in `YYYY-MM-DD` format, a `description`,
 * an `amount` that can be parsed into a number, a `type` of either
 * "Income" or "Expense", a `category`, and an optional `isRecurring` flag
 * (boolean or string).
 *
 * A new UUID is generated for every transaction and the `currency` field is
 * set to the default of `"USD"` until import sources supply currency data.
 *
 * @param rows - Array of transaction-like objects to validate and normalize.
 * @returns Array of validated transactions ready for persistence.
 * @throws {Error} If any row fails validation or if an amount cannot be
 *   parsed into a number.
 * @remarks This function performs no external I/O but generates new UUIDs for
 *   each transaction.
 */
export function validateTransactions(
  rows: TransactionRowType[],
  validCategories: string[]
): Transaction[] {
  const schema = createTransactionRowSchema(validCategories);
  return rows.map((row, index) => {
    const parsed = schema.safeParse(row);
    if (!parsed.success) {
      throw new Error(`Invalid row ${index + 1}: ${parsed.error.message}`);
    }
    const data = parsed.data;
    const amountString = data.amount.trim();
    if (!/^[+-]?\d+(\.\d+)?$/.test(amountString)) {
      throw new Error(
        `Invalid amount in row ${index + 1}: "${data.amount}" is not a valid number`
      );
    }
    const parsedAmount = Number(amountString);

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

/**
 * Persist a collection of transactions to Firestore using a batch write.
 *
 * @param transactions - Validated transaction objects to be written.
 * @throws {Error} If the Firestore batch commit fails.
 * @remarks Writes to Firestore and performs network I/O.
 */
export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  const colRef = collection(db, "transactions");
  const chunks = chunkTransactions(transactions);
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((tx) => {
      batch.set(doc(colRef, tx.id), tx);
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
}

/**
 * Validate raw transaction rows and persist the resulting transactions to
 * Firestore.
 *
 * @param rows - Raw transaction rows to validate and import.
 * @throws {Error} If validation fails or if saving to Firestore encounters an
 *   error.
 * @remarks Generates UUIDs during validation and writes data to Firestore.
 */
async function fetchCategories(): Promise<string[]> {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((doc) => doc.id);
}

export async function importTransactions(rows: TransactionRowType[]): Promise<void> {
  const categories = await fetchCategories();
  const transactions = validateTransactions(rows, categories);
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

