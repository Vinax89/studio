
import OverviewCards from "@/components/dashboard/overview-cards";
import BudgetCards from "@/components/dashboard/budget-cards";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCharts from '@/app/dashboard/dashboard-charts';
import { mockTransactions, mockCategories } from "@/lib/data";
import type { Transaction, Category } from "@/lib/types";

// Server-side data fetching now happens in the page component.
const getTransactions = async (): Promise<Transaction[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTransactions;
};

const getChartData = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { month: "Jan", income: 4000, expenses: 2400 },
    { month: "Feb", income: 3000, expenses: 1398 },
    { month: "Mar", income: 5000, expenses: 3800 },
    { month: "Apr", income: 2780, expenses: 3908 },
    { month: "May", income: 1890, expenses: 4800 },
    { month: "Jun", income: 4390, expenses: 3800 },
    { month: "Jul", income: 5100, expenses: 2550 },
  ];
};

const getCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockCategories;
};

export default async function DashboardPage() {
  const [transactions, chartData, categories] = await Promise.all([
    getTransactions(),
    getChartData(),
    getCategories()
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here's a high-level overview of your finances.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[126px] w-full" />}>
        <OverviewCards transactions={transactions} />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-[220px] w-full" />}>
        <BudgetCards transactions={transactions} categories={categories} />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-[436px] w-full" />}>
        <DashboardCharts transactions={transactions} categories={categories} chartData={chartData} />
      </Suspense>
    </div>
  )
}
