<script setup lang="ts">
/**
 * VectraBase AI — 4 One-Click Recruiter Test Preset Buttons (Collapsible)
 */

import { ref } from 'vue';
import { WIDGET_TEST_SCENARIOS, type WidgetTestScenario } from '../types/widget';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'selectScenario', scenario: WidgetTestScenario): void;
}>();

const isCollapsed = ref(false);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

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
  <div class="border-t border-[#1e293b] bg-[#090b10]/95 transition-all select-none flex-shrink-0">
    <!-- Header with Arrow Toggle to collapse/expand for maximum chat visibility -->
    <div
      @click="toggleCollapse"
      class="flex items-center justify-between p-2.5 px-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
      title="Click arrow or header to hide/open test presets"
    >
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="p-0.5 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
          :aria-label="isCollapsed ? 'Open Test Presets' : 'Hide Test Presets'"
        >
          <svg
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="{ '-rotate-90': isCollapsed, 'rotate-0': !isCollapsed }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <span class="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
          Recruiter Interactive Test Presets:
        </span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-[10px] text-slate-400 font-mono">1-Click Live Verification</span>
        <span
          class="text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors"
          :class="isCollapsed
            ? 'text-cyan-400 border-cyan-800/50 bg-cyan-950/50 hover:bg-cyan-900/50'
            : 'text-slate-400 border-slate-700/50 bg-slate-800/50'"
        >
          {{ isCollapsed ? 'Show ▲' : 'Hide ▼' }}
        </span>
      </div>
    </div>

    <!-- Presets Grid (Collapsible) -->
    <div v-show="!isCollapsed" class="p-3 pt-0">
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="scenario in WIDGET_TEST_SCENARIOS"
          :key="scenario.id"
          type="button"
          :disabled="disabled"
          @click.stop="emit('selectScenario', scenario)"
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
  </div>
</template>

