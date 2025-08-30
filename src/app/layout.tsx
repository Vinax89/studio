import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Inter } from "next/font/google"
import './globals.css'
import "@/ai/init"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/auth/auth-provider'
import { ThemeProvider } from 'next-themes'
import { ErrorBoundary, SuspenseBoundary } from '@/components/layout/boundaries'
import { ServiceWorker } from '@/components/service-worker'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: 'NurseFinAI',
  description: 'Financial management for nursing professionals.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const nonceHeader = await headers();
  const nonce = nonceHeader.get('x-nonce') || undefined

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: 'window.__nonce=1' }}
        />
      </head>
      <body
        className={`${inter.variable} min-h-screen bg-background text-foreground font-sans antialiased dark:bg-background dark:text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ErrorBoundary>
              <SuspenseBoundary>{children}</SuspenseBoundary>
            </ErrorBoundary>
          </AuthProvider>
          <Toaster />
          <ServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  )
}

