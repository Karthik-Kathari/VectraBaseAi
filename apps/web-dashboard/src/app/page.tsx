'use client';

/**
 * VectraBase AI — Premium B2B SaaS Landing Page
 * Gray & White primary surfaces, Purple & Red accents, Yellow highlights, and Subtle Neon glows.
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
import { 
  Copy, 
  Check, 
  Database, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  Layers, 
  ArrowRight,
  Lock,
  BarChart3,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedNode, setSelectedNode] = useState<number>(1);
  const [hasCopied, setHasCopied] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.gsap-fade-up'),
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out' }
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

  function handleCopySnippet() {
    const snippet = `<link rel="stylesheet" href="https://vectrabaseai.vercel.app/widget.css">
<div id="vectrabase-widget"></div>
<script src="https://vectrabaseai.vercel.app/widget.js"></script>
<script>
  VectraBaseWidget.init({
    tenantId: "00000000-0000-0000-0000-000000000001",
    apiUrl: "https://vectrabase-api.onrender.com",
    theme: "light",
    position: "bottom-right"
  });
</script>`;
    navigator.clipboard.writeText(snippet);
    setHasCopied(true);
    toast.success('Embed snippet copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2500);
  }

  const pipelineNodes = [
    {
      id: 0,
      title: 'Embed Client / Vue 3 Widget',
      category: 'Client Layer',
      icon: MessageSquare,
      accentColor: 'purple',
      latency: '0.4ms',
      status: 'READY',
      details: 'Lightweight 306KB standalone IIFE library. Supports dual light/dark themes, shadow DOM isolation, and iframe embed targets.',
      metrics: { throughput: '12,400 req/s', compression: 'Gzip 87KB', frameRate: '60 fps GSAP' },
    },
    {
      id: 1,
      title: 'Redis Semantic Cache',
      category: 'In-Memory Sub-2ms Tier',
      icon: Zap,
      accentColor: 'yellow',
      latency: '1.4ms',
      status: 'ACTIVE CACHE',
      details: 'Normalized intent matching with cosine thresholding. Common questions resolve sub-2ms without model invocations, slashing inference costs by 95%.',
      metrics: { cacheHitRate: '94.2%', ttl: '60 Seconds', concurrencyLock: 'SETNX Mutex' },
    },
    {
      id: 2,
      title: 'Neon Lakebase Postgres',
      category: 'pgvector 0.8.6 HNSW',
      icon: Database,
      accentColor: 'purple',
      latency: '11.8ms',
      status: 'CONNECTED',
      details: '1536-dimensional vector embeddings with multi-tenant row isolation. Hard-partitioned tenant UUIDs and ACID transactional persistence.',
      metrics: { dimensions: '1536-dim', indexType: 'HNSW Cosine', distanceMetric: 'Cosine Similarity' },
    },
    {
      id: 3,
      title: 'Zero-Hallucination LLM Guard',
      category: 'Inference & Synthesis',
      icon: ShieldCheck,
      accentColor: 'red',
      latency: '84.2ms',
      status: 'VERIFIED',
      details: 'Strict context bounding forces model to synthesize responses strictly using retrieved chunk citations. Unverified conjectures are strictly discarded.',
      metrics: { groundScore: '100.0%', injectionRefusal: '99.9%', citationDensity: '3.4 pills/ans' },
    },
  ];

  const faqs = [
    {
      q: 'How does VectraBase AI eliminate AI hallucinations?',
      a: 'VectraBase AI uses strict Retrieval-Augmented Generation (RAG) powered by PostgreSQL pgvector 0.8.6. When a user asks a question, the assistant only answers using verified semantic chunks from your indexed files. Every response includes clickable citation pills linking directly to the exact page and paragraph source.',
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
    <div className="space-y-24 py-10 md:py-16">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Yellow Highlight Pill */}
        <div className="gsap-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-amber-300/80 dark:border-amber-500/40 text-xs font-medium text-slate-800 dark:text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.7)]"></span>
          <span>Next-Gen Enterprise Knowledge Engine</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-purple-600 dark:text-purple-400 font-mono">v1.0 Production Ready</span>
        </div>

        {/* Hero Title */}
        <h1 className="gsap-fade-up text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Build AI Assistants from Your{' '}
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 dark:from-purple-400 dark:via-indigo-300 dark:to-rose-400 bg-clip-text text-transparent">
            Own Data in Seconds
          </span>
        </h1>

        {/* Hero Subtitle */}
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
            className="px-7 py-3 text-sm font-semibold tracking-tight bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-neon-purple transition-all"
          >
            Launch Live Sandbox →
          </Button>

          <Link href="/widget-playground">
            <Button
              variant="outline"
              size="lg"
              className="px-7 py-3 text-sm font-semibold hover:border-purple-500/50 hover:shadow-neon-purple/20 transition-all"
            >
              💬 Try Live Chat Playground
            </Button>
          </Link>
        </div>

        {/* Key Metrics Strip (Redesigned with Primary Gray/White + Accent Glows) */}
        <div className="gsap-fade-up grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
          {/* Metric 1: Cache Latency (Purple Accent) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-purple-500/30 text-center shadow-[0_0_16px_rgba(168,85,247,0.12)] relative overflow-hidden group hover:border-purple-500/60 transition-all">
            <div className="absolute top-2 right-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]"></span>
            </div>
            <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">&lt; 2ms</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Redis Cache Latency</div>
          </div>

          {/* Metric 2: Telemetry Records (Yellow Highlight) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-amber-500/30 text-center shadow-[0_0_16px_rgba(245,158,11,0.12)] relative overflow-hidden group hover:border-amber-500/60 transition-all">
            <div className="absolute top-2 right-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]"></span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-500 dark:text-amber-400">1,000,000</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Telemetry Records</div>
          </div>

          {/* Metric 3: Grounded Citations (Emerald Accent) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-emerald-500/30 text-center shadow-[0_0_16px_rgba(16,185,129,0.12)] relative overflow-hidden group hover:border-emerald-500/60 transition-all">
            <div className="absolute top-2 right-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Grounded Source Citations</div>
          </div>

          {/* Metric 4: Silent JWT Queue (Red Accent) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-rose-500/30 text-center shadow-[0_0_16px_rgba(244,63,94,0.12)] relative overflow-hidden group hover:border-rose-500/60 transition-all">
            <div className="absolute top-2 right-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"></span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">0 Data Loss</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Silent JWT Token Refresh</div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Architecture Visualizer ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="purple" className="shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Live Pipeline Architecture
          </Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            High-Performance RAG Architecture Visualizer
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Click any pipeline node to inspect real-time throughput, latency guarantees, and isolation boundaries.
          </p>
        </div>

        {/* Visualizer Interactive Container */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-md p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-8">
          {/* Node Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {pipelineNodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const Icon = node.icon;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node.id)}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-neon-purple ring-1 ring-purple-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090b10] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 ${
                      node.accentColor === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' :
                      node.accentColor === 'yellow' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' :
                      'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {node.latency}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 block">
                    {node.category}
                  </span>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                    {node.title}
                  </h4>

                  {isSelected && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                      <span>Inspecting Component</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Node Detail Card */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {pipelineNodes[selectedNode].title}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Status: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{pipelineNodes[selectedNode].status}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="purple">Latency: {pipelineNodes[selectedNode].latency}</Badge>
                <Badge variant="yellow">Cluster Node 0{selectedNode + 1}</Badge>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {pipelineNodes[selectedNode].details}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {Object.entries(pipelineNodes[selectedNode].metrics).map(([key, value]) => (
                <div key={key} className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs font-sans">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-mono">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works (3 Steps) ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="purple">Seamless Workflow</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">How VectraBase AI Works</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            From raw enterprise documents to an active embedded assistant in three straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1: Purple Accent */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-xs hover:shadow-neon-purple/20 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl font-bold shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Your Knowledge</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Drag-and-drop PDFs, markdown manuals, or paste live website URLs. Our ingestion engine parses and strips scripts automatically.
            </p>
            <div className="pt-2">
              <Link href="/rag-studio" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                Open Knowledge Base →
              </Link>
            </div>
          </div>

          {/* Step 2: Yellow Highlight */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-xs hover:shadow-neon-amber/20 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xl font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Instant Semantic Indexing</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Documents are split into 512-token chunks and converted into 1536-dimensional vectors, indexed with pgvector HNSW on Neon Lakebase Postgres.
            </p>
            <div className="pt-2">
              <Link href="/dashboard" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                View Control Plane →
              </Link>
            </div>
          </div>

          {/* Step 3: Red Accent */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 shadow-xs hover:shadow-neon-red/20 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 text-xl font-bold shadow-[0_0_12px_rgba(244,63,94,0.2)]">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deploy &amp; Chat Everywhere</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Embed our lightweight Vue 3 chat assistant on any website with a single script tag. Users get instant answers with cited document sources.
            </p>
            <div className="pt-2">
              <Link href="/widget-playground" className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
                Test Embed Widget →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Capabilities / Features ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="purple">Enterprise Grade</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Engineered for Production Resilience</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Everything your team needs to deploy reliable AI assistants without hallucination or security risks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl block">🛡️</span>
                <Badge variant="red">Strict Guardrail</Badge>
              </div>
              <CardTitle className="text-base text-slate-900 dark:text-white">Zero-Hallucination Guardrails</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Strict context bounding forces the AI to reply solely with verified facts from your uploaded data. Unverified claims and prompt injections are refused.
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl block">⚡</span>
                <Badge variant="purple">Sub-2ms Latency</Badge>
              </div>
              <CardTitle className="text-base text-slate-900 dark:text-white">Sub-2ms Semantic Caching</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Identical or semantically matching queries hit our Redis cache in &lt;2ms, avoiding expensive model inference calls and keeping user chat lightning fast.
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl block">💬</span>
                <Badge variant="yellow">Standalone IIFE</Badge>
              </div>
              <CardTitle className="text-base text-slate-900 dark:text-white">Standalone Vue 3 Embed Widget</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pre-bundled 306KB IIFE script powered by Vue 3 Composition API, Pinia, and GSAP spring physics. Droppable on any webpage with zero framework dependencies.
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl block">🏢</span>
                <Badge variant="purple">UUID Scoped</Badge>
              </div>
              <CardTitle className="text-base text-slate-900 dark:text-white">Multi-Tenant Isolation</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every document, chunk, and vector query is hard-partitioned by UUID tenant ID, backed by Neon Lakebase Postgres and Prisma ORM.
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl block">📜</span>
                <Badge variant="yellow">Virtual Scrolling</Badge>
              </div>
              <CardTitle className="text-base text-slate-900 dark:text-white">1M Record Telemetry Explorer</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Browse 1,000,000 telemetry events with 60fps virtualized scrolling, keyset pagination, and sub-15ms SQL seek benchmarks.
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl block">🔐</span>
                <Badge variant="red">Zero Data Loss</Badge>
              </div>
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
        <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Fast Integration</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Embed on Any Site in 30 Seconds</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopySnippet}
                className="hover:border-purple-400 cursor-pointer text-xs"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </Button>
              <Link href="/widget-playground">
                <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Open Embed Generator →
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Paste this snippet into your HTML before the closing <code className="text-purple-600 dark:text-purple-400 font-mono font-semibold">&lt;/body&gt;</code> tag to launch your custom AI knowledge assistant:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
            <pre className="text-purple-300">
{`<link rel="stylesheet" href="https://vectrabaseai.vercel.app/widget.css">
<div id="vectrabase-widget"></div>
<script src="https://vectrabaseai.vercel.app/widget.js"></script>
<script>
  VectraBaseWidget.init({
    tenantId: "00000000-0000-0000-0000-000000000001",
    apiUrl: "https://vectrabase-api.onrender.com",
    theme: "light",
    position: "bottom-right"
  });
</script>`}
            </pre>
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions (FAQ) ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="purple">FAQ</Badge>
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
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">{faq.q}</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono text-lg font-bold">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 font-sans">
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
        <div className="p-10 rounded-3xl bg-gradient-to-r from-purple-50/70 via-white to-slate-50 dark:from-purple-950/20 dark:via-[#111827] dark:to-slate-950/40 border border-purple-500/30 shadow-neon-purple/20 space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="purple">Enterprise Ready</Badge>
            <Badge variant="yellow">v1.0 Production</Badge>
          </div>
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
              className="shadow-sm px-8 py-3.5 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white hover:shadow-neon-purple transition-all"
            >
              Launch Live Demo Sandbox →
            </Button>
            <Link href="/widget-playground">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3.5 text-sm font-semibold hover:border-purple-500/50 hover:shadow-neon-purple/20"
              >
                Open Chat Playground
              </Button>
            </Link>
          </div>
          <p className="text-[11px] font-mono text-slate-500">
            Powered by Neon Lakebase Postgres &amp; Redis
          </p>
        </div>
      </section>
    </div>
  );
}
