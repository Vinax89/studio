
import IncomeExpenseChart from "@/components/dashboard/income-expense-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import { mockTransactions } from "@/lib/data";
import type { Transaction } from "@/lib/types";

// Optional demo delay; disable in production
const enableMockDelay = process.env.NEXT_PUBLIC_ENABLE_MOCK_DELAY === "true";

const getTransactions = async (): Promise<Transaction[]> => {
  if (enableMockDelay) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return mockTransactions;
}

const getChartData = async () => {
  if (enableMockDelay) {
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
  ]
}


export default async function DashboardCharts() {
  const [transactions, chartData] = await Promise.all([
    getTransactions(),
    getChartData()
  ]);

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
