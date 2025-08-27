
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Debt } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"

interface DebtListProps {
  debts: Debt[];
}

export function DebtList({ debts }: DebtListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Debt Accounts</CardTitle>
        <CardDescription>A list of all your outstanding debts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Total Owed</TableHead>
              <TableHead>Min. Payment</TableHead>
              <TableHead className="text-right">Due Day</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((debt) => (
              <TableRow key={debt.id}>
                <TableCell className="font-medium">{debt.name}</TableCell>
                <TableCell>${debt.totalAmount.toLocaleString()}</TableCell>
                <TableCell>${debt.minimumPayment.toLocaleString()}</TableCell>
                <TableCell className="text-right">{debt.dueDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
