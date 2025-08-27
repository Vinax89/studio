import DashboardLayout from "../dashboard/layout";

export default function ShiftsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
