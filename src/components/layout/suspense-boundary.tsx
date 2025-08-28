'use client';

import { PropsWithChildren, Suspense } from 'react';

export function SuspenseBoundary({ children }: PropsWithChildren) {
  return <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>;
}

export default SuspenseBoundary;

