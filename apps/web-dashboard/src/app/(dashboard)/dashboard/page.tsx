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
    { title: 'Knowledge Chunks', value: '1,000,003', change: 'Indexed in pgvector', icon: '📚', highlight: 'text-cyan-400' },
    { title: 'Instant Cache Hit Rate', value: '34.8%', change: '<2ms verified latency', icon: '⚡', highlight: 'text-emerald-400' },
    { title: 'Average Response Time', value: '11.8ms', change: 'High-speed index seek', icon: '⏱️', highlight: 'text-indigo-400' },
    { title: 'Tokens Saved', value: '412,850', change: '100% compute preserved', icon: '🪙', highlight: 'text-amber-400' },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#11131C] via-[#141724] to-[#11131C] border border-[#1E2230] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              All Microservices Active &amp; Healthy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Workspace Overview &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Monitor real-time knowledge ingestion, semantic cache performance, and AI chat queries across your multi-tenant workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/rag-studio">
            <Button variant="primary" size="sm" className="shadow-lg shadow-cyan-950">
              + Add Content
            </Button>
          </Link>
          <Link href="/widget-playground">
            <Button variant="secondary" size="sm">
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
          <Card key={card.title} className="p-5 bg-[#11131C] border-[#1E2230] hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>{card.title}</span>
              <span className="text-base">{card.icon}</span>
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

      {/* Real-Time Processing Pipeline Telemetry Visualizer */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-sm font-bold font-mono text-white">Live Query &amp; Ingestion Pipeline</h2>
            <p className="text-xs text-slate-400">Observe end-to-end telemetry from user query to cached pgvector vector output.</p>
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
        <Card className="lg:col-span-2 bg-[#11131C] border-[#1E2230]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base text-white">Recent Assistant Inquiries</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Live query streaming and citation verification logs</p>
            </div>
            <Link href="/telemetry" className="text-xs font-mono text-cyan-400 hover:text-cyan-300">
              View All Logs →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#1E2230]">
              {recentQueries.map((q, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-white truncate">{q.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {q.cacheHit ? (
                        <Badge variant="emerald">Instant Cache Hit (0.9ms)</Badge>
                      ) : (
                        <Badge variant="cyan">Vector Retrieval ({q.latency}ms)</Badge>
                      )}
                      <span className="text-[11px] font-mono text-slate-500">
                        Match Score: {(q.score * 100).toFixed(0)}%
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
        <Card className="bg-[#11131C] border-[#1E2230]">
          <CardHeader>
            <CardTitle className="text-base text-white">Interactive Labs</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Explore platform capabilities</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/widget-playground"
              className="block p-3.5 rounded-xl bg-[#090A0F] border border-[#1E2230] hover:border-cyan-500/50 transition-colors group cursor-pointer"
            >
              <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 transition-colors block">
                💬 Vue.js 3 Chat Playground
              </span>
              <span className="text-xs text-slate-400 font-sans block mt-1 leading-relaxed">
                Interact with the embed widget while monitoring real-time response citations.
              </span>
            </Link>

            <Link
              href="/governance"
              className="block p-3.5 rounded-xl bg-[#090A0F] border border-[#1E2230] hover:border-indigo-500/50 transition-colors group cursor-pointer"
            >
              <span className="text-xs font-mono font-bold text-white group-hover:text-indigo-400 transition-colors block">
                🛡️ AI Governance &amp; Security
              </span>
              <span className="text-xs text-slate-400 font-sans block mt-1 leading-relaxed">
                Configure safety guardrails, prompt injection filters, and test JWT token recovery.
              </span>
            </Link>

            <button
              onClick={() => setIsExplainOpen(true)}
              className="w-full text-left p-3.5 rounded-xl bg-[#090A0F] border border-[#1E2230] hover:border-emerald-500/50 transition-colors group cursor-pointer"
            >
              <span className="text-xs font-mono font-bold text-white group-hover:text-emerald-400 transition-colors block">
                📐 SQL EXPLAIN Benchmark
              </span>
              <span className="text-xs text-slate-400 font-sans block mt-1 leading-relaxed">
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
