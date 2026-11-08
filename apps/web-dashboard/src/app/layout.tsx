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
    <html lang="en" className="dark">
      <body className="bg-[#090A0F] text-slate-100 min-h-screen flex flex-col antialiased font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
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
