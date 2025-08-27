import DashboardLayout from "../dashboard/layout";

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
