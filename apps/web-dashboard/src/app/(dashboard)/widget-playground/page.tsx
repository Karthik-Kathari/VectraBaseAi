'use client';

/**
 * VectraBase AI — Interactive Assistant Playground & Embed Generator
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RAGPipelineVisualizer } from '@/components/RAGPipelineVisualizer';
import { toast } from 'sonner';

export default function WidgetPlaygroundPage() {
  const [copied, setCopied] = useState(false);
  const [pipelineActive, setPipelineActive] = useState(false);
  const [cacheHitState, setCacheHitState] = useState(false);
  const [testQuery, setTestQuery] = useState('Explain how VectraBase AI achieves sub-2ms latency?');
  const [isQuerying, setIsQuerying] = useState(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const [answerOutput, setAnswerOutput] = useState<string | null>(
    'VectraBase AI utilizes an aggressive Redis semantic cache that checks incoming query hashes before dispatching to the LLM. Cache hits are resolved in <2ms directly from in-memory key-value stores.'
  );

  const embedSnippet = `<link rel="stylesheet" href="https://vectrabaseai.vercel.app/widget.css">
<div id="vectrabase-widget"></div>
<script src="https://vectrabaseai.vercel.app/widget.js"><\/script>
<script>
  VectraBaseWidget.init({
    tenantId: '00000000-0000-0000-0000-000000000001',
    apiUrl: 'https://vectrabase-api.onrender.com',
    theme: 'dark',
    position: 'bottom-right'
  });
<\/script>`;

  async function copyEmbedSnippet() {
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    toast.success('Embed HTML snippet copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  }

  function simulateWidgetQuery(hit: boolean) {
    setCacheHitState(hit);
    setPipelineActive(true);
    setTimeout(() => {
      setPipelineActive(false);
    }, 2200);
  }

  async function runLiveQuery(promptText: string, isHit = false) {
    setTestQuery(promptText);
    setCacheHitState(isHit);
    setPipelineActive(true);
    setIsQuerying(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vectrabase-api.onrender.com';
      const res = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: promptText,
          tenantId: '00000000-0000-0000-0000-000000000001',
        }),
      });
      const data = await res.json();
      if (data?.data?.answer) {
        setAnswerOutput(data.data.answer);
        if (data.data.cacheHit) setCacheHitState(true);
      }
    } catch {
      // Fallback response for playground
      if (isHit) {
        setAnswerOutput('VectraBase AI achieves sub-2ms latency by caching normalized semantic query hashes in Redis with a 60s TTL.');
      } else {
        setAnswerOutput('The pgvector HNSW index uses m=16, efConstruction=64, and cosine distance to perform sub-15ms vector similarity queries over 1,000,000 document chunks.');
      }
    } finally {
      setIsQuerying(false);
      setTimeout(() => setPipelineActive(false), 2000);
    }
  }

  const iframeHtml = `<!DOCTYPE html>
<html lang="en" style="height: 100%; margin: 0; padding: 0;">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/widget.css">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      background: #090A0F;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #vectrabase-widget {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  </style>
</head>
<body>
  <div id="vectrabase-widget"></div>
  <script src="/widget.js"><\/script>
  <script>
    (function() {
      function start() {
        var w = window.VectraBaseWidget;
        if (!w) return;
        var initFn = typeof w.init === 'function' ? w.init : (w.default && typeof w.default.init === 'function' ? w.default.init : null);
        if (initFn) {
          initFn({
            tenantId: '00000000-0000-0000-0000-000000000001',
            apiUrl: 'https://vectrabase-api.onrender.com'
          });
        }
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
      } else {
        start();
      }
    })();
  <\/script>
</body>
</html>`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">Interactive Lab</Badge>
            <span className="text-xs text-slate-500 font-mono">Vue.js 3 + GSAP Physics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Chat Assistant Playground &amp; Embed Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Test your assistant with real queries on the left while monitoring latency, similarity scores, and grounded citations on the right.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={copyEmbedSnippet}
          className="shadow-lg shadow-cyan-950 flex items-center gap-2 font-semibold text-xs tracking-tight whitespace-nowrap self-start md:self-auto"
        >
          <span>{copied ? '✓ Copied to Clipboard!' : '</> Copy HTML Embed Code'}</span>
        </Button>
      </div>

      {/* GSAP Pipeline Map Live Observer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Query Execution Telemetry:
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => simulateWidgetQuery(false)} className="text-xs">
              Simulate Cache Miss
            </Button>
            <Button variant="emerald" size="sm" onClick={() => simulateWidgetQuery(true)} className="text-xs">
              Simulate Cache Hit (&lt;2ms)
            </Button>
          </div>
        </div>

        <RAGPipelineVisualizer
          isActive={pipelineActive}
          cacheHit={cacheHitState}
        />
      </div>

      {/* Split-Screen 2-Column Lab Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[640px]">
        {/* Left Column: Embeddable Vue.js 3 Widget (Customer Website Preview) */}
        <div className="flex flex-col h-[650px] rounded-2xl border border-[#1E2230] bg-[#090A0F] overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-[#11131C] border-b border-[#1E2230] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white font-bold">Embedded Customer Website Mockup</span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800">
              Interactive Vue 3 Assistant
            </span>
          </div>

          <iframe
            src="/widget-frame.html"
            title="VectraBase AI Vue.js 3 Embed Widget Mockup"
            className="flex-1 w-full h-full border-none"
          />
        </div>

        {/* Right Column: Query Testing & Telemetry Console */}
        <div className="flex flex-col h-[650px] space-y-6">
          <Card className="flex-1 flex flex-col bg-[#11131C] border-[#1E2230] overflow-y-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Live Query Inspector</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Test predefined questions or observe telemetry packets</p>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              {/* Preset Prompts */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                  Sample Inquiries:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => runLiveQuery('Explain how VectraBase AI achieves sub-2ms latency?', true)}
                    className="text-left p-2.5 rounded-lg bg-[#090A0F] border border-[#1E2230] hover:border-cyan-500/50 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between"
                  >
                    <span>1. "How does VectraBase achieve sub-2ms latency?"</span>
                    <Badge variant="emerald" className="text-[10px]">Instant Hit</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => runLiveQuery('What is the HNSW vector configuration in pgvector?', false)}
                    className="text-left p-2.5 rounded-lg bg-[#090A0F] border border-[#1E2230] hover:border-indigo-500/50 text-xs font-mono text-slate-300 hover:text-indigo-300 transition-colors flex items-center justify-between"
                  >
                    <span>2. "What is the HNSW vector configuration in pgvector?"</span>
                    <Badge variant="cyan" className="text-[10px]">Vector Search</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => runLiveQuery('How does the zero-data-loss JWT refresh work?', false)}
                    className="text-left p-2.5 rounded-lg bg-[#090A0F] border border-[#1E2230] hover:border-amber-500/50 text-xs font-mono text-slate-300 hover:text-amber-300 transition-colors flex items-center justify-between"
                  >
                    <span>3. "How does the zero-data-loss JWT refresh work?"</span>
                    <Badge variant="cyan" className="text-[10px]">Resilience</Badge>
                  </button>
                </div>
              </div>

              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1E2230]">
                  <span className="text-slate-500 block text-[10px]">CACHE STATUS</span>
                  <span className={`font-bold mt-1 block ${cacheHitState ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {cacheHitState ? 'HIT (0.9ms)' : 'MISS (310ms)'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1E2230]">
                  <span className="text-slate-500 block text-[10px]">COSINE MATCH</span>
                  <span className="text-white font-bold mt-1 block">0.942 HNSW</span>
                </div>
                <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1E2230]">
                  <span className="text-slate-500 block text-[10px]">CITATIONS</span>
                  <span className="text-indigo-400 font-bold mt-1 block">3 Passages</span>
                </div>
              </div>

              {/* Answer & Grounded Citations Output */}
              <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1E2230] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Synthesized Grounded Response:
                  </span>
                  {isQuerying && <span className="text-xs font-mono text-cyan-400 animate-pulse">Streaming...</span>}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {answerOutput}
                </p>
                <div className="pt-2 border-t border-[#1E2230] flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">Cited Source:</span>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/60">
                    [Source 1: VectraBase_Architecture_Whitepaper.pdf · Page 1]
                  </span>
                </div>
              </div>

              {/* Embed Code Snippet Copy Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Production HTML Snippet:
                  </span>
                  <button
                    onClick={copyEmbedSnippet}
                    className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
                  >
                    {copied ? '✓ Copied' : 'Copy Code'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#090A0F] border border-[#1E2230] text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                  {embedSnippet}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Chat Bubble Launcher in Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isFloatingOpen && (
          <div className="mb-4 w-96 h-[540px] rounded-2xl border border-[#1E2230] bg-[#090A0F] shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="p-3 bg-[#11131C] border-b border-[#1E2230] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-1">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-xs font-mono font-bold text-white">VectraBase AI Assistant</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFloatingOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                title="Close chat widget"
              >
                ✕
              </button>
            </div>
            <iframe
              src="/widget-frame.html"
              title="Floating AI Assistant"
              className="flex-1 w-full h-full border-none"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsFloatingOpen(!isFloatingOpen)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-xl shadow-cyan-950/80 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Click to toggle AI Assistant"
        >
          <span className="text-base group-hover:rotate-12 transition-transform">💬</span>
          <span>{isFloatingOpen ? 'Close Chat' : 'Test AI Chat'}</span>
          {!isFloatingOpen && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          )}
        </button>
      </div>
    </div>
  );
}
