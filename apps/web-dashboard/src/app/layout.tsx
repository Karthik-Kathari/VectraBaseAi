import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { CommandPalette } from '@/components/CommandPalette';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'VectraBase AI — Build AI Assistants from Your Data in Seconds | Karthik Kathari',
  description:
    'Turn your PDFs, docs, and websites into grounded AI assistants in seconds. Enterprise multi-tenant RAG engine with sub-2ms caching, pgvector search, and a 1-line embeddable widget.',
  authors: [{ name: 'Karthik Kathari', url: 'https://github.com/Karthik-Kathari' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 min-h-screen flex flex-col antialiased font-sans selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:bg-cyan-500/25 dark:selection:text-cyan-300 transition-colors duration-200">
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
