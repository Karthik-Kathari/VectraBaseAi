'use client';

/**
 * VectraBase AI — Global SaaS Navigation Bar
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient, setAccessToken } from '@/lib/axios';
import { toast } from 'sonner';

function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer ${
        isDark ? 'shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''
      } ${className || ''}`}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 dark:text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
      ) : (
        <Moon className="w-4 h-4 text-purple-600 hover:text-purple-700" />
      )}
    </button>
  );
}

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#090b10]/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-500 flex items-center justify-center p-1.5 shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
                VectraBase AI
              </span>
              <Badge variant="purple" className="hidden sm:inline-flex text-[10px] py-0 px-1.5">v1.0</Badge>
            </div>
          </Link>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-[#111827]/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href as any}
                className={`px-3 py-1.5 rounded-full transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/40 text-xs font-mono text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            title="Search (Ctrl + K)"
          >
            <span>Search</span>
            <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] text-slate-500 dark:text-slate-300">Ctrl K</kbd>
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/40 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <span>GitHub</span>
            <span className="text-slate-400 text-[10px]">↗</span>
          </a>

          {/* Desktop Theme Toggle Button */}
          <ThemeToggle />

          {/* Primary Call to Action */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleQuickLaunch}
            isLoading={isLoggingIn}
            className="shadow-sm font-medium text-xs tracking-tight"
          >
            Launch Sandbox →
          </Button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-2 text-sm font-sans">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href as any}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Theme:</span>
              <ThemeToggle />
            </div>
            <a
              href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              GitHub Repository ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
