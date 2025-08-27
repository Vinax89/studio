
import OverviewCards from "@/components/dashboard/overview-cards";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCharts from '@/app/dashboard/dashboard-charts';

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here's a high-level overview of your finances.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[126px] w-full" />}>
        <OverviewCards />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-[436px] w-full" />}>
        <DashboardCharts />
      </Suspense>
    </div>
  )
}
