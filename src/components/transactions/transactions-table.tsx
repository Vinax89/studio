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
import {
  memo,
  useMemo,
  useState,
  forwardRef,
  type HTMLAttributes,
} from "react"
import {
  FixedSizeList,
  type ListChildComponentProps,
} from "react-window"

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
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })

  const visibleTransactions = useMemo(() => {
    const slice = transactions.slice(visibleRange.start, visibleRange.end + 1)
    return slice.map((transaction) => ({
      ...transaction,
      formattedDate: new Date(transaction.date).toLocaleDateString(),
      formattedAmount: `${
        transaction.type === "Income" ? "+" : "-"
      }$${transaction.amount.toFixed(2)}`,
    }))
  }, [transactions, visibleRange])

  const Row = ({ index, style }: ListChildComponentProps) => {
    const fallback = transactions[index]
    const offset = index - visibleRange.start
    const transaction =
      offset >= 0 && offset < visibleTransactions.length
        ? visibleTransactions[offset]
        : {
            ...fallback,
            formattedDate: new Date(fallback.date).toLocaleDateString(),
            formattedAmount: `${
              fallback.type === "Income" ? "+" : "-"
            }$${fallback.amount.toFixed(2)}`,
          }
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
        itemCount={transactions.length}
        itemSize={rowHeight}
        width="100%"
        outerElementType={Outer as any}
        innerElementType={Inner as any}
        itemKey={(index) => transactions[index].id}
        onItemsRendered={({ visibleStartIndex, visibleStopIndex }) =>
          setVisibleRange({ start: visibleStartIndex, end: visibleStopIndex })
        }
      >
        {Row}
      </FixedSizeList>
    </div>
  )
})

