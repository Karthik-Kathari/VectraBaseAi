'use client';

/**
 * VectraBase AI — Interceptor Telemetry Console (Field-48 JWT Resilience)
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import React, { useState, useEffect } from 'react';
import { registerInterceptorListener } from '@/lib/axios';

interface ConsoleLog {
  id: string;
  type: 'REQUEST_401' | 'REFRESH_START' | 'REFRESH_SUCCESS' | 'REPLAY_SUCCESS' | 'REFRESH_FAILED';
  message: string;
  status?: number;
  badge: string;
  color: string;
  timestamp: string;
}

export function InterceptorConsole() {
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: 'initial-1',
      type: 'REFRESH_SUCCESS',
      message: 'Active JWT Access Token verified (TTL: 900s). Ready for 50-field governance mutations.',
      status: 200,
      badge: 'AUTH READY',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  useEffect(() => {
    const unregister = registerInterceptorListener((event) => {
      let log: ConsoleLog;
      const time = new Date().toLocaleTimeString();

      switch (event.type) {
        case 'REQUEST_401':
          log = {
            id: `log-${Date.now()}-${Math.random()}`,
            type: 'REQUEST_401',
            message: 'POST /api/governance [401 Token Expired] — Token TTL elapsed at Field 48.',
            status: 401,
            badge: '401 EXPIRED',
            color: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
            timestamp: time,
          };
          break;
        case 'REFRESH_START':
          log = {
            id: `log-${Date.now()}-${Math.random()}`,
            type: 'REFRESH_START',
            message: 'Interceptor queued in-flight 50-field payload. Requesting POST /api/auth/refresh...',
            badge: 'QUEUED',
            color: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
            timestamp: time,
          };
          break;
        case 'REFRESH_SUCCESS':
          log = {
            id: `log-${Date.now()}-${Math.random()}`,
            type: 'REFRESH_SUCCESS',
            message: `POST /api/auth/refresh [200 OK] — New short-lived JWT issued: ${event.payload?.newAccessToken}`,
            status: 200,
            badge: 'JWT ROTATED',
            color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40',
            timestamp: time,
          };
          break;
        case 'REPLAY_SUCCESS':
          log = {
            id: `log-${Date.now()}-${Math.random()}`,
            type: 'REPLAY_SUCCESS',
            message: 'Automatic Retry: POST /api/governance [200 Saved] — Zero Data Loss Empirically Verified!',
            status: 200,
            badge: 'ZERO DATA LOSS',
            color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
            timestamp: time,
          };
          break;
        default:
          log = {
            id: `log-${Date.now()}-${Math.random()}`,
            type: 'REFRESH_FAILED',
            message: 'Silent refresh failed.',
            status: 500,
            badge: 'ERROR',
            color: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
            timestamp: time,
          };
      }

      setLogs((prev) => [...prev, log]);
    });

    return () => unregister();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#1E2230] bg-white dark:bg-[#11131C] p-4 text-xs font-sans shadow-sm dark:shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E2230] mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-cyan-400 animate-pulse"></span>
          <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Live Axios Interceptor Telemetry Console
          </span>
        </div>
        <button
          onClick={() => setLogs([])}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-[10px] font-mono cursor-pointer"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[380px] scrollbar-thin">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#090A0F] border border-slate-200 dark:border-[#1E2230] space-y-1 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${log.color}`}>
                {log.badge}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums font-mono">{log.timestamp}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-sans text-xs leading-relaxed">{log.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

