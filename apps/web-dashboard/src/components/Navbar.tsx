'use client';

/**
 * VectraBase AI — Global SaaS Navigation Bar
 * Ultra-Responsive, Zero-Overflow, High-End B2B SaaS Layout
 * Precision-engineered for 320px, 393px (iPhone 14 Pro), 768px (iPad), 1024px, 1280px, and 1440px+
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Search, Github, Menu, X, Sparkles, ArrowRight, Zap } from 'lucide-react';
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
    return <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center cursor-pointer flex-shrink-0 ${isDark ? 'hover:text-amber-300 hover:border-amber-400/40 hover:shadow-[0_0_10px_rgba(245,158,11,0.25)]' : 'hover:text-purple-600 hover:border-purple-300'
        } ${className || ''}`}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-purple-600" />
      )}
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLaunchingDemo, setIsLaunchingDemo] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Core navigation links (compact and guaranteed to fit across 1024px - 1440px)
  const primaryLinks = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Playground', href: '/widget-playground' },
  ];

  // Secondary links revealed on ultra-wide screens (>= 1400px) and always available in mobile drawer
  const secondaryLinks = [
    { label: 'Knowledge Base', href: '/rag-studio' },
    { label: 'Telemetry', href: '/telemetry' },
    { label: 'Governance', href: '/governance' },
  ];

  const allNavLinks = [...primaryLinks, ...secondaryLinks];

  async function handleQuickLaunch() {
    setIsLaunchingDemo(true);
    try {
      const res = await apiClient.post('/api/auth/demo-session');
      if (res.data?.success) {
        setAccessToken(res.data.data.accessToken);
        toast.success('Authenticated as Demo Administrator!');
      }
      router.push('/dashboard' as any);
    } catch {
      router.push('/dashboard' as any);
    } finally {
      setIsLaunchingDemo(false);
      setIsMobileMenuOpen(false);
    }
  }

  function openSearch() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-md transition-colors">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 box-border">

        {/* ─── 1. Brand Logo & Product Badge ─────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 min-w-0 z-10">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group whitespace-nowrap">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-500 flex items-center justify-center p-1.5 shadow-sm shadow-purple-500/30 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all flex-shrink-0">
              <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                VectraBase AI
              </span>
              <Badge variant="purple" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 font-mono">
                v1.0
              </Badge>
            </div>
          </Link>
        </div>

        {/* ─── 2. Desktop Navigation Pills (Centrally Positioned Floating Capsule) ── */}
        {/* Absolute mathematical center on lg+ (1024px+) */}
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 p-1 rounded-full bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm text-xs font-medium z-10 pointer-events-auto shadow-xs">
          {primaryLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href as any}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex-shrink-0 ${isActive
                  ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-semibold shadow-xs border border-slate-200/50 dark:border-slate-700/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Secondary links displayed strictly on >= 1400px (2xl screens) */}
          <div className="hidden 2xl:flex items-center gap-1">
            {secondaryLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex-shrink-0 ${isActive
                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-semibold shadow-xs border border-slate-200/50 dark:border-slate-700/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ─── 3. Right Action Controls ──────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 pr-0.5 sm:pr-1 z-10">

          {/* Quick Search Trigger (Hidden on mobile < md, icon on md-xl, expanded on 2xl+) */}
          <button
            type="button"
            onClick={openSearch}
            className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-500/40 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex-shrink-0"
            title="Search documents & commands (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden 2xl:inline text-slate-400 text-[11px]">Search</span>
            <kbd className="hidden 2xl:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
              Ctrl K
            </kbd>
          </button>

          {/* GitHub Repository Icon Link (Hidden on mobile < sm) */}
          <a
            href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="hidden sm:flex w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all items-center justify-center cursor-pointer flex-shrink-0"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Light / Dark Mode Toggle (Always accessible) */}
          <ThemeToggle />

          {/* Subtle Vertical Separator (Hidden on mobile and tablets) */}
          <div className="hidden xl:block h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* Sign In Link (Visible on xl+ 1280px+) */}
          <Link
            href={"/login" as any}
            className="hidden xl:inline-flex items-center px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Sign In
          </Link>

          {/* Primary CTA: Start Free Trial (Visible on sm+ 640px+, styled cleanly without nested button) */}
          <Link
            href={"/login" as any}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-purple-500/25 hover:shadow-[0_0_12px_rgba(168,85,247,0.35)] transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 hidden md:inline" />
            <span>Start Free Trial</span>
            <ArrowRight className="w-3 h-3 text-purple-200" />
          </Link>

          {/* Mobile & Tablet Hamburger Menu Toggle (Visible on < lg, exactly placed on the far right) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ml-1"
            aria-label="Toggle Navigation Menu"
            title="Open Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            ) : (
              <Menu className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            )}
          </button>
        </div>
      </div>

      {/* ─── 4. Mobile & Tablet Drawer ───────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090b10] px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Quick Search in Mobile Drawer */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              openSearch();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-xs text-slate-500"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search documents & commands...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
              Ctrl K
            </kbd>
          </button>

          {/* Navigation Links Grid */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {allNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:purple-400" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Auth & CTA Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={"/login" as any}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 text-center text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={"/login" as any}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 text-center text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Start Trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Instant Demo Sandbox Shortcut */}
            <button
              type="button"
              onClick={handleQuickLaunch}
              disabled={isLaunchingDemo}
              className="w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isLaunchingDemo ? 'Launching Demo...' : 'Instant Demo Sandbox'}</span>
            </button>

            {/* GitHub and Theme Row */}
            <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-500 dark:text-slate-400">
              <a
                href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repository ↗</span>
              </a>
              <div className="flex items-center gap-2">
                <span>Theme:</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
