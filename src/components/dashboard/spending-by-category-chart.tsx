"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Transaction, Category } from "@/lib/types"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface SpendingByCategoryChartProps {
  transactions: Transaction[]
  categories: Category[]
}

export default function SpendingByCategoryChart({ transactions, categories }: SpendingByCategoryChartProps) {
  const data = categories
    .map((cat) => ({
      name: cat.name,
      value: transactions
        .filter(
          (t) =>
            t.type === "Expense" &&
            (t.categoryId === cat.id ||
              (!t.categoryId &&
                t.category.toLowerCase() === cat.name.toLowerCase()))
        )
        .reduce((sum, t) => sum + t.amount, 0),
    }))
    .filter((d) => d.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Where your money goes</CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

