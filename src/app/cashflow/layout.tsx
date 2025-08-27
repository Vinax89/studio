import DashboardLayout from "../dashboard/layout";

export default function CashflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
