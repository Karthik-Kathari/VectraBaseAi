'use client';

/**
 * VectraBase AI — Global SaaS Footer
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

export function Footer() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'security' | null>(null);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090b10] text-slate-600 dark:text-slate-400 text-xs mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-500 flex items-center justify-center p-1 shadow-xs shadow-purple-500/20">
                <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white tracking-tight">VectraBase AI</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Enterprise-grade Multi-Tenant RAG Knowledge Engine &amp; Embeddable Vue 3 Assistant. Zero-hallucination grounded responses with sub-2ms caching.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href={"/pricing" as any} className="hover:text-purple-600 dark:text-purple-400 font-medium transition-colors">
                  Plans &amp; Pricing
                </Link>
              </li>
              <li>
                <Link href={"/login" as any} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  14-Day Free Trial
                </Link>
              </li>
              <li>
                <Link href="/rag-studio" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Knowledge Base &amp; Ingestion
                </Link>
              </li>
              <li>
                <Link href="/widget-playground" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Vue.js 3 Chat Playground
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Control Plane Analytics
                </Link>
              </li>
              <li>
                <Link href="/telemetry" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  1,000,000 Telemetry Explorer
                </Link>
              </li>
              <li>
                <Link href="/governance" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  50-Field AI Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Architecture</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="text-purple-600 dark:text-purple-400 font-mono">▪</span> Next.js 15 App Router &amp; Prerender
              </li>
              <li className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="text-purple-600 dark:text-purple-400 font-mono">▪</span> Neon Lakebase Postgres (pgvector 0.8.6)
              </li>
              <li className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="text-purple-600 dark:text-purple-400 font-mono">▪</span> Python FastAPI Async RAG Microservice
              </li>
              <li className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="text-purple-600 dark:text-purple-400 font-mono">▪</span> Redis Sub-2ms Semantic Cache
              </li>
              <li className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="text-purple-600 dark:text-purple-400 font-mono">▪</span> Dual-Token JWT Silent Refresh Queue
              </li>
            </ul>
          </div>

          {/* Resources & Creator */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Creator &amp; Code</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <span className="text-slate-400">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <span>Project Architecture</span>
                  <span className="text-slate-400">↗</span>
                </a>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Support: support@vectrabase.ai</span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">License: MIT</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 VectraBase AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('security')}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
            >
              Security Whitepaper
            </button>
          </div>
        </div>
      </div>

      {/* Modal Viewers for Policy, Terms, Security */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {activeModal === 'privacy' && <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                {activeModal === 'terms' && <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                {activeModal === 'security' && <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                  {activeModal === 'privacy' && 'VectraBase AI — Privacy Policy'}
                  {activeModal === 'terms' && 'VectraBase AI — Terms of Service'}
                  {activeModal === 'security' && 'VectraBase AI — Security & Compliance Whitepaper'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed font-sans">
              {activeModal === 'privacy' && (
                <>
                  <p>
                    <strong>1. Multi-Tenant Data Isolation:</strong> Every document uploaded to VectraBase AI is partitioned using dedicated tenant UUIDs at the database layer in Neon Lakebase PostgreSQL. Data is never co-mingled or accessible across tenant boundaries.
                  </p>
                  <p>
                    <strong>2. Zero Model Training:</strong> Your proprietary enterprise documentation, vectorized embeddings, and conversation histories are strictly utilized for runtime RAG context retrieval and are never used to train or fine-tune public foundation models.
                  </p>
                  <p>
                    <strong>3. Encryption Standards:</strong> All data is encrypted in transit using TLS 1.3 and at rest with AES-256 bit encryption across PostgreSQL block storage and Redis memory tiers.
                  </p>
                  <p>
                    <strong>4. Compliance:</strong> VectraBase AI adheres to GDPR, CCPA, and SOC 2 Type II controls. Customers retain full data ownership and can execute complete cryptographic data erasure upon request.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    <strong>1. Service Availability:</strong> VectraBase AI provides 99.95% uptime for the API Gateway and RAG retrieval pipelines, backed by automated multi-region failover and Neon serverless autoscaling.
                  </p>
                  <p>
                    <strong>2. API Quotas &amp; Rate Limits:</strong> Usage is governed by Redis-backed token bucket rate limiting (120 requests/minute per tenant for standard tiers, customizable for enterprise contracts).
                  </p>
                  <p>
                    <strong>3. Intellectual Property:</strong> Customers retain 100% intellectual property rights over all uploaded documents, ingested knowledge chunks, and generated assistant output streams.
                  </p>
                  <p>
                    <strong>4. Acceptable Use:</strong> Users agree not to submit malicious payloads, exploit prompt injection vulnerabilities, or bypass tenant isolation safeguards.
                  </p>
                </>
              )}

              {activeModal === 'security' && (
                <>
                  <p>
                    <strong>1. Vector Database Architecture:</strong> High-dimensional embeddings (1536-dim) are stored using PostgreSQL pgvector 0.8.6 with HNSW cosine similarity indexes. Row-Level Security (RLS) guarantees query isolation.
                  </p>
                  <p>
                    <strong>2. Sub-2ms Semantic Caching:</strong> Frequently asked queries are validated with normalized cosine similarity and served directly from encrypted Redis memory with sub-2 millisecond latencies, bypassing LLM exposure.
                  </p>
                  <p>
                    <strong>3. Dual-Token JWT Authentication:</strong> Short-lived access tokens (15 minutes) paired with cryptographic refresh tokens in an asynchronous silent queue guarantee zero data loss during automated token renewal.
                  </p>
                  <p>
                    <strong>4. Zero-Hallucination Guardrails:</strong> Context boundary filtering rejects out-of-domain prompts and injects verified source citation coordinates into every synthesized response.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-sm hover:shadow-neon-purple transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
