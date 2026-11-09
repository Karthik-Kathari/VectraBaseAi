'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from 'next-themes';

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={(resolvedTheme as 'light' | 'dark') || 'light'}
      position="bottom-right"
      toastOptions={{
        className: 'text-xs font-mono border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-[0_0_15px_rgba(168,85,247,0.1)]',
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
