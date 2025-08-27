
"use client";

import IncomeExpenseChart from "@/components/dashboard/income-expense-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import type { Transaction } from "@/lib/types";

interface DashboardChartsProps {
    transactions: Transaction[];
    chartData: { month: string; income: number; expenses: number; }[];
}

export default function DashboardCharts({ transactions, chartData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <IncomeExpenseChart data={chartData} />
      </div>
      <div className="lg:col-span-1">
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}
