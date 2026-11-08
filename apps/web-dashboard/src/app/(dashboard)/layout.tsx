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
    <div className="flex-1 flex flex-col w-full bg-[#090A0F]">
      {/* Sub-header Workspace Bar */}
      <div className="h-12 border-b border-[#1E2230] bg-[#11131C]/60 px-4 sm:px-6 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#090A0F] border border-[#1E2230]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-200 font-medium">Workspace: vectrabase-demo</span>
            <Badge variant="cyan" className="text-[10px] py-0 px-1.5">Enterprise</Badge>
          </div>

          <span className="hidden sm:inline text-slate-600">|</span>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <span>Database:</span>
            <span className="text-emerald-400 font-semibold">Neon Lakebase (pgvector active)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/widget-playground"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
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
          className={`border-r border-[#1E2230] bg-[#11131C] p-3 flex flex-col justify-between transition-all duration-200 flex-shrink-0 ${
            isCollapsed ? 'w-16' : 'w-56'
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              {!isCollapsed && 'Navigation'}
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path as any}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
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
                <span className="block text-slate-500">Architect & Engineer:</span>
                <span className="font-bold text-white block">Karthik Kathari</span>
                <span className="text-[10px] text-cyan-400 block mt-0.5">VectraBase AI Platform</span>
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
