'use client';

/**
 * VectraBase AI — Free Trial Status Banner & Quota Counter
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/axios';
import { UpgradeModal } from './UpgradeModal';
import { Sparkles, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BillingStatusData {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus: string;
  isTrialActive: boolean;
  isExpired: boolean;
  isQuotaExceeded: boolean;
  trial: {
    endsAt: string | null;
    daysRemaining: number;
    queriesUsed: number;
    queriesLimit: number;
    queriesRemaining: number;
    docsUsed: number;
    docsLimit: number;
    docsRemaining: number;
  };
}

export function TrialStatusBanner() {
  const [data, setData] = useState<BillingStatusData | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [modalReason, setModalReason] = useState<'manual' | 'quota_exhausted' | 'trial_expired'>('manual');

  async function fetchBillingStatus() {
    try {
      const res = await apiClient.get('/api/billing/status');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch {
      // Default fallback trial view
      setData({
        plan: 'FREE',
        subscriptionStatus: 'TRIALING',
        isTrialActive: true,
        isExpired: false,
        isQuotaExceeded: false,
        trial: {
          endsAt: null,
          daysRemaining: 14,
          queriesUsed: 0,
          queriesLimit: 50,
          queriesRemaining: 50,
          docsUsed: 0,
          docsLimit: 3,
          docsRemaining: 3,
        },
      });
    }
  }

  useEffect(() => {
    fetchBillingStatus();

    // Listen to query events to refresh trial count live
    const handleQuerySuccess = () => fetchBillingStatus();
    const handleQuotaBlocked = () => {
      setModalReason('quota_exhausted');
      setIsUpgradeOpen(true);
      fetchBillingStatus();
    };

    window.addEventListener('vectrabase:query-completed', handleQuerySuccess);
    window.addEventListener('vectrabase:trial-blocked', handleQuotaBlocked);

    return () => {
      window.removeEventListener('vectrabase:query-completed', handleQuerySuccess);
      window.removeEventListener('vectrabase:trial-blocked', handleQuotaBlocked);
    };
  }, []);

  if (!data) return null;

  const isPro = data.plan === 'PRO' || data.plan === 'ENTERPRISE';

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {isPro ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{data.plan} Tier</span>
            <span className="text-[10px] text-slate-400">|</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Unlimited Queries</span>
          </div>
        ) : data.isQuotaExceeded || data.isExpired ? (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">Trial Limit Reached</span>
            <button
              onClick={() => {
                setModalReason(data.isExpired ? 'trial_expired' : 'quota_exhausted');
                setIsUpgradeOpen(true);
              }}
              className="ml-1 text-[11px] text-purple-600 dark:text-purple-400 underline font-medium hover:text-purple-700"
            >
              Upgrade Now →
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <Zap className="w-3 h-3 text-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              <span className="text-slate-600 dark:text-slate-400">Trial:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {data.trial.queriesRemaining}
              </span>
              <span className="text-slate-400 text-[10px]">/ {data.trial.queriesLimit} queries left</span>
              {data.trial.daysRemaining > 0 && (
                <span className="hidden md:inline text-[10px] text-slate-400">
                  ({data.trial.daysRemaining}d left)
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setModalReason('manual');
                setIsUpgradeOpen(true);
              }}
              className="py-1 px-2.5 text-[11px] font-medium border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 shadow-xs"
            >
              <Sparkles className="w-3 h-3 mr-1 text-purple-600 dark:text-purple-400" />
              Upgrade to Pro
            </Button>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        reason={modalReason}
        onSuccess={fetchBillingStatus}
      />
    </>
  );
}

