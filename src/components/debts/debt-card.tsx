"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Debt } from "@/lib/types"
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface DebtCardProps {
  debt: Debt;
}

export function DebtCard({ debt }: DebtCardProps) {
  const paidAmount = debt.initialAmount - debt.currentAmount;
  const progress = (paidAmount / debt.initialAmount) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle>{debt.name}</CardTitle>
                 <CardDescription>Next Payment: <span className="font-medium text-foreground">{new Date(debt.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span></CardDescription>
            </div>
            <Badge variant="secondary">{debt.interestRate}% APR</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex justify-between font-medium text-muted-foreground">
            <span>Paid Off</span>
            <span className="text-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} aria-label={`${debt.name} progress`} />
         <div className="mt-4 flex justify-between text-sm">
            <div className="text-muted-foreground">Min. Payment: <span className="font-bold text-foreground">${debt.minimumPayment.toLocaleString()}</span></div>
            <div className="text-muted-foreground">Remaining: <span className="font-bold text-foreground">${debt.currentAmount.toLocaleString()}</span></div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
         <Button variant="outline" size="sm" className="w-full">Edit</Button>
         <Button variant="destructive" size="sm" className="w-full">Delete</Button>
      </CardFooter>
    </Card>
  )
}
