'use client';

/**
 * VectraBase AI — Pricing & Subscription Plans
 * Theme: Gray/White primary, Purple/Red accents, Yellow highlights, Neon glow
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import { Check, Sparkles, Zap, Shield, Rocket, ArrowRight, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleSelectPlan(plan: 'FREE' | 'PRO' | 'ENTERPRISE') {
    if (plan === 'FREE') {
      router.push('/login' as any);
      return;
    }

    setLoadingPlan(plan);
    try {
      const res = await apiClient.post('/api/billing/checkout', {
        plan,
        returnUrl: window.location.origin,
      });

      if (res.data?.success) {
        if (res.data.data.checkoutUrl) {
          toast.info('Redirecting to Stripe Checkout...');
          window.location.href = res.data.data.checkoutUrl;
          return;
        }

        toast.success(`Success! Workspace upgraded to ${plan}!`);
        router.push('/dashboard');
      } else {
        toast.error(res.data?.error?.message || 'Checkout failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error initiating checkout. Please log in first.');
      router.push('/login' as any);
    } finally {
      setLoadingPlan(null);
    }
  }

  const faqs = [
    {
      q: 'How does the 14-day free trial work?',
      a: 'Every new workspace gets 50 free RAG queries and 3 document uploads for 14 days with zero credit card required. When your trial ends or quota is reached, you can easily upgrade to Pro.',
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes, absolutely. You can cancel at any time with a single click. Your Pro features will remain active until the end of your billing cycle.',
    },
    {
      q: 'What happens if I exceed the query limit on Pro?',
      a: 'The Pro plan includes generous unlimited queries for standard production use cases with burst protection.',
    },
    {
      q: 'Do you offer a sandbox or demo before signing up?',
      a: 'Yes! You can launch our Instant Demo Sandbox right from the navbar with pre-loaded vector documents to explore before signing up.',
    },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#090b10] transition-colors relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="purple" className="mb-3 inline-flex items-center gap-1.5 py-1 px-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Transparent B2B SaaS Pricing
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Start Free. Upgrade As You Scale.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Deploy production RAG pipelines, connect Lakebase pgvector databases, and embed Vue 3 chat widgets in minutes.
          </p>
        </div>

        {/* 3-Tier Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Tier 1: Free Trial */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> Free Trial
                </span>
                <Badge variant="yellow" className="text-[10px]">14 Days</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Perfect for evaluating VectraBase with your private documents.
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500">/ 14 days</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span><strong>50 RAG Queries</strong> included</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span><strong>3 Document Uploads</strong> (PDF/MD/TXT)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Sub-2ms Redis Semantic Cache</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Interactive Chat Widget Playground</span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => handleSelectPlan('FREE')}
              className="w-full mt-8 font-medium text-xs border-slate-300 dark:border-slate-700 hover:border-purple-400"
            >
              Start Free Trial →
            </Button>
          </div>

          {/* Tier 2: Developer Pro */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111827] border-2 border-purple-500 shadow-xl shadow-purple-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm">
                Most Popular
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Developer Pro
                </span>
                <Badge variant="purple" className="text-[10px]">Unlimited</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Full production RAG capabilities for growing applications.
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$19</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span><strong>Unlimited</strong> RAG Queries</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span>Up to <strong>500 Documents</strong> & automated chunking</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span>Custom Embed Widget branding & theme presets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span>1M Live Telemetry logs & latency analytics</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span>50-field AI Governance & PII guardrails</span>
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="md"
              isLoading={loadingPlan === 'PRO'}
              onClick={() => handleSelectPlan('PRO')}
              className="w-full mt-8 font-medium text-xs shadow-md shadow-purple-500/20"
            >
              Upgrade to Pro →
            </Button>
          </div>

          {/* Tier 3: Enterprise */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-600 dark:text-rose-400" /> Enterprise Scale
                </span>
                <Badge variant="red" className="text-[10px]">High Throughput</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Dedicated infrastructure, custom SLAs, and high concurrency.
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$99</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                  <span>Everything in Developer Pro</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                  <span><strong>Unlimited Documents</strong> & vector storage</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                  <span>Dedicated Lakebase compute branch</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                  <span>99.9% Uptime SLA & Dedicated Engineer</span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="md"
              isLoading={loadingPlan === 'ENTERPRISE'}
              onClick={() => handleSelectPlan('ENTERPRISE')}
              className="w-full mt-8 font-medium text-xs border-slate-300 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600"
            >
              Get Enterprise →
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white text-center mb-8 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800"
              >
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
