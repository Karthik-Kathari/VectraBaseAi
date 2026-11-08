'use client';

/**
 * VectraBase AI — Global SaaS Footer
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#1E2230] bg-[#090A0F] text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-1">
                <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-mono font-bold text-white tracking-tight">VectraBase AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enterprise-grade Multi-Tenant RAG Knowledge Engine & Embeddable Vue 3 Assistant. Zero-hallucination grounded responses with sub-2ms caching.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-emerald-400">All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/rag-studio" className="hover:text-cyan-400 transition-colors">
                  Knowledge Base & Ingestion
                </Link>
              </li>
              <li>
                <Link href="/widget-playground" className="hover:text-cyan-400 transition-colors">
                  Vue.js 3 Chat Playground
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Control Plane Analytics
                </Link>
              </li>
              <li>
                <Link href="/telemetry" className="hover:text-cyan-400 transition-colors">
                  1,000,000 Telemetry Explorer
                </Link>
              </li>
              <li>
                <Link href="/governance" className="hover:text-cyan-400 transition-colors">
                  50-Field AI Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Architecture */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">Architecture</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="text-cyan-400">▪</span> Next.js 15 App Router & Prerender
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="text-cyan-400">▪</span> Neon Lakebase Postgres (pgvector 0.8.6)
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="text-cyan-400">▪</span> Python FastAPI Async RAG Microservice
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="text-cyan-400">▪</span> Redis Sub-2ms Semantic Cache
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="text-cyan-400">▪</span> Dual-Token JWT Silent Refresh Queue
              </li>
            </ul>
          </div>

          {/* Resources & Creator */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">Creator & Code</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/Karthik-Kathari/VectraBaseAi.git"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <span className="text-slate-500">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Karthik-Kathari"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>Architect: Karthik Kathari</span>
                  <span className="text-slate-500">↗</span>
                </a>
              </li>
              <li>
                <span className="text-slate-500 block text-[11px]">Support: karthikmk.workspace@gmail.com</span>
              </li>
              <li>
                <span className="text-slate-500 block text-[11px]">License: MIT</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1E2230] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 VectraBase AI. Architected and engineered by Karthik Kathari. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Security Whitepaper</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

