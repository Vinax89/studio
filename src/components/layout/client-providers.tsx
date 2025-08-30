"use client"

import React, { Suspense } from "react"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { ServiceWorker } from "@/components/service-worker"
import { Skeleton } from "../ui/skeleton"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
        <AuthProvider>
            {children}
        </AuthProvider>
      </Suspense>
      <Toaster />
      <ServiceWorker />
    </ThemeProvider>
  )
}
