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
import { memo, useMemo, useState, forwardRef, type HTMLAttributes } from "react"
import { FixedSizeList, type ListChildComponentProps } from "react-window"
import { Button } from "@/components/ui/button"

interface TransactionsTableProps {
  transactions: Transaction[]
  /** Height of the scrollable list in pixels */
  height?: number
  /** Height of each row in pixels */
  rowHeight?: number
}

export const TransactionsTable = memo(function TransactionsTable({
  transactions,
  height = 400,
  rowHeight = 56,
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
          }$${transaction.amount.toFixed(2)}`,
        })),
    [transactions, page, pageSize],
  )

  const Row = ({ index, style }: ListChildComponentProps) => {
    const transaction = currentTransactions[index]
    return (
      <TableRow style={style} key={transaction.id}>
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

  const Outer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ style, children, ...props }, ref) => (
      <div
        ref={ref}
        style={{ ...style, overflow: "auto" }}
        {...props}
      >
        <Table>{children}</Table>
      </div>
    ),
  )

  const Inner = forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
  >((props, ref) => <TableBody ref={ref} {...props} />)

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
      </Table>
      <FixedSizeList
        height={height}
        itemCount={currentTransactions.length}
        itemSize={rowHeight}
        width="100%"
        outerElementType={Outer as any}
        innerElementType={Inner as any}
        itemKey={(index) => currentTransactions[index].id}
      >
        {Row}
      </FixedSizeList>
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

