'use client';

/**
 * VectraBase AI — SaaS Control Plane Overview Page
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
    { title: 'Knowledge Chunks', value: '1,000,003', change: 'Indexed in pgvector', icon: '📚', highlight: 'text-purple-600 dark:text-purple-400' },
    { title: 'Instant Cache Hit Rate', value: '34.8%', change: '<2ms verified latency', icon: '⚡', highlight: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Average Response Time', value: '11.8ms', change: 'High-speed index seek', icon: '⏱️', highlight: 'text-yellow-600 dark:text-yellow-400' },
    { title: 'Tokens Saved', value: '412,850', change: '100% compute preserved', icon: '🪙', highlight: 'text-red-600 dark:text-red-400' },
  ];

  const recentQueries = [
    { text: 'Explain how VectraBase AI achieves sub-2ms latency?', latency: 0.9, cacheHit: true, score: 0.95, time: 'Just now' },
    { text: 'What is the HNSW vector index parameter configuration in pgvector?', latency: 312, cacheHit: false, score: 0.92, time: '2m ago' },
    { text: 'How does the zero-data-loss JWT refresh interceptor preserve state?', latency: 285, cacheHit: false, score: 0.89, time: '5m ago' },
    { text: 'Explain the sliding-window rate limiter Lua script in Redis', latency: 0.9, cacheHit: true, score: 0.94, time: '8m ago' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-red-500 to-yellow-500 opacity-80" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              All Microservices Active &amp; Healthy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Workspace Overview &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Monitor real-time knowledge ingestion, semantic cache performance, and AI chat queries across your multi-tenant workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/rag-studio">
            <Button variant="primary" size="sm">
              + Add Content
            </Button>
          </Link>
          <Link href="/widget-playground">
            <Button variant="outline" size="sm">
              💬 Test Chat
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setIsExplainOpen(true)}>
            SQL EXPLAIN
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="p-5 hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.12)] transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>{card.title}</span>
              <span className="text-base">{card.icon}</span>
            </div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${card.highlight}`}>
              {card.value}
            </div>
            <div className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-1">
              {card.change}
            </div>
          </Card>
        ))}
      </div>

      {/* Real-Time Processing Pipeline Telemetry Visualizer */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Query &amp; Ingestion Pipeline</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Observe end-to-end telemetry from user query to cached pgvector vector output.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerLivePipelinePulse(false)}
              className="text-xs"
            >
              Simulate Full Pipeline
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={() => triggerLivePipelinePulse(true)}
              className="text-xs"
            >
              Simulate Cache Hit (&lt;2ms)
            </Button>
          </div>
        </div>

        <RAGPipelineVisualizer
          isActive={simulatedPulse}
          cacheHit={cacheHitMode}
        />
      </div>

      {/* Two-Column Grid: Recent Queries + Quickstart Sandboxes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Queries (2 Cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base text-slate-900 dark:text-white">Recent Assistant Inquiries</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live query streaming and citation verification logs</p>
            </div>
            <Link href="/telemetry" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              View All Logs →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentQueries.map((q, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{q.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {q.cacheHit ? (
                        <Badge variant="emerald">Instant Cache Hit (0.9ms)</Badge>
                      ) : (
                        <Badge variant="purple">Vector Retrieval ({q.latency}ms)</Badge>
                      )}
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Match Score: {(q.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
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
            <CardTitle className="text-base text-slate-900 dark:text-white">Interactive Labs</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Explore platform capabilities</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/widget-playground"
              className="block p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)] transition-all group cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors block">
                💬 Vue.js 3 Chat Playground
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-sans block mt-1 leading-relaxed">
                Interact with the embed widget while monitoring real-time response citations.
              </span>
            </Link>

            <Link
              href="/governance"
              className="block p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-500/50 hover:shadow-[0_0_12px_rgba(244,63,94,0.15)] transition-all group cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors block">
                🛡️ AI Governance &amp; Security
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-sans block mt-1 leading-relaxed">
                Configure safety guardrails, prompt injection filters, and test JWT token recovery.
              </span>
            </Link>

            <button
              onClick={() => setIsExplainOpen(true)}
              className="w-full text-left p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-yellow-400 dark:hover:border-yellow-500/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all group cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors block">
                📐 SQL EXPLAIN Benchmark
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-sans block mt-1 leading-relaxed">
                Run live B-Tree index scan proofs and DOM node count telemetry.
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
