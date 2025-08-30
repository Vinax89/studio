import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary, SuspenseBoundary } from "@/components/layout/boundaries";
import { ServiceWorker } from "@/components/service-worker";
import {
  initCategoryModel,
  teardownCategoryModel,
} from "@/ai/train/category-model";

if (process.env.NODE_ENV !== "test") {
  void initCategoryModel();
  if (typeof process !== "undefined") {
    process.on("exit", teardownCategoryModel);
  }
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NurseFinAI",
  description: "Financial management for nursing professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = headers().get("x-nonce") || undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: "window.__nonce=1" }} />
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
  );
}

