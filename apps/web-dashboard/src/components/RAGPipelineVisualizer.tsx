'use client';

/**
 * VectraBase AI — GSAP 5-Stage RAG Pipeline Visualizer & Interactive Stage Inspector
 */

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { Badge } from '@/components/ui/Badge';

interface StageTimes {
  widgetQueryMs?: number;
  nodeRedisMs?: number;
  fastApiEmbeddingMs?: number;
  postgresPgvectorMs?: number;
  sseStreamMs?: number;
  totalMs?: number;
}

interface RAGPipelineVisualizerProps {
  isActive?: boolean;
  activeStage?: number; // 1 to 5
  cacheHit?: boolean;
  cacheHitMode?: boolean; // Prop alias for test compatibility
  stageTimes?: StageTimes;
}

export function RAGPipelineVisualizer({
  isActive = false,
  activeStage = 0,
  cacheHit = false,
  cacheHitMode,
  stageTimes = {
    widgetQueryMs: 2,
    nodeRedisMs: 1,
    fastApiEmbeddingMs: 45,
    postgresPgvectorMs: 82,
    sseStreamMs: 180,
    totalMs: 310,
  },
}: RAGPipelineVisualizerProps) {
  const isHit = cacheHitMode !== undefined ? cacheHitMode : cacheHit;
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const [selectedStage, setSelectedStage] = useState<number>(2);

  useEffect(() => {
    if (!containerRef.current || !pulseRef.current) return;

    const ctx = gsap.context(() => {
      if (isActive) {
        if (isHit) {
          // Short-circuit from Stage 1 to Stage 2 and rebound
          gsap.fromTo(
            pulseRef.current,
            { cx: 80, opacity: 1 },
            {
              cx: 260,
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out',
              repeat: -1,
              yoyo: true,
            }
          );
        } else {
          // Full 5-stage pulse
          gsap.fromTo(
            pulseRef.current,
            { cx: 80, opacity: 1 },
            {
              cx: 800,
              opacity: 1,
              duration: 1.2,
              ease: 'power1.inOut',
              repeat: -1,
            }
          );
        }
      } else {
        gsap.to(pulseRef.current, { opacity: 0, duration: 0.2 });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isActive, isHit, activeStage]);

  const stages = [
    {
      id: 1,
      label: '1. Query Vectorization',
      sublabel: 'Vue Widget Query',
      icon: '💬',
      latency: `${stageTimes.widgetQueryMs ?? 2}ms`,
      neonColor: '#a855f7',
      input: '{ query: "Explain pgvector latency?", tenantId: "00000000-0000-0000-0000-000000000001" }',
      output: 'Normalized UTF-8 query string, SHA-256 fingerprint: 0x8a9c...3f12',
      confidence: '100% Validated',
    },
    {
      id: 2,
      label: '2. Semantic Cache',
      sublabel: 'Node / Redis Lock & Cache',
      icon: isHit ? '⚡' : '🛡️',
      latency: isHit ? '0.9ms (HIT)' : `${stageTimes.nodeRedisMs ?? 1}ms`,
      highlight: isHit,
      neonColor: isHit ? '#10b981' : '#a855f7',
      input: 'Key: tenant:0001:query:hash:0x8a9c...3f12 (TTL: 60s)',
      output: isHit
        ? 'In-Memory Cache Hit: Resolved grounded answer directly from Redis RAM (<2ms)'
        : 'Cache Miss: Fallback scheduled to pgvector HNSW index seek',
      confidence: isHit ? '99.4% Cosine Match' : 'N/A (Cache Miss)',
    },
    {
      id: 3,
      label: '3. FastAPI Embedding',
      sublabel: 'Dense Vector Model',
      icon: '🧠',
      latency: `${stageTimes.fastApiEmbeddingMs ?? 45}ms`,
      neonColor: '#a855f7',
      input: 'Text tokens: [1024, 892, 114, 5849] (Dimensions: 1536)',
      output: 'Float32 dense vector array [0.0241, -0.0152, ..., 0.0894]',
      confidence: '98.8% Accuracy',
    },
    {
      id: 4,
      label: '4. pgvector HNSW Search',
      sublabel: 'PostgreSQL Keyset Seek',
      icon: '📐',
      latency: `${stageTimes.postgresPgvectorMs ?? 82}ms`,
      neonColor: '#a855f7',
      input: 'ORDER BY embedding <=> $vector LIMIT 5 (m=16, efConstruction=64)',
      output: 'Top 5 document chunks retrieved via B-Tree index scan (0 sequential buffers)',
      confidence: '94.2% Cosine Match',
    },
    {
      id: 5,
      label: '5. Rerank & SSE Stream',
      sublabel: 'Cross-Encoder Grounding',
      icon: '🌊',
      latency: `${stageTimes.sseStreamMs ?? 180}ms`,
      neonColor: '#f59e0b',
      input: '5 document chunk candidates + user prompt to Cross-Encoder',
      output: 'Top 3 grounded citations synthesized into streamed SSE token packets',
      confidence: '96.5% Verification',
    },
  ];

  const currentStageInfo = stages.find((s) => s.id === selectedStage) || stages[1];

  return (
    <div
      ref={containerRef}
      className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 relative overflow-hidden shadow-sm dark:shadow-[0_0_20px_rgba(168,85,247,0.12)] transition-colors"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse"></span>
          <h4 className="text-xs font-sans font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Live 5-Stage RAG Pipeline Telemetry Map
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-sans">
          {isHit ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40 text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              ⚡ REDIS CACHE SHORT-CIRCUIT (0.9ms)
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Total End-to-End Latency:{' '}
              <strong className="text-purple-600 dark:text-purple-400 tabular-nums font-mono">
                {stageTimes.totalMs ?? 310}ms
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* SVG Pipeline Map */}
      <div className="relative overflow-x-auto py-2">
        <svg
          viewBox="0 0 880 70"
          className="w-full min-w-[700px] h-16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#a855f7" floodOpacity="0.8" />
            </filter>
            <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.8" />
            </filter>
            <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Base Connection Track */}
          <line
            x1="80"
            y1="35"
            x2="800"
            y2="35"
            stroke="#e2e8f0"
            className="dark:stroke-slate-800"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Segment 1: Stage 1 -> 2 (Query Vectorization to Semantic Cache: Purple or Emerald) */}
          <line
            x1="80"
            y1="35"
            x2="260"
            y2="35"
            stroke={isHit ? '#10B981' : '#A855F7'}
            strokeWidth="3"
            strokeDasharray="6 6"
            className="animate-pulse"
            filter={isHit ? 'url(#glow-emerald)' : 'url(#glow-purple)'}
          />

          {/* Segment 2: Stage 2 -> 3 (Cache to FastAPI Embedding: Purple) */}
          <line
            x1="260"
            y1="35"
            x2="440"
            y2="35"
            stroke={isHit ? '#e2e8f0' : '#A855F7'}
            strokeWidth={isHit ? 2 : 3}
            strokeDasharray={isHit ? undefined : '6 6'}
            className={isHit ? 'dark:stroke-slate-800' : 'animate-pulse'}
            filter={isHit ? undefined : 'url(#glow-purple)'}
          />

          {/* Segment 3: Stage 3 -> 4 (FastAPI to pgvector HNSW: Purple) */}
          <line
            x1="440"
            y1="35"
            x2="620"
            y2="35"
            stroke={isHit ? '#e2e8f0' : '#A855F7'}
            strokeWidth={isHit ? 2 : 3}
            strokeDasharray={isHit ? undefined : '6 6'}
            className={isHit ? 'dark:stroke-slate-800' : 'animate-pulse'}
            filter={isHit ? undefined : 'url(#glow-purple)'}
          />

          {/* Segment 4: Stage 4 -> 5 (pgvector to Rerank & SSE: Yellow highlight) */}
          <line
            x1="620"
            y1="35"
            x2="800"
            y2="35"
            stroke={isHit ? '#e2e8f0' : '#F59E0B'}
            strokeWidth={isHit ? 2 : 3}
            strokeDasharray={isHit ? undefined : '6 6'}
            className={isHit ? 'dark:stroke-slate-800' : 'animate-pulse'}
            filter={isHit ? undefined : 'url(#glow-yellow)'}
          />

          {/* GSAP Data Pulse Particle */}
          <circle
            ref={pulseRef}
            cx="80"
            cy="35"
            r="6"
            fill={isHit ? '#10B981' : '#A855F7'}
            filter={isHit ? 'url(#glow-emerald)' : 'url(#glow-purple)'}
            opacity="0"
          />

          {/* Stage Node Markers */}
          {stages.map((stage, idx) => {
            const cx = 80 + idx * 180;
            const isPassed = !isHit || stage.id <= 2;
            const isCurrentActive = activeStage === stage.id || (isHit && stage.id === 2);
            const isSelected = selectedStage === stage.id;

            return (
              <g
                key={stage.id}
                transform={`translate(${cx}, 35)`}
                onClick={() => setSelectedStage(stage.id)}
                className="cursor-pointer"
              >
                <circle
                  r={isSelected ? 20 : 18}
                  className="fill-white dark:fill-[#111827] transition-all"
                  stroke={
                    stage.highlight
                      ? '#10B981'
                      : isSelected
                      ? stage.neonColor
                      : isCurrentActive
                      ? '#A855F7'
                      : isPassed
                      ? '#94A3B8'
                      : '#cbd5e1'
                  }
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isSelected ? (stage.id === 5 ? 'url(#glow-yellow)' : stage.highlight ? 'url(#glow-emerald)' : 'url(#glow-purple)') : undefined}
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fontSize="12"
                  className="fill-slate-800 dark:fill-slate-200 select-none pointer-events-none"
                >
                  {stage.icon}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Labels Underneath SVG Track */}
        <div className="grid grid-cols-5 text-center mt-2 min-w-[700px]">
          {stages.map((stage) => {
            const isSelected = selectedStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStage(stage.id)}
                className={`px-1 py-1 rounded-lg transition-all text-left flex flex-col items-center cursor-pointer ${
                  isSelected ? 'bg-slate-100 dark:bg-slate-800/80 shadow-xs' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span className="block text-[11px] font-sans font-semibold text-slate-800 dark:text-slate-200 truncate max-w-full">
                  {stage.label}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold tabular-nums mt-0.5 ${
                    stage.highlight
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : stage.id === 5
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {stage.latency}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Pipeline Inspector Pane */}
      <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Stage Inspector:
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {currentStageInfo.label} ({currentStageInfo.sublabel})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="yellow" className="text-[10px] font-mono">
              ⏱️ Latency: {currentStageInfo.latency}
            </Badge>
            <Badge
              variant={currentStageInfo.highlight ? 'emerald' : 'purple'}
              className="text-[10px] font-mono"
            >
              ✓ {currentStageInfo.confidence}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Input Payload / Parameters:
            </span>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all leading-relaxed">
              {currentStageInfo.input}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Output Transformation / Telemetry:
            </span>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all leading-relaxed">
              {currentStageInfo.output}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
