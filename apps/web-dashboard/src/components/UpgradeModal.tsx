'use client';

/**
 * VectraBase AI — Upgrade Plan & Paywall Modal
 * Gray/White primary, Purple/Red accents, Yellow highlights, and Neon glows
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import { Check, Sparkles, Zap, Shield, Rocket, X } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'quota_exhausted' | 'manual' | 'trial_expired';
  onSuccess?: () => void;
}

export function UpgradeModal({ isOpen, onClose, reason = 'manual', onSuccess }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'ENTERPRISE'>('PRO');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleCheckout() {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/billing/checkout', {
        plan: selectedPlan,
        returnUrl: window.location.origin,
      });

      if (res.data?.success) {
        if (res.data.data.checkoutUrl) {
          toast.info('Redirecting to secure Stripe Checkout...');
          window.location.href = res.data.data.checkoutUrl;
          return;
        }

        // Instant Sandbox Upgrade completed
        toast.success(`Success! Your workspace is now upgraded to ${selectedPlan}!`);
        onSuccess?.();
        onClose();
        window.location.reload();
      } else {
        toast.error(res.data?.error?.message || 'Could not initiate checkout');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Checkout error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Subtle decorative glowing background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center sm:text-left">
          {reason === 'quota_exhausted' ? (
            <Badge variant="yellow" className="mb-2 inline-flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-500" /> Free Trial Limit Reached (50/50 Queries)
            </Badge>
          ) : reason === 'trial_expired' ? (
            <Badge variant="red" className="mb-2 inline-flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-rose-500" /> Free Trial Expired
            </Badge>
          ) : (
            <Badge variant="purple" className="mb-2 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-500" /> Unlock VectraBase AI Pro
            </Badge>
          )}

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {reason === 'quota_exhausted' || reason === 'trial_expired'
              ? 'Upgrade to continue querying without limits'
              : 'Choose the plan that powers your RAG application'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Gain unlimited queries, zero-latency caching, dedicated embeddings, and production SLAs.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Pro Plan Card */}
          <div
            onClick={() => setSelectedPlan('PRO')}
            className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer relative ${
              selectedPlan === 'PRO'
                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Developer Pro
              </span>
              <Badge variant="purple" className="text-[10px]">Most Popular</Badge>
            </div>
            <div className="flex items-baseline gap-1 my-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$19</span>
              <span className="text-xs text-slate-500">/ month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <span><strong>Unlimited</strong> RAG queries</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <span>Up to <strong>500 Documents</strong> & PDF indexing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <span>Sub-2ms Redis semantic cache</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <span>Embed widget customization</span>
              </li>
            </ul>
          </div>

          {/* Enterprise Plan Card */}
          <div
            onClick={() => setSelectedPlan('ENTERPRISE')}
            className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer relative ${
              selectedPlan === 'ENTERPRISE'
                ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Enterprise Scale
              </span>
              <Badge variant="red" className="text-[10px]">High Volume</Badge>
            </div>
            <div className="flex items-baseline gap-1 my-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$99</span>
              <span className="text-xs text-slate-500">/ month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span><strong>Unlimited Documents</strong> & storage</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>Dedicated pgvector Lakebase node</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>99.9% Uptime SLA & 24/7 Slack support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>Cancel anytime. Test cards and sandbox simulated checkouts supported.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCheckout}
              isLoading={isLoading}
              className="w-full sm:w-auto font-medium shadow-[0_0_12px_rgba(168,85,247,0.3)]"
            >
              Continue to Checkout →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

