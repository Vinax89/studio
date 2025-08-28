import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary, SuspenseBoundary } from '@/components/layout/boundaries';
import { ServiceWorker } from '@/components/service-worker';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: 'NurseFinAI',
  description: 'Financial management for nursing professionals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
  );
}
