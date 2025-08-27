"use client"

import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

const Recharts = dynamic(() => import("recharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

interface IncomeExpenseChartProps {
  data: { month: string; income: number; expenses: number; }[];
}

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === 'dark' ? "#888888" : "#A1A1A9";
  const strokeColor = resolvedTheme === 'dark' ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";

  const {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } = Recharts as unknown as typeof import("recharts");

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
