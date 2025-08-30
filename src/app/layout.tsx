
import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import './globals.css'
import "@/ai/init"
import { ErrorBoundary, SuspenseBoundary } from '@/components/layout/boundaries'
import { ClientProviders } from '@/components/layout/client-providers'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: 'NurseFinAI',
  description: 'Financial management for nursing professionals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} min-h-screen bg-background text-foreground font-sans antialiased dark:bg-background dark:text-foreground`}
      >
        <ClientProviders>
            <ErrorBoundary>
              <SuspenseBoundary>{children}</SuspenseBoundary>
            </ErrorBoundary>
        </ClientProviders>
      </body>
    </html>
  )
}
