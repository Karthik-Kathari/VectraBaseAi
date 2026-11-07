'use client';

/**
 * VectraBase AI — Obsidian Control Plane Shell Layout
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { label: 'Control Plane', path: '/dashboard', icon: '📊' },
    { label: 'RAG Studio', path: '/rag-studio', icon: '📄' },
    { label: '1M Telemetry Grid', path: '/telemetry', icon: '⚡' },
    { label: 'AI Governance Wizard', path: '/governance', icon: '🛡️' },
    { label: 'Vue Widget Live Lab', path: '/widget-playground', icon: '💬' },
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-[#1E2230] bg-[#11131C] px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-1 shadow-md shadow-cyan-500/20">
              <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-mono font-bold text-sm text-white">VectraBase AI</span>
          </Link>

          <span className="text-slate-600 font-mono">/</span>

          {/* Workspace Switcher */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#090A0F] border border-[#1E2230] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-200 font-medium">vectrabase-demo</span>
            <span className="text-slate-500 text-[10px]">▼</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Cmd+K Command Search Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090A0F] border border-[#1E2230] hover:border-cyan-500/40 text-xs font-mono text-slate-400 transition-colors cursor-pointer"
          >
            <span>Search or jump to...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#1E2230] text-[10px] text-slate-300">Ctrl K</kbd>
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#1E2230]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-sm font-mono">
              KK
            </div>
            <div className="hidden md:block text-left font-mono">
              <span className="text-xs font-bold text-white block leading-none">Karthik Kathari</span>
              <span className="text-[10px] text-cyan-400 leading-none">Principal Architect</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body: Sidebar + Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`border-r border-[#1E2230] bg-[#11131C] p-3 flex flex-col justify-between transition-all duration-200 flex-shrink-0 ${
            isCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path as any}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2230]'
                  }`}
                  title={item.label}
                >
                  <span className="text-base">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-[#1E2230] space-y-2">
            {!isCollapsed && (
              <div className="p-2.5 rounded-lg bg-[#090A0F] border border-[#1E2230] text-[11px] font-mono text-slate-400">
                <span className="block text-slate-500">Sole Creator:</span>
                <span className="font-bold text-white block">Karthik Kathari</span>
                <span className="text-[10px] text-cyan-400 block mt-0.5">VectraBase AI Engine</span>
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full p-2 rounded-lg bg-[#090A0F] hover:bg-[#1E2230] text-slate-400 hover:text-white transition-colors text-xs font-mono flex items-center justify-center cursor-pointer"
            >
              {isCollapsed ? '→' : '← Collapse'}
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
