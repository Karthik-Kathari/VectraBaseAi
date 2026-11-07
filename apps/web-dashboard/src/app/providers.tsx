'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#11131C',
            border: '1px solid #1E2230',
            color: '#F8FAFC',
            fontFamily: 'monospace',
            fontSize: '12px',
          },
        }}
      />
    </QueryClientProvider>
  );
}

