/**
 * VectraBase AI — Vue 3 Telemetry Store (Pinia)
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTelemetryStore = defineStore('telemetry', () => {
  const lastLatencyMs = ref<number | null>(null);
  const lastCacheHit = ref(false);
  const rateLimitHit = ref(false);
  const totalQueries = ref(0);
  const cacheHits = ref(0);
  const latencyHistory = ref<number[]>([]);

  const cacheHitRatio = computed(() => {
    if (totalQueries.value === 0) return 0;
    return Math.round((cacheHits.value / totalQueries.value) * 100);
  });

  const avgLatency = computed(() => {
    if (latencyHistory.value.length === 0) return 0;
    const sum = latencyHistory.value.reduce((a, b) => a + b, 0);
    return Math.round(sum / latencyHistory.value.length);
  });

  function recordQuery(latencyMs: number, cacheHit: boolean) {
    lastLatencyMs.value = latencyMs;
    lastCacheHit.value = cacheHit;
    totalQueries.value += 1;
    if (cacheHit) {
      cacheHits.value += 1;
    }
    latencyHistory.value.push(latencyMs);
    if (latencyHistory.value.length > 50) {
      latencyHistory.value.shift();
    }
  }

  function recordRateLimit() {
    rateLimitHit.value = true;
    setTimeout(() => {
      rateLimitHit.value = false;
    }, 5000);
  }

  function reset() {
    lastLatencyMs.value = null;
    lastCacheHit.value = false;
    rateLimitHit.value = false;
    totalQueries.value = 0;
    cacheHits.value = 0;
    latencyHistory.value = [];
  }

  return {
    lastLatencyMs,
    lastCacheHit,
    rateLimitHit,
    totalQueries,
    cacheHits,
    cacheHitRatio,
    avgLatency,
    recordQuery,
    recordRateLimit,
    reset,
  };
});

