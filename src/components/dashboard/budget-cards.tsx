"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Transaction, Category } from "@/lib/types"

interface BudgetCardsProps {
  transactions: Transaction[]
  categories: Category[]
}

export default function BudgetCards({ transactions, categories }: BudgetCardsProps) {
  const budgetData = categories
    .filter((c) => typeof c.monthlyBudget === "number")
    .map((category) => {
      const spent = transactions
        .filter((t) => t.type === "Expense" && t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0)
      const budget = category.monthlyBudget || 0
      const percent = budget > 0 ? (spent / budget) * 100 : 0
      return {
        ...category,
        spent,
        percent,
      }
    })

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {budgetData.map((cat) => (
        <Card key={cat.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{cat.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div className="text-2xl font-bold">
                ${cat.spent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-muted-foreground">
                / ${cat.monthlyBudget?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <Progress value={Math.min(cat.percent, 100)} className="mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

