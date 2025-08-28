"use client";

import React, { PropsWithChildren, Suspense } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

class RootErrorBoundary extends React.Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <p>Something went wrong.</p>;
    }
    return this.props.children;
  }
}

export function ErrorBoundary({ children }: PropsWithChildren) {
  return <RootErrorBoundary>{children}</RootErrorBoundary>;
}

export function SuspenseBoundary({ children }: PropsWithChildren) {
  return <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>;
}
