import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/lib/types"
import { Repeat } from "lucide-react"
import { memo, useMemo, useState } from "react"

interface TransactionsTableProps {
  transactions: Transaction[]
  pageSize?: number
}

export const TransactionsTable = memo(function TransactionsTable({
  transactions,
  pageSize = 20,
}: TransactionsTableProps) {
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(transactions.length / pageSize))
  const currentTransactions = useMemo(() => {
    const start = page * pageSize
    return transactions.slice(start, start + pageSize).map((transaction) => ({
      ...transaction,
      formattedDate: new Date(transaction.date).toLocaleDateString(),
      formattedAmount: `${
        transaction.type === "Income" ? "+" : "-"
      }$${transaction.amount.toFixed(2)}`,
    }))
  }, [transactions, page, pageSize])

  const previousPage = () => setPage((p) => Math.max(p - 1, 0))
  const nextPage = () => setPage((p) => Math.min(p + 1, pageCount - 1))

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
      <div className="flex items-center justify-between p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={previousPage}
          disabled={page === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={page === pageCount - 1}
        >
          Next
        </Button>
      </div>
    </div>
  )
})

