"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface IncomeExpenseChartProps {
  data: { month: string; income: number; expenses: number; }[];
}

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const { resolvedTheme } = useTheme();
  const strokeColor = resolvedTheme === 'dark' ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs. Expenses</CardTitle>
        <CardDescription>A look at your cash flow for the last 7 months.</CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} stroke={strokeColor}/>
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value/1000}k`} stroke={strokeColor} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', radius: 'var(--radius)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend wrapperStyle={{paddingTop: '24px'}}/>
            <Bar dataKey="income" fill="var(--color-income)" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" name="Expenses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
