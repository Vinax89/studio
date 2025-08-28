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
import { formatCurrency } from "@/lib/currency"
import { memo, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

interface TransactionsTableProps {
  transactions: Transaction[]
}

export const TransactionsTable = memo(function TransactionsTable({
  transactions,
}: TransactionsTableProps) {
  const [page, setPage] = useState(0)
  const pageSize = 20

  const currentTransactions = useMemo(
    () =>
      transactions
        .slice(page * pageSize, page * pageSize + pageSize)
        .map((transaction) => ({
          ...transaction,
          formattedDate: new Date(transaction.date).toLocaleDateString(),
          formattedAmount: `${
            transaction.type === "Income" ? "+" : "-"
          }${formatCurrency(transaction.amount, transaction.currency)}`,
        })),
    [transactions, page, pageSize],
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
          {currentTransactions.map((transaction) => (
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
      <div className="flex justify-between p-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setPage((p) =>
              (p + 1) * pageSize >= transactions.length ? p : p + 1,
            )
          }
          disabled={(page + 1) * pageSize >= transactions.length}
        >
          Next
        </Button>
      </div>
    </div>
  )
})

