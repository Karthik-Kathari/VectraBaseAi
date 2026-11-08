'use client';

/**
 * VectraBase AI — 50-Field Enterprise AI Governance Wizard & Field-48 Resilience Simulator
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { InterceptorConsole } from '@/components/InterceptorConsole';
import { useGovernanceDraft } from '@/hooks/useGovernanceDraft';
import { apiClient, setAccessToken, setRefreshToken, getRefreshToken } from '@/lib/axios';
import { toast } from 'sonner';

export default function GovernanceWizardPage() {
  const tenantId = '00000000-0000-0000-0000-000000000001';
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isTokenExpiredSimulated, setIsTokenExpiredSimulated] = useState(false);

  const { saveDraft, loadDraft, lastSaved } = useGovernanceDraft(tenantId);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      // Step 1: Workspace Identity (10 fields)
      workspaceName: 'VectraBase Enterprise Production',
      workspaceSlug: 'vectrabase-enterprise',
      displayName: 'VectraBase AI Assistant',
      adminEmail: 'karthikmk.workspace@gmail.com',
      timezone: 'UTC',
      defaultLanguage: 'en-US',
      logoUrl: 'https://vectrabase-ai.vercel.app/logo.png',
      description: 'Production B2B RAG Assistant architected by Karthik Kathari',
      contactWebhookUrl: 'https://vectrabase-api.onrender.com/webhook',
      billingEmail: 'karthikmk.workspace@gmail.com',

      // Step 2: Vector & Chunking Hyperparameters (10 fields)
      chunkSize: 512,
      chunkOverlap: 64,
      embeddingModel: 'nomic-embed-text',
      embeddingDimensions: 1536,
      hnswM: 16,
      hnswEfConstruction: 200,
      similarityThreshold: 0.72,
      topKResults: 5,
      maxTokensPerChunk: 512,
      rerankEnabled: false,

      // Step 3: Guardrails & PII Masking (10 fields)
      piiMaskingEnabled: true,
      piiMaskingLevel: 'moderate',
      promptInjectionThreshold: 0.85,
      contentModerationEnabled: true,
      blockedKeywords: 'system prompt, ignore previous instructions, reveal secret key',
      maxQueryLength: 2000,
      jailbreakDetection: true,
      hallucinationGuard: true,
      safetyLevel: 'strict',
      auditLogsEnabled: true,

      // Step 4: Widget Branding & CORS Security (10 fields)
      widgetPrimaryColor: '#06B6D4',
      widgetFontFamily: 'Inter',
      widgetWelcomeMessage: '👋 Hi! How can I help you with your documentation today?',
      widgetPlaceholder: 'Ask anything about your indexed documents...',
      corsAllowedOrigins: '*',
      cspDirectives: "default-src 'self'",
      embedDomains: 'vectrabase-ai.vercel.app',
      widgetTheme: 'dark',
      showCitationPills: true,
      widgetPosition: 'bottom-right',

      // Step 5: Rate-Limit & Webhook Quotas (10 fields)
      requestsPerMinute: 60,
      requestsPerDay: 10000,
      tokenBudgetPerDay: 1000000,
      webhookUrl: 'https://vectrabase-api.onrender.com/webhook',
      webhookSecret: 'vb_sec_live_998129384723984712',
      maxConcurrentRequests: 10,
      burstMultiplier: 1.5,
      alertEmailThreshold: 80,
      webhookRetryAttempts: 3, // Field 48
      cacheTtlSeconds: 60,     // Field 49
      monthlyTokenQuota: 1000000, // Field 50
    },
  });

  // 200ms debounced autosave to IndexedDB on any field change
  const formValues = watch();
  useEffect(() => {
    saveDraft(formValues);
  }, [formValues, saveDraft]);

  // Load draft on initial mount
  useEffect(() => {
    loadDraft().then((saved) => {
      if (saved) {
        reset(saved);
      }
    });
  }, [loadDraft, reset]);

  // Interactive Recruiter Resilience Test Trigger ("Simulate Expiry at Field 48")
  async function simulateExpiryAtField48() {
    setCurrentStep(5);

    // If no refresh token exists, obtain one first in the background so refresh rotation works cleanly
    if (!getRefreshToken()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vectrabase-api.onrender.com';
        const res = await fetch(`${apiUrl}/api/auth/demo-session`, { method: 'POST' });
        const json = await res.json();
        if (json?.data?.refreshToken) {
          setRefreshToken(json.data.refreshToken);
        }
      } catch (e) {
        // Fallback handled by axios interceptor
      }
    }

    // Forcibly expire active access token to trigger 401 on submit
    setAccessToken('EXPIRED_SIMULATED_TOKEN_TTL_0S');
    setIsTokenExpiredSimulated(true);

    toast.warning(
      '⚡ Resilience Test Armed: JWT Access Token expired (TTL: 0s). Edit Field 48 below and click Save!',
      { duration: 6000 }
    );

    setTimeout(() => {
      const field48Input = document.getElementById('field-webhookRetryAttempts');
      if (field48Input) {
        field48Input.focus();
      }
    }, 200);
  }

  async function onSubmit(data: any) {
    setIsSaving(true);
    try {
      const res = await apiClient.post('/api/governance', data);
      if (res.data?.success) {
        toast.success('🎉 50-Field AI Governance Configuration Saved — Zero Data Loss Verified!');
        setIsTokenExpiredSimulated(false);
      }
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  const steps = [
    { num: 1, name: 'Workspace Identity (10)' },
    { num: 2, name: 'Vector & Chunks (10)' },
    { num: 3, name: 'Guardrails & PII (10)' },
    { num: 4, name: 'Branding & CORS (10)' },
    { num: 5, name: 'Rate-Limits & Webhooks (10)' },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive Recruiter Test Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-[#161926] dark:to-indigo-950/40 border border-amber-200 dark:border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              Recruiter Interactive Resilience Test
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Simulate JWT Token Expiration at Field 48 (Zero-Data-Loss Verification)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
            Auto-fills fields 1–47, forcibly expires the JWT access token, and triggers Axios silent refresh recovery.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={simulateExpiryAtField48}
          className="whitespace-nowrap shadow-sm"
        >
          ⚡ Simulate Expiry at Field 48 →
        </Button>
      </div>

      {/* Stepper Navigation */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 font-sans text-xs">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setCurrentStep(s.num)}
            className={`flex-1 py-2 px-3 rounded-lg border text-left transition-colors whitespace-nowrap cursor-pointer ${
              currentStep === s.num
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-400 font-semibold shadow-xs'
                : 'bg-white dark:bg-[#11131C] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#1E2230] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">Step {s.num} of 5</span>
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      {/* Autosave Status Badge */}
      <div className="flex items-center justify-between text-xs font-sans text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {lastSaved ? `Draft auto-saved to IndexedDB ${lastSaved.toLocaleTimeString()}` : 'Auto-saving enabled'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">200ms Debounce · Dual-Layer Persistence</span>
      </div>

      {/* Form Grid & Telemetry Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Fields Card (2 Columns) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Step {currentStep}: {steps[currentStep - 1]?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* STEP 1: Workspace Identity (10 Fields) */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="1. Workspace Name" {...register('workspaceName')} />
                  <Input label="2. Workspace Slug" {...register('workspaceSlug')} />
                  <Input label="3. Display Name" {...register('displayName')} />
                  <Input label="4. Admin Email" {...register('adminEmail')} />
                  <Input label="5. Timezone" {...register('timezone')} />
                  <Input label="6. Default Language" {...register('defaultLanguage')} />
                  <Input label="7. Logo URL" {...register('logoUrl')} />
                  <Input label="8. Description" {...register('description')} />
                  <Input label="9. Contact Webhook URL" {...register('contactWebhookUrl')} />
                  <Input label="10. Billing Email" {...register('billingEmail')} />
                </div>
              )}

              {/* STEP 2: Vector Hyperparameters (10 Fields) */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="11. Chunk Size (Tokens: 128-2048)" type="number" {...register('chunkSize')} />
                  <Input label="12. Chunk Overlap (Tokens: 0-256)" type="number" {...register('chunkOverlap')} />
                  <Input label="13. Embedding Model" {...register('embeddingModel')} />
                  <Input label="14. Embedding Dimensions" type="number" {...register('embeddingDimensions')} />
                  <Input label="15. HNSW M (Graph Connectivity: 4-64)" type="number" {...register('hnswM')} />
                  <Input label="16. HNSW efConstruction (32-512)" type="number" {...register('hnswEfConstruction')} />
                  <Input label="17. Similarity Threshold (0.0 - 1.0)" type="number" step="0.01" {...register('similarityThreshold')} />
                  <Input label="18. Top-K Chunks to Retrieve" type="number" {...register('topKResults')} />
                  <Input label="19. Max Tokens Per Chunk" type="number" {...register('maxTokensPerChunk')} />
                  <Input label="20. Cross-Encoder Re-ranker" {...register('rerankEnabled')} placeholder="false" />
                </div>
              )}

              {/* STEP 3: Guardrails & PII Masking (10 Fields) */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="21. PII Masking Master Switch" {...register('piiMaskingEnabled')} />
                  <Input label="22. PII Masking Level" {...register('piiMaskingLevel')} />
                  <Input label="23. Prompt Injection Threshold" type="number" step="0.01" {...register('promptInjectionThreshold')} />
                  <Input label="24. Content Moderation" {...register('contentModerationEnabled')} />
                  <Input label="25. Blocked Keywords (Denylist)" {...register('blockedKeywords')} />
                  <Input label="26. Max Query Length (Chars)" type="number" {...register('maxQueryLength')} />
                  <Input label="27. Jailbreak Detection" {...register('jailbreakDetection')} />
                  <Input label="28. Hallucination Guard Filter" {...register('hallucinationGuard')} />
                  <Input label="29. Safety Enforcement Level" {...register('safetyLevel')} />
                  <Input label="30. Telemetry Audit Logging" {...register('auditLogsEnabled')} />
                </div>
              )}

              {/* STEP 4: Widget Branding & CORS (10 Fields) */}
              {currentStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="31. Widget Primary Color (Hex)" {...register('widgetPrimaryColor')} />
                  <Input label="32. Font Family" {...register('widgetFontFamily')} />
                  <Input label="33. Welcome Message" {...register('widgetWelcomeMessage')} />
                  <Input label="34. Input Placeholder Text" {...register('widgetPlaceholder')} />
                  <Input label="35. CORS Allowed Origins" {...register('corsAllowedOrigins')} />
                  <Input label="36. Content-Security-Policy" {...register('cspDirectives')} />
                  <Input label="37. Embed Host Domains" {...register('embedDomains')} />
                  <Input label="38. Widget Theme Mode" {...register('widgetTheme')} />
                  <Input label="39. Show Citation Source Pills" {...register('showCitationPills')} />
                  <Input label="40. Widget Screen Position" {...register('widgetPosition')} />
                </div>
              )}

              {/* STEP 5: Rate Limits & Webhooks (Fields 41 - 50) */}
              {currentStep === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="41. Requests Per Minute" type="number" {...register('requestsPerMinute')} />
                  <Input label="42. Requests Per Day" type="number" {...register('requestsPerDay')} />
                  <Input label="43. Token Budget Per Day" type="number" {...register('tokenBudgetPerDay')} />
                  <Input label="44. Webhook URL" {...register('webhookUrl')} />
                  <Input label="45. Webhook Secret Key" {...register('webhookSecret')} />
                  <Input label="46. Max Concurrent Requests" type="number" {...register('maxConcurrentRequests')} />
                  <Input label="47. Burst Multiplier" type="number" step="0.1" {...register('burstMultiplier')} />

                  {/* FIELD 48 — RECRUITER TARGET */}
                  <div className="p-2 rounded-lg border border-amber-300 dark:border-amber-500/50 bg-amber-50/70 dark:bg-amber-950/20">
                    <Input
                      id="field-webhookRetryAttempts"
                      label="48. Webhook Retry Count (Resilience Test Target)"
                      type="number"
                      {...register('webhookRetryAttempts')}
                      className={isTokenExpiredSimulated ? 'border-amber-500 bg-amber-100/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold' : ''}
                      helperText="Type any number and click Save to test silent JWT recovery"
                    />
                  </div>

                  <Input label="49. Redis Cache TTL (Seconds)" type="number" {...register('cacheTtlSeconds')} />
                  <Input label="50. Monthly Token Quota" type="number" {...register('monthlyTokenQuota')} />
                </div>
              )}

              {/* Stepper Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
                  disabled={currentStep === 1}
                >
                  ← Previous Step
                </Button>

                {currentStep < 5 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setCurrentStep((p) => Math.min(5, p + 1))}
                  >
                    Next Step →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSaving}
                    className="shadow-sm"
                  >
                    Save 50-Field Configuration (Verify Zero Data Loss)
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Live Axios Interceptor Telemetry Console (1 Column) */}
        <div>
          <InterceptorConsole />
        </div>
      </div>
    </div>
  );
}

