
import OverviewCards from "@/components/dashboard/overview-cards";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCharts from '@/app/dashboard/dashboard-charts';
import { mockTransactions } from "@/lib/data";
import type { Transaction } from "@/lib/types";
import { getTranslation } from "@/lib/i18n";

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

export default async function DashboardPage() {
  const [transactions, chartData] = await Promise.all([
    getTransactions(),
    getChartData()
  ]);
  const t = getTranslation()

  return (
    <main role="main" tabIndex={-1} className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.overview")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[126px] w-full" />}>
        <OverviewCards transactions={transactions} />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-[436px] w-full" />}>
        <DashboardCharts transactions={transactions} chartData={chartData} />
      </Suspense>
    </main>
  )
}
