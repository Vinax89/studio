
"use client"; // This file now contains client-side logic for the chart

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
import { mockTransactions } from "@/lib/data";
import type { Transaction } from "@/lib/types";
import { unstable_cache, revalidateTag } from "next/cache";

// The dynamic import is now defined *inside* the client component.
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

// This wrapper is now the client component boundary.
function ClientChartWrapper({ data }: { data: any[] }) {
    return <IncomeExpenseChartClient data={data} />;
}

// Server Component logic remains separate.
// Note: unstable_cache and other server-only functions cannot be in a file with "use client" at the top.
// I will move the data fetching logic to the parent DashboardCharts component,
// which will be a pure server component.

// The following functions are server-side and will be moved.
const getTransactions = unstable_cache(async (): Promise<Transaction[]> => {
  // Optional demo delay
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK_DELAY === "true") {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return mockTransactions;
}, ["transactions"]);

const getChartData = unstable_cache(async () => {
  // Optional demo delay
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK_DELAY === "true") {
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  return [
    { month: "Jan", income: 4000, expenses: 2400 },
    { month: "Feb", income: 3000, expenses: 1398 },
    { month: "Mar", income: 5000, expenses: 3800 },
    { month: "Apr", income: 2780, expenses: 3908 },
    { month: "May", income: 1890, expenses: 4800 },
    { month: "Jun", income: 4390, expenses: 3800 },
    { month: "Jul", income: 5100, expenses: 2550 },
  ];
}, ["chart-data"]);

export const revalidateTransactions = () => revalidateTag("transactions");
export const revalidateChartData = () => revalidateTag("chart-data");


export default async function DashboardCharts() {
  const [transactions, chartData] = await Promise.all([
    getTransactions(),
    getChartData()
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ClientChartWrapper data={chartData} />
      </div>
      <div className="lg:col-span-1">
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}
