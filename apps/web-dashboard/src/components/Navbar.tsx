'use client';

/**
 * VectraBase AI — Global SaaS Navigation Bar
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient, setAccessToken } from '@/lib/axios';
import { toast } from 'sonner';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Knowledge Base', href: '/rag-studio' },
    { label: 'Chat Playground', href: '/widget-playground' },
    { label: '1M Telemetry', href: '/telemetry' },
    { label: 'Governance', href: '/governance' },
  ];

  async function handleQuickLaunch() {
    setIsLoggingIn(true);
    try {
      const res = await apiClient.post('/api/auth/demo-session');
      if (res.data?.success) {
        setAccessToken(res.data.data.accessToken);
        toast.success('Authenticated as Demo Administrator!');
      }
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E2230] bg-[#090A0F]/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span className="font-mono font-bold text-sm tracking-tight text-white flex items-center gap-2">
                VectraBase AI
                <Badge variant="cyan" className="hidden sm:inline-flex text-[10px] py-0 px-1.5">v1.0</Badge>
              </span>
              <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
                by Karthik Kathari
              </span>
            </div>
          </Link>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#11131C] px-3 py-1.5 rounded-full border border-[#1E2230] text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href as any}
                className={`px-3 py-1.5 rounded-full transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#11131C] border border-[#1E2230] hover:border-slate-700 text-xs font-mono text-slate-400 transition-colors cursor-pointer"
            title="Search (Ctrl + K)"
          >
            <span>Search</span>
            <kbd className="px-1 py-0.5 rounded bg-[#1E2230] text-[9px] text-slate-300">Ctrl K</kbd>
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11131C] border border-[#1E2230] hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>GitHub</span>
            <span className="text-slate-500 text-[10px]">↗</span>
          </a>

          {/* Primary Call to Action */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleQuickLaunch}
            isLoading={isLoggingIn}
            className="shadow-lg shadow-cyan-950/60 font-semibold text-xs tracking-tight"
          >
            Launch Sandbox →
          </Button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#11131C] border border-[#1E2230] text-slate-400 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E2230] bg-[#11131C] px-4 pt-2 pb-4 space-y-1 text-sm font-mono">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href as any}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 font-bold'
                    : 'text-slate-300 hover:bg-[#1E2230]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#1E2230] flex items-center justify-between">
            <a
              href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white"
            >
              GitHub Repository ↗
            </a>
            <span className="text-[10px] text-slate-500">v1.0 Production</span>
          </div>
        </div>
      )}
    </header>
  );
}

