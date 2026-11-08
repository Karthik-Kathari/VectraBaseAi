'use client';

/**
 * VectraBase AI — Premium B2B SaaS Landing Page
 * Classic, clean, professional enterprise UI with Light and Dark mode
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient, setAccessToken } from '@/lib/axios';
import { toast } from 'sonner';
import gsap from 'gsap';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.gsap-fade-up'),
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' }
      );
    }
  }, []);

  async function handleLaunchSandbox() {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }

  const faqs = [
    {
      q: 'How does VectraBase AI eliminate AI hallucinations?',
      a: 'VectraBase AI uses strict Retrieval-Augmented Generation (RAG) powered by PostgreSQL pgvector. When a user asks a question, the assistant only answers using verified semantic chunks from your indexed files. Every response includes clickable citation pills linking directly to the exact page and paragraph source.',
    },
    {
      q: 'What types of documents can I upload to my Knowledge Base?',
      a: 'You can upload PDF manuals, Markdown documentation, and plain text files up to 10MB each. You can also paste public web URLs to automatically fetch and strip scripts using our background web ingestion pipeline.',
    },
    {
      q: 'How do I add the AI assistant to my own website?',
      a: 'Embedding takes less than 30 seconds. You copy a simple 2-line HTML snippet into your website body. The widget is fully self-contained (Vue 3 + GSAP) and works on WordPress, Webflow, Shopify, React, Next.js, or plain HTML.',
    },
    {
      q: 'Is my data secure and isolated from other tenants?',
      a: 'Yes. VectraBase AI implements multi-tenant isolation at the database layer with UUID-scoped tenant partitioning, Redis SETNX idempotency locks, and role-based access control (RBAC). Your documents are never shared or used to train public foundation models.',
    },
    {
      q: 'Why is VectraBase AI faster than traditional RAG solutions?',
      a: 'We leverage a high-speed Redis semantic cache that normalizes query intents and caches answers with a 60-second TTL. Common questions are served in under 2 milliseconds without hitting the LLM, reducing latency by over 95% and lowering cloud costs.',
    },
  ];

  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="gsap-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-cyan-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-cyan-400 animate-pulse"></span>
          <span>Next-Gen Enterprise Knowledge Engine</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400">v1.0 Production Ready</span>
        </div>

        <h1 className="gsap-fade-up text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Build AI Assistants from Your{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Own Data in Seconds
          </span>
        </h1>

        <p className="gsap-fade-up text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Transform technical PDFs, API manuals, and web documentation into accurate, zero-hallucination AI chat assistants. Embeddable on any website with a single line of code.
        </p>

        {/* Action Buttons */}
        <div className="gsap-fade-up flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleLaunchSandbox}
            isLoading={isLoading}
            className="shadow-sm px-7 py-3 text-sm font-semibold tracking-tight"
          >
            Launch Live Sandbox →
          </Button>

          <Link href="/widget-playground">
            <Button
              variant="outline"
              size="lg"
              className="px-7 py-3 text-sm font-semibold"
            >
              💬 Try Live Chat Playground
            </Button>
          </Link>
        </div>

        {/* Key Metrics Strip */}
        <div className="gsap-fade-up grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-cyan-400">&lt; 2ms</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Redis Cache Latency</div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">1,000,000</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Telemetry Records Virtualized</div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Grounded Source Citations</div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">0 Data Loss</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Silent JWT Token Refresh</div>
          </div>
        </div>
      </section>

      {/* ─── How It Works (3 Steps) ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="cyan">Seamless Workflow</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">How VectraBase AI Works</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            From raw documents to an active embedded assistant in three straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-cyan-500/40 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-100 dark:border-cyan-500/30 flex items-center justify-center text-indigo-600 dark:text-cyan-400 text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Your Knowledge</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Drag-and-drop PDFs, markdown manuals, or paste live website URLs. Our ingestion engine parses and strips scripts automatically.
            </p>
            <div className="pt-2">
              <Link href="/rag-studio" className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                Open Knowledge Base →
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Instant Semantic Indexing</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Documents are split into 512-token chunks and converted into 1536-dimensional vectors, indexed with pgvector HNSW on Neon Lakebase Postgres.
            </p>
            <div className="pt-2">
              <Link href="/dashboard" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                View Control Plane →
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deploy & Chat Everywhere</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Embed our lightweight Vue 3 chat assistant on any website with a single script tag. Users get instant answers with cited document sources.
            </p>
            <div className="pt-2">
              <Link href="/widget-playground" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                Test Embed Widget →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Capabilities / Features ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="cyan">Enterprise Grade</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Engineered for Production Resilience</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Everything your team needs to deploy reliable AI assistants without hallucination or security risks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-indigo-400 dark:hover:border-cyan-500/30 transition-all">
            <CardHeader>
              <span className="text-2xl mb-2 block">🛡️</span>
              <CardTitle className="text-base text-slate-900 dark:text-white">Zero-Hallucination Guardrails</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Strict context bounding forces the AI to reply solely with verified facts from your uploaded data. Unverified claims and prompt injections are refused.
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-400 dark:hover:border-cyan-500/30 transition-all">
            <CardHeader>
              <span className="text-2xl mb-2 block">⚡</span>
              <CardTitle className="text-base text-slate-900 dark:text-white">Sub-2ms Semantic Caching</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Identical or semantically matching queries hit our Redis cache in &lt;2ms, avoiding expensive model inference calls and keeping user chat lightning fast.
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-400 dark:hover:border-cyan-500/30 transition-all">
            <CardHeader>
              <span className="text-2xl mb-2 block">💬</span>
              <CardTitle className="text-base text-slate-900 dark:text-white">Standalone Vue 3 Embed Widget</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pre-bundled 306KB IIFE script powered by Vue 3 Composition API, Pinia, and GSAP spring physics. Droppable on any webpage with zero framework dependencies.
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-400 dark:hover:border-cyan-500/30 transition-all">
            <CardHeader>
              <span className="text-2xl mb-2 block">🏢</span>
              <CardTitle className="text-base text-slate-900 dark:text-white">Multi-Tenant Isolation</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every document, chunk, and vector query is hard-partitioned by UUID tenant ID, backed by Neon Lakebase Postgres and Prisma ORM.
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-400 dark:hover:border-cyan-500/30 transition-all">
            <CardHeader>
              <span className="text-2xl mb-2 block">📜</span>
              <CardTitle className="text-base text-slate-900 dark:text-white">1M Record Telemetry Explorer</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Browse 1,000,000 telemetry events with 60fps virtualized scrolling, keyset pagination, and sub-15ms SQL seek benchmarks.
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-400 dark:hover:border-cyan-500/30 transition-all">
            <CardHeader>
              <span className="text-2xl mb-2 block">🔐</span>
              <CardTitle className="text-base text-slate-900 dark:text-white">Zero-Data-Loss JWT Refresh</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Thread-safe Axios 401 interceptor queues concurrent requests during token expiration, rotating refresh tokens seamlessly without losing unsubmitted data.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── 30-Second Embed Code Demonstration ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">Fast Integration</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Embed on Any Site in 30 Seconds</h3>
            </div>
            <Link href="/widget-playground">
              <Button variant="primary" size="sm">
                Open Embed Generator →
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Paste this snippet into your HTML before the closing <code className="text-indigo-600 dark:text-cyan-400 font-mono font-semibold">&lt;/body&gt;</code> tag to launch your custom AI knowledge assistant:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
            <pre className="text-cyan-300">
{`<link rel="stylesheet" href="https://vectrabaseai.vercel.app/widget.css">
<div id="vectrabase-widget"></div>
<script src="https://vectrabaseai.vercel.app/widget.js"><\/script>
<script>
  VectraBaseWidget.init({
    tenantId: "00000000-0000-0000-0000-000000000001",
    apiUrl: "https://vectrabase-api.onrender.com",
    theme: "light",
    position: "bottom-right"
  });
<\/script>`}
            </pre>
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions (FAQ) ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="cyan">FAQ</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Everything you need to know about setting up and deploying VectraBase AI.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">{faq.q}</span>
                  <span className="text-indigo-600 dark:text-cyan-400 font-mono text-lg font-bold">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Bottom Call to Action ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-sky-50 dark:from-cyan-950/40 dark:via-[#11131C] dark:to-indigo-950/40 border border-indigo-100 dark:border-cyan-500/30 space-y-6 shadow-sm dark:shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to Supercharge Your Company Knowledge?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto">
            Test the live sandbox, upload your technical documents, and experience sub-2ms zero-hallucination AI chat today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleLaunchSandbox}
              isLoading={isLoading}
              className="shadow-sm px-8 py-3.5 text-sm font-semibold"
            >
              Launch Live Demo Sandbox →
            </Button>
            <Link href="/widget-playground">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3.5 text-sm font-semibold"
              >
                Open Chat Playground
              </Button>
            </Link>
          </div>
          <p className="text-[11px] font-mono text-slate-500">
            Engineered and architected by Karthik Kathari · Powered by Neon Lakebase Postgres &amp; Redis
          </p>
        </div>
      </section>
    </div>
  );
}
