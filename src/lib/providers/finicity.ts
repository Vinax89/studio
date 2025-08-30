import type { TransactionRowType } from "@/lib/transactions"

export interface FinicityTransaction {
  id: string
  postedDate: string
  amount: number
  memo: string
  category?: string
}

export function mapFinicityTransactions(
  transactions: FinicityTransaction[],
): TransactionRowType[] {
  return transactions.map((tx) => ({
    date: tx.postedDate,
    description: tx.memo,
    amount: String(Math.abs(tx.amount)),
    type: tx.amount < 0 ? "Income" : "Expense",
    category: tx.category ?? "Misc",
  }))
}
