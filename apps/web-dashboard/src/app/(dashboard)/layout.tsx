'use client';

/**
 * VectraBase AI — Dashboard Control Plane Shell
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
    { label: 'Overview', path: '/dashboard', icon: '📊' },
    { label: 'Knowledge Base', path: '/rag-studio', icon: '📄' },
    { label: 'Chat Playground', path: '/widget-playground', icon: '💬' },
    { label: 'Telemetry & Logs', path: '/telemetry', icon: '⚡' },
    { label: 'AI Governance', path: '/governance', icon: '🛡️' },
  ];

  return (
    <div className="flex-1 flex flex-col w-full bg-slate-50 dark:bg-[#0B0F19] transition-colors">
      {/* Sub-header Workspace Bar */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111827]/60 px-4 sm:px-6 flex items-center justify-between text-xs font-sans">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">Workspace: vectrabase-demo</span>
            <Badge variant="cyan" className="text-[10px] py-0 px-1.5">Enterprise</Badge>
          </div>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span>Database:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Neon Lakebase (pgvector active)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/widget-playground"
            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-cyan-400 hover:underline font-medium"
          >
            <span>Test Chat Assistant</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Main Body: Sidebar + Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-3 flex flex-col justify-between transition-all duration-200 flex-shrink-0 ${
            isCollapsed ? 'w-16' : 'w-56'
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-sans font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {!isCollapsed && 'Navigation'}
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path as any}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-sans transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-cyan-500/15 dark:text-cyan-300 border border-indigo-200 dark:border-cyan-500/30 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
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
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {!isCollapsed && (
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-sans text-slate-600 dark:text-slate-400">
                <span className="block text-slate-400 dark:text-slate-500 text-[10px]">Architect &amp; Engineer:</span>
                <span className="font-semibold text-slate-900 dark:text-white block">Karthik Kathari</span>
                <span className="text-[10px] text-indigo-600 dark:text-cyan-400 block mt-0.5">VectraBase AI Platform</span>
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-sans flex items-center justify-center cursor-pointer"
            >
              {isCollapsed ? '→' : '← Collapse'}
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
