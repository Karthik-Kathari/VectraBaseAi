'use client';

/**
 * VectraBase AI — Cmd+K / Ctrl+K Command Palette
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#11131C] border border-[#2A2F45] rounded-xl max-w-lg w-full p-3 shadow-2xl text-slate-100 font-mono">
        <div className="relative mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to page..."
            autoFocus
            className="w-full bg-[#090A0F] border border-[#1E2230] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto">
          {filtered.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => execute(cmd.path)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1E2230] text-left transition-colors text-xs text-slate-200 hover:text-cyan-400 group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{cmd.icon}</span>
                <span>{cmd.label}</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                {cmd.group}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500">No matching commands found</div>
          )}
        </div>

        <div className="pt-2.5 mt-2 border-t border-[#1E2230] flex items-center justify-between text-[10px] text-slate-500">
          <span>Navigate with arrow keys · Press ESC to close</span>
          <span className="px-1.5 py-0.5 rounded bg-[#1E2230] text-slate-400">ESC</span>
        </div>
      </div>
    </div>
  );
}
