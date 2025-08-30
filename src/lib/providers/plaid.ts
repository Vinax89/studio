import type { TransactionRowType } from "@/lib/transactions"

export interface PlaidTransaction {
  id: string
  date: string
  name: string
  amount: number
  category?: string
}

export function mapPlaidTransactions(
  transactions: PlaidTransaction[],
): TransactionRowType[] {
  return transactions.map((tx) => ({
    date: tx.date,
    description: tx.name,
    amount: String(Math.abs(tx.amount)),
    type: tx.amount < 0 ? "Income" : "Expense",
    category: tx.category ?? "Misc",
  }))
}
