import DashboardLayout from "../dashboard/layout";

export default function AccountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
