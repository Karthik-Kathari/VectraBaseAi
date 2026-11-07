'use client';

/**
 * VectraBase AI — Landing Screen & Recruiter Sandbox Login
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, setAccessToken } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function launchRecruiterSandbox() {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', {
        email: 'karthikmk.workspace@gmail.com',
        password: 'Demo@VectraBase2024!',
      });
      if (res.data?.success) {
        setAccessToken(res.data.data.accessToken);
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      // Fallback direct navigation to sandbox dashboard
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Header Navigation with 4-Step Engineering Proof Switcher */}
      <header className="border-b border-[#1E2230] bg-[#11131C]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Creator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-1.5 shadow-lg shadow-cyan-500/20">
              <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span className="font-mono font-bold text-sm tracking-tight text-white flex items-center gap-2">
                VectraBase AI
                <Badge variant="cyan">v1.0 Production</Badge>
              </span>
              <span className="text-[11px] font-mono text-slate-400 block">
                Architect: Karthik Kathari
              </span>
            </div>
          </div>

          {/* 4-Step Engineering Proof Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#090A0F] p-1 rounded-xl border border-[#1E2230] text-xs font-mono">
            <Link
              href="/widget-playground"
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-[#1E2230] transition-colors"
            >
              1. Live RAG & Vue Widget
            </Link>
            <Link
              href="/telemetry"
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-[#1E2230] transition-colors"
            >
              2. 1M Telemetry & SQL Proof
            </Link>
            <Link
              href="/governance"
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-[#1E2230] transition-colors"
            >
              3. Field-48 JWT Expiry Test
            </Link>
            <Link
              href="/telemetry?verify=true"
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-[#1E2230] transition-colors"
            >
              4. Redis Cache &lt;2ms
            </Link>
          </div>

          {/* Direct GitHub Link */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>GitHub</span>
              <span>↗</span>
            </a>
            <Button variant="primary" size="sm" onClick={launchRecruiterSandbox} isLoading={isLoading}>
              Launch Sandbox →
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center">
        {/* Architecture Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11131C] border border-[#2A2F45] text-xs font-mono text-cyan-400 mx-auto mb-6 shadow-lg shadow-cyan-950/20">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Next.js 15 · Vue.js 3 · Node.js · FastAPI · PostgreSQL pgvector · Redis</span>
        </div>

        {/* Primary Title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 font-mono leading-tight">
          Multi-Tenant RAG Knowledge Engine &amp;{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Embeddable Vue.js Widget
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-sans">
          Upload real PDFs, technical documentation, or website URLs to train a zero-hallucination AI assistant.
          Managed via a Next.js 15 control plane and deployed anywhere with sub-2ms Redis caching, 1,000,000-record
          virtualized telemetry, and zero-data-loss JWT refresh.
        </p>

        {/* Primary CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            variant="primary"
            size="lg"
            onClick={launchRecruiterSandbox}
            isLoading={isLoading}
            className="w-full sm:w-auto text-sm px-8 py-3.5 shadow-xl shadow-cyan-500/25"
          >
            Launch Recruiter Sandbox → (Karthik Kathari)
          </Button>

          <Link href="/widget-playground" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full text-sm px-7 py-3.5">
              Open Vue.js 3 Live Playground
            </Button>
          </Link>
        </div>

        {/* 4 Feature Proof Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left font-mono">
          <Link
            href="/widget-playground"
            className="p-4 rounded-xl bg-[#11131C] border border-[#1E2230] hover:border-cyan-500/50 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 text-cyan-400 flex items-center justify-center mb-3 text-sm">
              💬
            </div>
            <h3 className="font-bold text-xs text-white mb-1 group-hover:text-cyan-400 transition-colors">
              Vue.js 3 Embed Widget
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Streaming markdown responses with clickable pgvector chunk citation pills and page preview cards.
            </p>
          </Link>

          <Link
            href="/telemetry"
            className="p-4 rounded-xl bg-[#11131C] border border-[#1E2230] hover:border-emerald-500/50 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-3 text-sm">
              ⚡
            </div>
            <h3 className="font-bold text-xs text-white mb-1 group-hover:text-emerald-400 transition-colors">
              1,000,000 Keyset Grid
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Virtual DOM grid capped strictly at &lt;60 rows at 60fps scrolling with sub-15ms index seeks.
            </p>
          </Link>

          <Link
            href="/governance"
            className="p-4 rounded-xl bg-[#11131C] border border-[#1E2230] hover:border-indigo-500/50 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 text-indigo-400 flex items-center justify-center mb-3 text-sm">
              🛡️
            </div>
            <h3 className="font-bold text-xs text-white mb-1 group-hover:text-indigo-400 transition-colors">
              50-Field AI Governance
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              200ms debounced IndexedDB autosave + silent JWT refresh interceptor preventing configuration loss.
            </p>
          </Link>

          <Link
            href="/rag-studio"
            className="p-4 rounded-xl bg-[#11131C] border border-[#1E2230] hover:border-cyan-500/50 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 text-cyan-400 flex items-center justify-center mb-3 text-sm">
              📐
            </div>
            <h3 className="font-bold text-xs text-white mb-1 group-hover:text-cyan-400 transition-colors">
              GSAP RAG Pipeline
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Hardware-accelerated 5-stage SVG telemetry pulse with instantaneous Redis short-circuiting.
            </p>
          </Link>
        </div>
      </main>

      {/* Attribution Footer */}
      <footer className="border-t border-[#1E2230] bg-[#11131C] py-6 px-6 font-mono text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>
              Architected &amp; Engineered exclusively by{' '}
              <strong className="text-white">Karthik Kathari</strong>
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-300">
            <a
              href="https://github.com/Karthik-Kathari"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <span>↗</span>
            </a>
            <span>·</span>
            <a
              href="https://linkedin.com/in/karthikkathari"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>LinkedIn</span>
              <span>↗</span>
            </a>
            <span>·</span>
            <a
              href="mailto:karthikmk.workspace@gmail.com"
              className="hover:text-cyan-400 transition-colors"
            >
              karthikmk.workspace@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
