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
import { Badge } from "../ui/badge";
import { format } from "date-fns";

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
              <TableHead>Current Owed</TableHead>
              <TableHead>Min. Payment</TableHead>
              <TableHead>Recurrence</TableHead>
              <TableHead className="text-right">Next Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((debt) => (
              <TableRow key={debt.id}>
                <TableCell className="font-medium">{debt.name}</TableCell>
                <TableCell>${debt.currentAmount.toLocaleString()}</TableCell>
                <TableCell>${debt.minimumPayment.toLocaleString()}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{debt.recurrence}</Badge></TableCell>
                <TableCell className="text-right">{format(new Date(debt.dueDate + 'T00:00:00'), "MMM do")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
