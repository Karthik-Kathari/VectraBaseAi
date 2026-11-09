<script setup lang="ts">
/**
 * VectraBase AI — Latency & Cache Hit Badge
 */

defineProps<{
  latencyMs?: number;
  cacheHit?: boolean;
}>();
</script>

<template>
  <div class="inline-flex items-center gap-1.5 text-xs font-mono">
    <!-- Redis Cache Hit (<2ms) -->
    <span
      v-if="cacheHit"
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium"
      title="Served from Redis Semantic Query Cache with zero LLM token cost"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      REDIS CACHE HIT ({{ latencyMs ?? 0.9 }}ms)
    </span>

    <!-- PostgreSQL Vector Miss -->
    <span
      v-else-if="latencyMs"
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 text-[11px]"
      title="PostgreSQL pgvector hybrid HNSW search + LLM generation"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
      pgvector + LLM ({{ latencyMs }}ms)
    </span>
  </div>
</template>

