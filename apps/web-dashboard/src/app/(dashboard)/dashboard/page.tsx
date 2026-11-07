'use client';

/**
 * VectraBase AI — SaaS Control Plane Overview Page
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RAGPipelineVisualizer } from '@/components/RAGPipelineVisualizer';
import { BenchmarkDrawer } from '@/components/BenchmarkDrawer';

export default function DashboardOverviewPage() {
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [simulatedPulse, setSimulatedPulse] = useState(false);
  const [cacheHitMode, setCacheHitMode] = useState(false);

  function triggerLivePipelinePulse(hit = false) {
    setCacheHitMode(hit);
    setSimulatedPulse(true);
    setTimeout(() => {
      setSimulatedPulse(false);
    }, 2500);
  }

  const statCards = [
    { title: 'Indexed Chunks (pgvector)', value: '1,000,003', change: '+3 new', icon: '📐', highlight: 'text-cyan-400' },
    { title: 'Redis Cache Hit Rate', value: '34.8%', change: '<2ms verified', icon: '⚡', highlight: 'text-emerald-400' },
    { title: 'Keyset Query Latency (p50)', value: '11.8ms', change: 'Zero-OFFSET', icon: '⏱️', highlight: 'text-indigo-400' },
    { title: 'Token Savings (Redis Cache)', value: '412,850', change: '100% compute saved', icon: '🪙', highlight: 'text-amber-400' },
  ];

  const recentQueries = [
    { text: 'Explain how VectraBase AI achieves sub-2ms latency?', latency: 0.9, cacheHit: true, score: 0.95, time: 'Just now' },
    { text: 'What is the HNSW vector index parameter configuration in pgvector?', latency: 312, cacheHit: false, score: 0.92, time: '2m ago' },
    { text: 'How does the zero-data-loss JWT refresh interceptor preserve state?', latency: 285, cacheHit: false, score: 0.89, time: '5m ago' },
    { text: 'Explain the sliding-window rate limiter Lua script in Redis', latency: 0.9, cacheHit: true, score: 0.94, time: '8m ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#11131C] via-[#161926] to-[#11131C] border border-[#1E2230] shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Production System Healthy · All Microservices Active
            </span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-white">
            VectraBase AI Control Plane
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Architected &amp; Engineered by{' '}
            <strong className="text-white">Karthik Kathari</strong> · Multi-Tenant pgvector RAG Sandbox
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsExplainOpen(true)}>
            Verify 1M Scale (EXPLAIN)
          </Button>
          <Link href="/rag-studio">
            <Button variant="primary" size="sm">
              + Ingest Document
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="p-4 bg-[#11131C]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>{card.title}</span>
              <span className="text-sm">{card.icon}</span>
            </div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${card.highlight}`}>
              {card.value}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              {card.change}
            </div>
          </Card>
        ))}
      </div>

      {/* GSAP 5-Stage Live RAG Pipeline Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Real-Time Pipeline Telemetry:
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerLivePipelinePulse(false)}
            >
              Simulate Full RAG Stream (Miss)
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={() => triggerLivePipelinePulse(true)}
            >
              Simulate Redis Cache Hit (&lt;2ms)
            </Button>
          </div>
        </div>

        <RAGPipelineVisualizer
          isActive={simulatedPulse}
          cacheHit={cacheHitMode}
        />
      </div>

      {/* Two-Column Grid: Recent Queries + Fast Quickstarts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Telemetry Queries (2 Cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent RAG Telemetry Inquiries</CardTitle>
            <Link href="/telemetry" className="text-xs font-mono text-cyan-400 hover:underline">
              View All 1,000,000 Records →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#1E2230]">
              {recentQueries.map((q, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-[#1E2230]/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-white truncate">{q.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {q.cacheHit ? (
                        <Badge variant="emerald">REDIS CACHE HIT (0.9ms)</Badge>
                      ) : (
                        <Badge variant="cyan">VECTOR RETRIEVAL ({q.latency}ms)</Badge>
                      )}
                      <span className="text-[11px] font-mono text-slate-500">
                        Score: {(q.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                    {q.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quickstart Lab Presets (1 Col) */}
        <Card>
          <CardHeader>
            <CardTitle>Live Testing Sandboxes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/widget-playground"
              className="block p-3 rounded-lg bg-[#090A0F] border border-[#1E2230] hover:border-cyan-500/50 transition-colors group cursor-pointer"
            >
              <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 transition-colors block">
                💬 Vue.js 3 Live Split-Screen Lab
              </span>
              <span className="text-[11px] text-slate-400 font-sans block mt-1">
                Interact with the embed widget while inspecting backend telemetry in real time.
              </span>
            </Link>

            <Link
              href="/governance"
              className="block p-3 rounded-lg bg-[#090A0F] border border-[#1E2230] hover:border-indigo-500/50 transition-colors group cursor-pointer"
            >
              <span className="text-xs font-mono font-bold text-white group-hover:text-indigo-400 transition-colors block">
                🛡️ Field-48 JWT Expiry Resilience Test
              </span>
              <span className="text-[11px] text-slate-400 font-sans block mt-1">
                Auto-fill 47 fields, forcibly expire the JWT, and verify zero data loss.
              </span>
            </Link>

            <button
              onClick={() => setIsExplainOpen(true)}
              className="w-full text-left p-3 rounded-lg bg-[#090A0F] border border-[#1E2230] hover:border-emerald-500/50 transition-colors group cursor-pointer"
            >
              <span className="text-xs font-mono font-bold text-white group-hover:text-emerald-400 transition-colors block">
                📐 SQL EXPLAIN ANALYZE Runner
              </span>
              <span className="text-[11px] text-slate-400 font-sans block mt-1">
                Execute live B-Tree index scan proof and DOM node count telemetry.
              </span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Drawer Modal */}
      <BenchmarkDrawer
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
      />
    </div>
  );
}
