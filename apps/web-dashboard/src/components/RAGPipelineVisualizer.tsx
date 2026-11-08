'use client';

/**
 * VectraBase AI — GSAP 5-Stage RAG Pipeline Visualizer
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

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
  stageTimes?: StageTimes;
}

export function RAGPipelineVisualizer({
  isActive = false,
  activeStage = 0,
  cacheHit = false,
  stageTimes = {
    widgetQueryMs: 2,
    nodeRedisMs: 1,
    fastApiEmbeddingMs: 45,
    postgresPgvectorMs: 82,
    sseStreamMs: 180,
    totalMs: 310,
  },
}: RAGPipelineVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pulseRef.current) return;

    const ctx = gsap.context(() => {
      if (isActive) {
        if (cacheHit) {
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
  }, [isActive, cacheHit, activeStage]);

  const stages = [
    { id: 1, label: '1. Vue Widget Query', icon: '💬', latency: `${stageTimes.widgetQueryMs ?? 2}ms` },
    {
      id: 2,
      label: '2. Node / Redis Lock & Cache',
      icon: cacheHit ? '⚡' : '🛡️',
      latency: cacheHit ? '0.9ms (HIT)' : `${stageTimes.nodeRedisMs ?? 1}ms`,
      highlight: cacheHit,
    },
    { id: 3, label: '3. FastAPI Embedding', icon: '🧠', latency: `${stageTimes.fastApiEmbeddingMs ?? 45}ms` },
    { id: 4, label: '4. pgvector HNSW Search', icon: '📐', latency: `${stageTimes.postgresPgvectorMs ?? 82}ms` },
    { id: 5, label: '5. Grounded SSE Stream', icon: '🌊', latency: `${stageTimes.sseStreamMs ?? 180}ms` },
  ];

  return (
    <div
      ref={containerRef}
      className="p-4 rounded-xl border border-slate-200 dark:border-[#1E2230] bg-white dark:bg-[#11131C] text-slate-800 dark:text-slate-200 relative overflow-hidden shadow-sm transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-cyan-400 animate-pulse"></span>
          <h4 className="text-xs font-sans font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Live 5-Stage RAG Pipeline Telemetry Map
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs font-sans">
          {cacheHit ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40 text-[11px] font-bold">
              ⚡ REDIS CACHE SHORT-CIRCUIT (0.9ms)
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Total End-to-End Latency:{' '}
              <strong className="text-indigo-600 dark:text-cyan-400 tabular-nums font-mono">{stageTimes.totalMs ?? 310}ms</strong>
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
          {/* Base Connection Track */}
          <line x1="80" y1="35" x2="800" y2="35" stroke="#cbd5e1" className="dark:stroke-[#1E2230]" strokeWidth="3" />

          {/* Active Highlight Line */}
          <line
            x1="80"
            y1="35"
            x2={cacheHit ? '260' : '800'}
            y2="35"
            stroke={cacheHit ? '#10B981' : '#6366F1'}
            strokeWidth="3"
            strokeDasharray="6 6"
            className="animate-pulse"
          />

          {/* GSAP Data Pulse Particle */}
          <circle
            ref={pulseRef}
            cx="80"
            cy="35"
            r="6"
            fill={cacheHit ? '#10B981' : '#6366F1'}
            filter="drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))"
            opacity="0"
          />

          {/* Nodes */}
          {stages.map((stage, idx) => {
            const cx = 80 + idx * 180;
            const isPassed = !cacheHit || stage.id <= 2;
            const isCurrentActive = activeStage === stage.id || (cacheHit && stage.id === 2);

            return (
              <g key={stage.id} transform={`translate(${cx}, 35)`}>
                <circle
                  r="18"
                  className="fill-slate-50 dark:fill-[#090A0F]"
                  stroke={
                    stage.highlight
                      ? '#10B981'
                      : isCurrentActive
                      ? '#6366F1'
                      : isPassed
                      ? '#94A3B8'
                      : '#E2E8F0'
                  }
                  strokeWidth="2"
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fontSize="12"
                  className="fill-slate-800 dark:fill-[#E2E8F0] select-none pointer-events-none"
                >
                  {stage.icon}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Labels underneath */}
        <div className="grid grid-cols-5 text-center mt-1 min-w-[700px]">
          {stages.map((stage) => (
            <div key={stage.id} className="px-1">
              <span className="block text-[11px] font-sans font-medium text-slate-700 dark:text-slate-300 truncate">
                {{ ...stage }.label}
              </span>
              <span
                className={`text-[10px] font-mono font-bold tabular-nums ${
                  stage.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-cyan-400'
                }`}
              >
                {{ ...stage }.latency}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

