import DashboardLayout from "../dashboard/layout";

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
