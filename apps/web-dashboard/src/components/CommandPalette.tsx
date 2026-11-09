'use client';

/**
 * VectraBase AI — Cmd+K / Ctrl+K Command Palette
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { label: 'Go to SaaS Control Plane', path: '/dashboard', icon: '📊', group: 'Navigation' },
    { label: 'Document Ingestion Studio', path: '/rag-studio', icon: '📄', group: 'Navigation' },
    { label: '1M-Record Keyset Telemetry Explorer', path: '/telemetry', icon: '⚡', group: 'Navigation' },
    { label: '50-Field AI Governance Wizard', path: '/governance', icon: '🛡️', group: 'Navigation' },
    { label: 'Split-Screen Vue 3 Widget Playground', path: '/widget-playground', icon: '💬', group: 'Navigation' },
    { label: 'Run SQL EXPLAIN ANALYZE Benchmark', path: '/telemetry?verify=true', icon: '📐', group: 'Actions' },
    { label: 'Trigger Field-48 JWT Expiry Test', path: '/governance?simulate=true', icon: '⏱️', group: 'Actions' },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  function execute(path: string) {
    setIsOpen(false);
    setSearch('');
    router.push(path as any);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white/95 dark:bg-[#111827]/95 border border-purple-200 dark:border-purple-500/40 rounded-2xl max-w-lg w-full p-4 shadow-[0_0_25px_rgba(168,85,247,0.15)] text-slate-900 dark:text-slate-100 font-sans backdrop-blur-sm transition-all">
        <div className="relative mb-3 flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to page..."
            autoFocus
            className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 font-sans transition-colors"
          />
          <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/40 font-mono text-[10px] font-bold shadow-xs whitespace-nowrap">
            Cmd+K
          </span>
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto">
          {filtered.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => execute(cmd.path)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors text-xs text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{cmd.icon}</span>
                <span className="font-medium">{cmd.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 font-mono">
                {cmd.group}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">No matching commands found</div>
          )}
        </div>

        <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span>Navigate with arrow keys · Press ESC to dismiss</span>
          <span className="px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/40 font-mono font-bold">
            ESC
          </span>
        </div>
      </div>
    </div>
  );
}
