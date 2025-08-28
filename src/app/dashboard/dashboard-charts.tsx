"use client";

import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import type { Transaction } from "@/lib/types";

// This file is now a client component module.
// The dynamic import for the chart component is defined here.
const IncomeExpenseChartClient = dynamic(
  () => import("@/components/dashboard/income-expense-chart"),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Income vs. Expenses</CardTitle>
          <CardDescription>
            A look at your cash flow for the last 7 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    ),
  }
);

interface DashboardChartsProps {
    transactions: Transaction[];
    chartData: any[];
}

export default function DashboardCharts({ transactions, chartData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="md:col-span-2 lg:col-span-2">
        <IncomeExpenseChartClient data={chartData} />
      </div>
      <div className="md:col-span-2 lg:col-span-1">
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}
