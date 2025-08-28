import { z } from "zod";
import type { Transaction } from "./types";

const TransactionRow = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.union([z.number(), z.string()]),
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
    return {
      id: crypto.randomUUID(),
      date: data.date,
      description: data.description,
      amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount),
      type: data.type,
      category: data.category,
      isRecurring:
        typeof data.isRecurring === "boolean"
          ? data.isRecurring
          : data.isRecurring === "true",
    };
  });
}

