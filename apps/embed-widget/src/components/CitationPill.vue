<script setup lang="ts">
/**
 * VectraBase AI — Clickable Citation Pill
 */

import type { Citation } from '../types/widget';

defineProps<{
  citation: Citation;
  isActive?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', citation: Citation): void;
}>();
</script>

<template>
  <button
    type="button"
    @click="emit('select', citation)"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all duration-200 border text-left cursor-pointer"
    :class="[
      isActive
        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm shadow-cyan-500/30'
        : 'bg-[#1e293b] text-slate-300 border-[#334155] hover:border-cyan-500/50 hover:text-cyan-300 hover:bg-slate-800'
    ]"
  >
    <svg class="w-3 h-3 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <span class="font-medium text-cyan-400">Source {{ citation.index }}:</span>
    <span class="truncate max-w-[140px]">{{ citation.documentName }}</span>
    <span class="text-slate-400">· P.{{ citation.page }}</span>
    <span class="text-emerald-400 font-semibold">{{ Math.round(citation.score * 100) }}%</span>
  </button>
</template>
