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
import { memo, useMemo, forwardRef } from "react"
import { FixedSizeList as List, type ListChildComponentProps } from "react-window"

interface TransactionsTableProps {
  transactions: Transaction[]
}

const ROW_HEIGHT = 56
const LIST_HEIGHT = 400

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
        }${formatCurrency(transaction.amount, transaction.currency)}`,
      })),
    [transactions],
  )

  const Row = ({ index, style }: ListChildComponentProps) => {
    const transaction = formattedTransactions[index]
    return (
      <TableRow key={transaction.id} style={style}>
        <TableCell>{transaction.formattedDate}</TableCell>
        <TableCell className="font-medium">{transaction.description}</TableCell>
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
            transaction.type === "Income" ? "text-green-600" : "text-red-600",
            "dark:text-inherit",
          )}
        >
          {transaction.formattedAmount}
        </TableCell>
      </TableRow>
    )
  }

  const InnerTable = memo(
    forwardRef<
      HTMLTableSectionElement,
      React.HTMLAttributes<HTMLTableSectionElement> & { children: React.ReactNode }
    >(({ children, style, ...rest }, ref) => (
      <table className="w-full caption-bottom text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Recurring</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody
          ref={ref}
          style={style}
          className="[&_tr:last-child]:border-0"
          {...rest}
        >
          {children}
        </TableBody>
      </table>
    )),
  )

  return (
    <div className="rounded-lg border">
      <List
        height={LIST_HEIGHT}
        itemCount={formattedTransactions.length}
        itemSize={ROW_HEIGHT}
        width="100%"
        innerElementType={InnerTable as any}
        className="relative w-full overflow-auto"
      >
        {Row}
      </List>
    </div>
  )
})

