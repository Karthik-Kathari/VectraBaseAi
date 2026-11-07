import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { CommandPalette } from '@/components/CommandPalette';

export const metadata: Metadata = {
  title: 'VectraBase AI — Multi-Tenant RAG Knowledge Engine | Karthik Kathari',
  description:
    'Production-grade B2B RAG knowledge engine and embeddable Vue.js 3 widget architected and engineered by Karthik Kathari. Sub-2ms Redis caching, 1M-record pgvector virtualization, and zero-data-loss JWT refresh.',
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
      <body className="bg-[#090A0F] text-slate-100 min-h-screen antialiased font-sans">
        <Providers>
          {children}
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
