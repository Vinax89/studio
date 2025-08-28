
import OverviewCards from "@/components/dashboard/overview-cards";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCharts from '@/app/dashboard/dashboard-charts';
import type { Transaction } from "@/lib/types";
import { getDocs } from "firebase/firestore";
import { transactionsCollection, chartDataCollection } from "@/lib/firebase";

type ChartData = { month: string; income: number; expenses: number };

async function getTransactions(): Promise<Transaction[]> {
  const snapshot = await getDocs(transactionsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Transaction, "id">) }));
}

async function getChartData(): Promise<ChartData[]> {
  const snapshot = await getDocs(chartDataCollection);
  return snapshot.docs.map(doc => doc.data() as ChartData);
}

export default async function DashboardPage() {
  try {
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
        <Suspense fallback={<Skeleton className="h-[436px] w-full" />}>
          <DashboardCharts transactions={transactions} chartData={chartData} />
        </Suspense>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Failed to load dashboard data.</p>
      </div>
    );
  }
}
