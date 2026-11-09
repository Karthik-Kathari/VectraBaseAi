<script setup lang="ts">
/**
 * VectraBase AI — 4 One-Click Recruiter Test Preset Buttons
 */

import { WIDGET_TEST_SCENARIOS, type WidgetTestScenario } from '../types/widget';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'selectScenario', scenario: WidgetTestScenario): void;
}>();

function getColorClasses(color: string) {
  switch (color) {
    case 'indigo':
      return 'border-indigo-500/30 hover:border-indigo-400 text-indigo-300 bg-indigo-950/30 hover:bg-indigo-900/40';
    case 'emerald':
      return 'border-emerald-500/30 hover:border-emerald-400 text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/40';
    case 'rose':
      return 'border-rose-500/30 hover:border-rose-400 text-rose-300 bg-rose-950/30 hover:bg-rose-900/40';
    case 'amber':
      return 'border-amber-500/30 hover:border-amber-400 text-amber-300 bg-amber-950/30 hover:bg-amber-900/40';
    default:
      return 'border-cyan-500/30 hover:border-cyan-400 text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/40';
  }
}
</script>

<template>
  <div class="p-3 border-t border-[#1e293b] bg-[#090b10]/80">
    <div class="flex items-center justify-between mb-2">
      <span class="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
        Recruiter Interactive Test Presets:
      </span>
      <span class="text-[10px] text-slate-500 font-mono">1-Click Live Verification</span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="scenario in WIDGET_TEST_SCENARIOS"
        :key="scenario.id"
        type="button"
        :disabled="disabled"
        @click="emit('selectScenario', scenario)"
        class="flex flex-col text-left p-2 rounded-md border text-xs font-mono transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        :class="getColorClasses(scenario.colorClass)"
        :title="scenario.description"
      >
        <span class="font-bold flex items-center justify-between">
          {{ scenario.label }}
          <span class="text-[10px] opacity-70 group-hover:translate-x-0.5 transition-transform">→</span>
        </span>
        <span class="text-[10px] text-slate-400 truncate mt-0.5">{{ scenario.description }}</span>
      </button>
    </div>
  </div>
</template>

