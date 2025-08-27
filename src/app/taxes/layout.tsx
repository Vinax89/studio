import DashboardLayout from "../dashboard/layout";

export default function TaxesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
