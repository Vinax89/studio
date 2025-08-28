import DashboardLayout from "../dashboard/layout";

export default function CostOfLivingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
