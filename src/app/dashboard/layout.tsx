import AppSidebar from "@/components/layout/sidebar";
import AppHeader from "@/components/layout/header";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBoundary from "@/components/layout/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <AppHeader />
        <main className="transform-gpu grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:p-8">
          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
