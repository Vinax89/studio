
"use client"

import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"

interface OverviewCardsProps {
  transactions: Transaction[];
}

export default function OverviewCards({ transactions }: OverviewCardsProps) {
  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const savings = totalIncome - totalExpenses;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalIncome)
          }</div>
          <p className="text-xs text-muted-foreground">from salary and other sources</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalExpenses)
          }</div>
          <p className="text-xs text-muted-foreground">across all categories</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savings)
          }</div>
          <p className="text-xs text-muted-foreground">this period</p>
        </CardContent>
      </Card>
    </div>
  )
}
