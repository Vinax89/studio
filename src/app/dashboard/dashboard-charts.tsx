"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const IncomeExpenseChart = dynamic(
  () => import("@/components/dashboard/income-expense-chart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[438px] w-full" />,
  }
);
const RecentTransactions = dynamic(
  () => import("@/components/dashboard/recent-transactions"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[438px] w-full" />,
  }
);

export default function DashboardCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <IncomeExpenseChart />
      </div>
      <div className="lg:col-span-1">
        <RecentTransactions />
      </div>
    </div>
  );
}
