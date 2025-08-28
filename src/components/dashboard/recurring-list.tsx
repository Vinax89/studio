import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { generateUpcomingRecurringTransactions } from "@/lib/recurring";

interface RecurringListProps {
  transactions: Transaction[];
}

export default function RecurringList({ transactions }: RecurringListProps) {
  const upcoming = generateUpcomingRecurringTransactions(transactions).slice(0, 5);
  if (upcoming.length === 0) {
    return null;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming Recurring</CardTitle>
        <CardDescription>Your next recurring transactions.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {upcoming.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between">
            <div className="grid gap-1">
              <p className="font-medium leading-none">{tx.description}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(tx.date).toLocaleDateString()}
              </p>
            </div>
            <div
              className={
                tx.type === "Income"
                  ? "text-green-600 dark:text-green-400 font-semibold"
                  : "text-red-600 dark:text-red-400 font-semibold"
              }
            >
              {tx.type === "Income" ? "+" : "-"}${tx.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
