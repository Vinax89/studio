
"use client"

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Debt } from "@/lib/types";

// Optional demo delay; disable in production
const enableMockDelay = process.env.NEXT_PUBLIC_ENABLE_MOCK_DELAY === "true";

interface DebtCardProps {
  debt: Debt;
  onDelete: (id: string) => void;
  onUpdate: (debt: Debt) => void;
}

export function DebtCard({ debt, onDelete, onUpdate }: DebtCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Guard against division by zero if initialAmount is not set or is 0
  const progress = debt.initialAmount > 0 ? (debt.currentAmount / debt.initialAmount) * 100 : 0;
  const remainingAmount = debt.initialAmount - debt.currentAmount;

  // Fix: Explicitly parse the date as UTC to prevent timezone shift issues
  // that cause hydration errors. The '.split('T')[0]' ensures we only get the date part.
  const displayDate = new Date(debt.dueDate).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });


  const handleDelete = async () => {
    setIsDeleting(true);
    if (enableMockDelay) {
      await new Promise(res => setTimeout(res, 500));
    }
    onDelete(debt.id);
    setIsDeleting(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{debt.name}</CardTitle>
            <CardDescription>
              {debt.interestRate}% APR
            </CardDescription>
          </div>
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: debt.color || 'hsl(var(--blueprint))' }}
            title={`Color: ${debt.color}`}
           />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <div className="mb-2 flex justify-between font-medium text-muted-foreground">
            <span>Paid Off</span>
            <span className="text-foreground">{Math.round(100 - progress)}%</span>
          </div>
          <Progress value={100 - progress} aria-label={`${debt.name} progress`} />
        </div>
        <div className="text-sm text-muted-foreground">
          <p>
            <span className="font-bold text-foreground">
              ${remainingAmount.toLocaleString()}
            </span>{" "}
            remaining of ${debt.initialAmount.toLocaleString()}
          </p>
           <p>
             Next payment of{" "}
            <span className="font-bold text-foreground">
                ${debt.minimumPayment.toLocaleString()}
            </span> is due on {displayDate}.
           </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onUpdate(debt)}>Edit</Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
