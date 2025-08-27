import OverviewCards from "@/app/dashboard/overview-cards";
import DashboardCharts from "@/app/dashboard/dashboard-charts";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here's a high-level overview of your finances.</p>
      </div>
      <OverviewCards />
      <DashboardCharts />
    </div>
  )
}
