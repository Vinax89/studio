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
import {
  memo,
  forwardRef,
  type HTMLAttributes,
  type ComponentType,
} from "react"
import { FixedSizeList, type ListChildComponentProps } from "react-window"

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

  const Row = ({ index, style }: ListChildComponentProps) => {
    const transaction = transactions[index]
    const formattedDate = new Date(transaction.date).toLocaleDateString()
    const formattedAmount = `${
      transaction.type === "Income" ? "+" : "-"
    }${formatCurrency(transaction.amount, transaction.currency)}`

    return (
      <TableRow style={style} key={transaction.id}>
        <TableCell>{formattedDate}</TableCell>
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
          {formattedAmount}
        </TableCell>
      </TableRow>
    )
  }

  const Outer: ComponentType<HTMLAttributes<HTMLDivElement>> =
    forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
      ({ style, children, ...props }, ref) => (
        <div ref={ref} style={{ ...style, overflow: "auto" }} {...props}>
          <Table>{children}</Table>
        </div>
      ),
    )

  const Inner: ComponentType<HTMLAttributes<HTMLTableSectionElement>> =
    forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
      (props, ref) => <TableBody ref={ref} {...props} />,
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
      </Table>
      <FixedSizeList
        height={height}
        itemCount={transactions.length}
        itemSize={rowHeight}
        width="100%"
        outerElementType={Outer}
        innerElementType={Inner}
        itemKey={(index) => transactions[index].id}
      >
        {Row}
      </FixedSizeList>
    </div>
  )
})

