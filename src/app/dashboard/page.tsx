import OverviewCards from "@/components/dashboard/overview-cards";
import IncomeExpenseChart from "@/components/dashboard/income-expense-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here's a high-level overview of your finances.</p>
      </div>
      <OverviewCards />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <IncomeExpenseChart />
        </div>
        <div>
            <RecentTransactions />
        </div>
      </div>
    </div>
  )
}
