import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { CommandPalette } from '@/components/CommandPalette';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VectraBase AI — Build AI Assistants from Your Data in Seconds',
  description:
    'Turn your PDFs, docs, and websites into grounded AI assistants in seconds. Enterprise multi-tenant RAG engine with sub-2ms caching, pgvector search, and a 1-line embeddable widget.',
  authors: [{ name: 'VectraBase AI' }],
  icons: {
    icon: '/favicon.ico',
  },
  // Add these two properties below:
  metadataBase: new URL('https://vectrabaseai.vercel.app'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
      <body className="text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased font-sans selection:bg-purple-500/20 selection:text-purple-600 dark:selection:bg-purple-500/25 dark:selection:text-purple-300 transition-colors duration-200">
        {/* ThemeProvider configured with attribute="class" in Providers */}
        <Providers>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
