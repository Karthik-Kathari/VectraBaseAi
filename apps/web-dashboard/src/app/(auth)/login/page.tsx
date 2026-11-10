'use client';

/**
 * VectraBase AI — Authentication Portal (Login & Free Trial Registration)
 * Theme: Gray/White primary, Purple/Red accents, Yellow highlights, Neon glow
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { apiClient, setAccessToken } from '@/lib/axios';
import { toast } from 'sonner';
import { Zap, Sparkles, Lock, Mail, Building, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [slug, setSlug] = useState('');

  // Auto-generate slug from workspace name
  function handleWorkspaceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setWorkspaceName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (tab === 'register') {
        const generatedSlug = slug || 'workspace-' + Math.random().toString(36).substring(2, 8);
        const res = await apiClient.post('/api/auth/register', {
          tenantName: workspaceName || 'My Workspace',
          slug: generatedSlug,
          email,
          password,
        });

        if (res.data?.success) {
          setAccessToken(res.data.data.accessToken);
          toast.success('Account created! Your 14-day free trial (50 queries) is active.');
          router.push('/dashboard');
          return;
        }
      } else {
        const res = await apiClient.post('/api/auth/login', {
          email,
          password,
        });

        if (res.data?.success) {
          setAccessToken(res.data.data.accessToken);
          toast.success('Welcome back to VectraBase AI!');
          router.push('/dashboard');
          return;
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || (tab === 'register' ? 'Registration failed' : 'Invalid email or password');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDemoLogin() {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/auth/demo-session');
      if (res.data?.success) {
        setAccessToken(res.data.data.accessToken);
        toast.success('Authenticated as Demo Administrator!');
      }
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#090b10] transition-colors relative overflow-hidden">
      {/* Background neon ambient gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-500 flex items-center justify-center p-2 shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              VectraBase AI
            </span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {tab === 'register' ? 'Start Your Free Trial' : 'Sign in to Workspace'}
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {tab === 'register'
              ? 'Get 50 free RAG queries, 3 document uploads & full API access. No credit card required.'
              : 'Access your knowledge base, telemetry logs, and chat assistants.'}
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 backdrop-blur-sm">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-[#090b10] border border-slate-200 dark:border-slate-800 mb-6 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white dark:bg-[#1f2937] text-purple-700 dark:text-purple-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Free Trial Sign Up
            </button>
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white dark:bg-[#1f2937] text-purple-700 dark:text-purple-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Workspace Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="text"
                    required
                    placeholder="Acme AI Labs"
                    value={workspaceName}
                    onChange={handleWorkspaceChange}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  type="email"
                  required
                  placeholder="engineer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
              {tab === 'register' && (
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must be 8+ characters with uppercase, number & symbol.
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2 font-medium text-xs shadow-md shadow-purple-500/20"
            >
              {tab === 'register' ? 'Create Free Trial Account →' : 'Sign In to Workspace →'}
            </Button>
          </form>

          {/* Value Props Pill for Registration */}
          {tab === 'register' && (
            <div className="mt-5 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-purple-700 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Instant Free Trial Includes:</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-purple-500 flex-shrink-0" />
                <span>50 free RAG queries with Sub-2ms Redis cache</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-purple-500 flex-shrink-0" />
                <span>3 Document uploads with pgvector semantic indexing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-purple-500 flex-shrink-0" />
                <span>14 days of access with zero credit card required</span>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-[#111827] px-2 text-slate-400">
                Or recruiter / preview access
              </span>
            </div>
          </div>

          {/* Instant Demo Launcher */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDemoLogin}
            isLoading={isLoading}
            className="w-full text-xs text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            Launch Instant Demo Sandbox
          </Button>
        </div>

        {/* Terms footer */}
        <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
          By signing up, you agree to the{' '}
          <Link href="/" className="text-purple-600 dark:text-purple-400 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/" className="text-purple-600 dark:text-purple-400 hover:underline">
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  );
}

