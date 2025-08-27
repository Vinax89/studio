import OverviewCards from "@/app/dashboard/overview-cards";
import { mockTransactions } from "@/lib/data";
import type { Transaction } from "@/lib/types";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const DashboardCharts = dynamic(() => import('@/app/dashboard/dashboard-charts'), {
  ssr: false,
  loading: () => <Skeleton className="h-[436px] w-full" />,
});


// Simulate slow data fetching
const getTransactions = async (): Promise<Transaction[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockTransactions;
}

const getChartData = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return [
      { month: "Jan", income: 4000, expenses: 2400 },
      { month: "Feb", income: 3000, expenses: 1398 },
      { month: "Mar", income: 5000, expenses: 3800 },
      { month: "Apr", income: 2780, expenses: 3908 },
      { month: "May", income: 1890, expenses: 4800 },
      { month: "Jun", income: 4390, expenses: 3800 },
      { month: "Jul", income: 5100, expenses: 2550 },
    ]
}


export default async function DashboardPage() {

  const [transactions, chartData] = await Promise.all([
    getTransactions(),
    getChartData()
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
      <DashboardCharts transactions={transactions} chartData={chartData} />
    </div>
  )
}
