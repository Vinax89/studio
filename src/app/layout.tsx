import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/ai/init';
import { ErrorBoundary, SuspenseBoundary } from '@/components/layout/boundaries';
import { ClientProviders } from '@/components/layout/client-providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'NurseFinAI',
  description: 'Financial management for nursing professionals.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = headers().get('x-nonce') || '';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta
          httpEquiv="Content-Security-Policy"
          content={[
            "default-src 'self';",
            `script-src 'self' 'nonce-${nonce}' 'strict-dynamic';`,
            "style-src 'self' 'unsafe-inline';",
            "img-src 'self';",
            "connect-src 'self';",
            "font-src 'self';",
            "object-src 'none';",
          ].join(' ')}
        />
      </head>
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
  );
}
