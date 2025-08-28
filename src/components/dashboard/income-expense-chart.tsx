"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { ChartPoint } from "@/lib/types";

interface IncomeExpenseChartProps {
  data: ChartPoint[];
}

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const handleLegendClick = (o: any) => {
    setHidden(prev => ({ ...prev, [o.dataKey]: !prev[o.dataKey] }));
  };

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-2))",
    },
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs. Expenses</CardTitle>
        <CardDescription>
          A look at your cash flow for the last 7 months.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expensesColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
              content={
                <ChartTooltipContent formatter={(value: number) => `$${value.toLocaleString()}`} />
              }
            />
            <Legend wrapperStyle={{ paddingTop: "24px" }} onClick={handleLegendClick} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="var(--color-income)"
              fillOpacity={1}
              fill="url(#incomeColor)"
              name="Income"
              hide={hidden["income"]}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-expenses)"
              fillOpacity={1}
              fill="url(#expensesColor)"
              name="Expenses"
              hide={hidden["expenses"]}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
