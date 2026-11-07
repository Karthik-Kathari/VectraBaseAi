'use client';

/**
 * VectraBase AI — Split-Screen Live Playground & Embed Generator
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

  const embedSnippet = `<div id="vectrabase-widget"></div>
<script src="https://vectrabase-ai.vercel.app/widget.js"><\/script>
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

  return (
    <div className="space-y-6">
      {/* Page Title & Copy Embed Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            Vue.js 3 Embed Widget Split-Screen Live Lab
            <Badge variant="cyan">Iframe Sandboxed</Badge>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Interact with the embeddable Vue 3 client assistant on the left while monitoring Next.js real-time pipeline telemetry on the right.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={copyEmbedSnippet}
          className="shadow-lg shadow-cyan-950 flex items-center gap-2"
        >
          <span>{copied ? '✓ Copied' : '</> Get Copy-Paste HTML Embed Code'}</span>
        </Button>
      </div>

      {/* GSAP Pipeline Map Live Observer */}
      <RAGPipelineVisualizer
        isActive={pipelineActive}
        cacheHit={cacheHitState}
      />

      {/* Split-Screen 2-Column Lab Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[620px]">
        {/* Left Column: Embeddable Vue.js 3 Widget (Port 5173 / iframe) */}
        <div className="flex flex-col h-[650px] rounded-2xl border border-[#1E2230] bg-[#090A0F] overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-[#11131C] border-b border-[#1E2230] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-white font-bold">Vue.js 3 Embed Assistant</span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              apps/embed-widget (:5173)
            </span>
          </div>

          <iframe
            src="http://localhost:5173"
            title="VectraBase AI Vue.js 3 Embed Widget"
            className="flex-1 w-full h-full border-none"
            onError={() => {
              console.log('Local dev widget iframe loading fallback');
            }}
          />
        </div>

        {/* Right Column: Next.js 15 Backend Telemetry Observer & Inspector */}
        <div className="flex flex-col h-[650px] space-y-4">
          {/* Live RAG Telemetry Packet Card */}
          <Card className="flex-1 overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live RAG Telemetry Packet</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => simulateWidgetQuery(false)}>
                  Trigger Query Miss
                </Button>
                <Button variant="emerald" size="sm" onClick={() => simulateWidgetQuery(true)}>
                  Trigger Cache Hit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1E2230]">
                  <span className="text-slate-500 block text-[10px]">CACHE STATUS</span>
                  <span className={`font-bold mt-1 block ${cacheHitState ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {cacheHitState ? 'HIT (0.9ms)' : 'MISS (310ms)'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1E2230]">
                  <span className="text-slate-500 block text-[10px]">HNSW SIMILARITY</span>
                  <span className="text-white font-bold mt-1 block">0.942 Cosine</span>
                </div>
                <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1E2230]">
                  <span className="text-slate-500 block text-[10px]">CITATIONS RETURNED</span>
                  <span className="text-indigo-400 font-bold mt-1 block">3 Source Chunks</span>
                </div>
              </div>

              {/* Sample Raw Citation Stream */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                  Retrieved pgvector Source Paragraph (Chunk #1):
                </span>
                <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1E2230] text-xs font-sans text-slate-300 leading-relaxed">
                  <span className="font-mono text-cyan-400 block mb-1 font-bold">
                    [Source 1: VectraBase_Architecture_Whitepaper.pdf — Page 1, Score: 0.94]
                  </span>
                  VectraBase AI is a multi-tenant RAG knowledge engine architected by Karthik Kathari. It pairs a Next.js 15 control plane with a lightweight embeddable Vue.js 3 widget, powered by a Node.js Express API gateway, Redis sliding-window rate limiting, and a Python FastAPI microservice using pgvector for hybrid cosine similarity and keyword retrieval.
                </div>
              </div>

              {/* Embed Code Snippet Preview */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                  Copy-Paste Embed Snippet for Customer Sites:
                </span>
                <pre className="p-3 rounded-lg bg-[#090A0F] border border-[#1E2230] text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                  {embedSnippet}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
