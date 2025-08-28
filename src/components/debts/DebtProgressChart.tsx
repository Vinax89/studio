"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import type { Debt } from "@/lib/types";
import { calculatePayoffSchedule } from "@/lib/debt-utils";

interface DebtProgressChartProps {
  debts: Debt[];
}

export default function DebtProgressChart({ debts }: DebtProgressChartProps) {
  const { resolvedTheme } = useTheme();
  const strokeColor = resolvedTheme === "dark" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";

  const data = useMemo(() => {
    const schedules = debts.map((d) => ({
      id: d.id,
      name: d.name,
      color: d.color,
      schedule: calculatePayoffSchedule(d.currentAmount, d.interestRate, d.minimumPayment).points,
    }));

    const map = new Map<string, any>();
    for (const s of schedules) {
      for (const p of s.schedule) {
        const existing = map.get(p.date) ?? { date: p.date };
        existing[s.id] = p.balance;
        map.set(p.date, existing);
      }
    }

    return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [debts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Payoff Projection</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} stroke={strokeColor} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} stroke={strokeColor} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', radius: 'var(--radius)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend wrapperStyle={{ paddingTop: 24 }} />
            {debts.map((d) => (
              <Line key={d.id} type="monotone" dataKey={d.id} name={d.name} stroke={d.color} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
