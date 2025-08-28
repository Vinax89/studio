
"use client"

import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { useMemo } from "react"

interface OverviewCardsProps {
  transactions: Transaction[];
}

export default function OverviewCards({ transactions }: OverviewCardsProps) {
  const {
    income,
    expenses,
    savings,
    incomeChange,
    expensesChange,
    savingsChange,
  } = useMemo(() => {
    const group = transactions.reduce((acc, t) => {
      const key = t.date.slice(0, 7); // YYYY-MM
      acc[key] = acc[key] || [];
      acc[key].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

    const months = Object.keys(group).sort();
    const currentMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];

    const sumByType = (data: Transaction[] = [], type: "Income" | "Expense") =>
      data.filter(t => t.type === type).reduce((acc, t) => acc + t.amount, 0);

    const currentIncome = sumByType(group[currentMonth], "Income");
    const currentExpenses = sumByType(group[currentMonth], "Expense");
    const previousIncome = sumByType(group[previousMonth], "Income");
    const previousExpenses = sumByType(group[previousMonth], "Expense");

    const currentSavings = currentIncome - currentExpenses;
    const previousSavings = previousIncome - previousExpenses;

    const change = (curr: number, prev: number) =>
      prev ? ((curr - prev) / prev) * 100 : 0;

    return {
      income: currentIncome,
      expenses: currentExpenses,
      savings: currentSavings,
      incomeChange: change(currentIncome, previousIncome),
      expensesChange: change(currentExpenses, previousExpenses),
      savingsChange: change(currentSavings, previousSavings),
    };
  }, [transactions]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${income.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-primary">
            {incomeChange >= 0 ? "+" : ""}
            {incomeChange.toFixed(1)}% from last month
          </p>
        </CardContent>
      </Card>
      <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          {expensesChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-destructive" />
          ) : (
            <TrendingDown className="h-4 w-4 text-primary" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${expenses.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className={`text-xs ${expensesChange >= 0 ? "text-destructive" : "text-primary"}`}>
            {expensesChange >= 0 ? "+" : ""}
            {expensesChange.toFixed(1)}% from last month
          </p>
        </CardContent>
      </Card>
      <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings</CardTitle>
          {savingsChange >= 0 ? (
            <PiggyBank className="h-4 w-4 text-primary" />
          ) : (
            <PiggyBank className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${savings.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className={`text-xs ${savingsChange >= 0 ? "text-primary" : "text-destructive"}`}>
            {savingsChange >= 0 ? "+" : ""}
            {savingsChange.toFixed(1)}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
