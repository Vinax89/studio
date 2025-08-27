import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/lib/types"
import { Repeat } from "lucide-react"
import { memo, useMemo } from "react"

interface TransactionsTableProps {
  transactions: Transaction[]
}

export const TransactionsTable = memo(function TransactionsTable({
  transactions,
}: TransactionsTableProps) {
  const formattedTransactions = useMemo(
    () =>
      transactions.map((transaction) => ({
        ...transaction,
        formattedDate: new Date(transaction.date).toLocaleDateString(),
        formattedAmount: `${
          transaction.type === "Income" ? "+" : "-"
        }$${transaction.amount.toFixed(2)}`,
      })),
    [transactions],
  )

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Recurring</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formattedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.formattedDate}</TableCell>
              <TableCell className="font-medium">
                {transaction.description}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{transaction.category}</Badge>
              </TableCell>
              <TableCell>
                {transaction.isRecurring && (
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                )}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right",
                  transaction.type === "Income"
                    ? "text-green-600"
                    : "text-red-600",
                  "dark:text-inherit",
                )}
              >
                {transaction.formattedAmount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
})

