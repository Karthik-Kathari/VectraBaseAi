import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-sans text-slate-700 dark:text-slate-300 font-medium mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/25 dark:focus:ring-purple-400/25 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans outline-none transition-all duration-150 disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-600 dark:text-red-400',
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">{helperText}</p>}
        {error && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-sans">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
