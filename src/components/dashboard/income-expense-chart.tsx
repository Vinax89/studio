"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTheme } from "next-themes";

const data = [
  { month: "Jan", income: 4000, expenses: 2400 },
  { month: "Feb", income: 3000, expenses: 1398 },
  { month: "Mar", income: 5000, expenses: 3800 },
  { month: "Apr", income: 2780, expenses: 3908 },
  { month: "May", income: 1890, expenses: 4800 },
  { month: "Jun", income: 4390, expenses: 3800 },
  { month: "Jul", income: 5100, expenses: 2550 },
]

export default function IncomeExpenseChart() {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Income vs. Expenses</CardTitle>
        <CardDescription>A look at your cash flow for the last 7 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} stroke={tickColor}/>
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value/1000}k`} stroke={tickColor} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', radius: 'var(--radius)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend wrapperStyle={{paddingTop: '24px'}}/>
            <Bar dataKey="income" fill="hsl(var(--chart-1))" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name="Expenses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
