import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'neutral';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    cyan: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-950/80 text-rose-400 border-rose-500/30',
    indigo: 'bg-indigo-950/80 text-indigo-400 border-indigo-500/30',
    neutral: 'bg-[#1E2230] text-slate-300 border-[#2A2F45]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

