"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Debt } from "@/lib/types"
import { isSameDay, isAfter } from 'date-fns'
import { Badge } from "../ui/badge";

interface DebtDetailsProps {
  debts: Debt[];
  selectedDate?: Date;
}

export function DebtDetails({ debts, selectedDate }: DebtDetailsProps) {
  if (!selectedDate) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Debt Details</CardTitle>
                <CardDescription>Select a day on the calendar to see due payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No date selected.</p>
            </CardContent>
        </Card>
    );
  }

  const debtsDue = debts.filter(debt => {
    const startDate = new Date(debt.dueDate + 'T00:00:00');
    if (debt.recurrence === 'monthly') {
        // Check if the day of the month matches and the selected date is on or after the start date
        return startDate.getDate() === selectedDate.getDate() && (isSameDay(selectedDate, startDate) || isAfter(selectedDate, startDate));
    }
    // For 'once', check for the exact day
    return isSameDay(startDate, selectedDate);
  });
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          Due on {selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
        </CardTitle>
        <CardDescription>
          {debtsDue.length} payment(s) scheduled for this day.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {debtsDue.length > 0 ? (
          debtsDue.map(debt => (
            <div key={debt.id} className="flex justify-between items-center p-3 rounded-md border bg-background">
                <div>
                    <p className="font-semibold">{debt.name}</p>
                    <p className="text-sm text-muted-foreground">Min. Payment: ${debt.minimumPayment.toLocaleString()}</p>
                </div>
                <Badge variant={debt.interestRate > 10 ? "destructive" : "secondary"}>
                  {debt.interestRate}% APR
                </Badge>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">No payments due on this day.</p>
        )}
      </CardContent>
    </Card>
  )
}
