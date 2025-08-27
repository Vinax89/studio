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

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
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
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell>
                  {transaction.isRecurring && <Repeat className="h-4 w-4 text-muted-foreground" />}
                </TableCell>
                <TableCell className={cn(
                    "text-right",
                    transaction.type === 'Income' ? "text-green-600" : "text-red-600",
                    "dark:text-inherit"
                )}>
                  {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  )
}
