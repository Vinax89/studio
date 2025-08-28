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
import type { Transaction, CategorySummary } from "@/lib/types";

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

const CategorySummaryChartClient = dynamic(
  () => import("@/components/dashboard/category-summary-chart"),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>
            AI-generated overview of spending by category.
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
  categorySummaries: CategorySummary[];
}

export default function DashboardCharts({ transactions, chartData, categorySummaries }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <IncomeExpenseChartClient data={chartData} />
      </div>
      <div className="lg:col-span-1">
        <RecentTransactions transactions={transactions} />
      </div>
      <div className="lg:col-span-3">
        <CategorySummaryChartClient data={categorySummaries} />
      </div>
    </div>
  );
}
