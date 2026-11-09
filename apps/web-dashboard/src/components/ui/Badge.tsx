import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'neutral' | 'purple' | 'red' | 'yellow';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    cyan: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-cyan-950/80 dark:text-cyan-400 dark:border-cyan-500/30 dark:shadow-[0_0_10px_rgba(6,182,212,0.15)]',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-500/30 dark:shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/30 dark:shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-500/30 dark:shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-400 dark:border-indigo-500/30 dark:shadow-[0_0_10px_rgba(99,102,241,0.15)]',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-500/30 dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/80 dark:text-red-400 dark:border-red-500/30 dark:shadow-[0_0_10px_rgba(220,38,38,0.2)]',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/80 dark:text-yellow-300 dark:border-yellow-500/30 dark:shadow-[0_0_10px_rgba(234,179,8,0.2)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-sans font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
