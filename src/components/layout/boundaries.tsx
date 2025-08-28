"use client";

import React, { PropsWithChildren, Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
}

class RootErrorBoundary extends React.Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          variant="destructive"
          className="flex flex-col items-start gap-4 p-6"
        >
          <div>
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              An unexpected error occurred. Try reloading the page or go back
              to the dashboard.
            </AlertDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </Alert>
      );
    }
    return this.props.children;
  }
}

export function ErrorBoundary({ children }: PropsWithChildren) {
  return <RootErrorBoundary>{children}</RootErrorBoundary>;
}

export function SuspenseBoundary({ children }: PropsWithChildren) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
