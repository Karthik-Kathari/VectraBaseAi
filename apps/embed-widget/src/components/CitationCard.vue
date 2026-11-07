<script setup lang="ts">
/**
 * VectraBase AI — Source Chunk Inspector Card
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { onMounted, ref, watch } from 'vue';
import type { Citation } from '../types/widget';
import { useGSAP } from '../composables/useGSAP';

const props = defineProps<{
  citation: Citation;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { animateProgressBar } = useGSAP();
const progressBarRef = ref<HTMLElement | null>(null);

function updateProgress() {
  if (progressBarRef.value) {
    animateProgressBar(progressBarRef.value, Math.round(props.citation.score * 100));
  }
}

onMounted(updateProgress);
watch(() => props.citation, updateProgress);
</script>

<template>
  <div class="rounded-lg border border-[#2A2F45] bg-[#11131C] p-4 text-xs font-mono shadow-xl relative animate-fadeIn">
    <!-- Header -->
    <div class="flex items-center justify-between pb-3 border-b border-[#1E2230] mb-3">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold">
          SOURCE {{ citation.index }}
        </span>
        <span class="font-semibold text-slate-200 truncate max-w-[200px]" :title="citation.documentName">
          {{ citation.documentName }}
        </span>
      </div>
      <button
        type="button"
        @click="emit('close')"
        class="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-[#1E2230] transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Metadata Grid -->
    <div class="grid grid-cols-3 gap-2 mb-3 text-[11px] text-slate-400">
      <div>
        <span class="text-slate-500 block">Page:</span>
        <span class="text-slate-200 font-semibold">{{ citation.page }}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Chunk Index:</span>
        <span class="text-slate-200 font-semibold">#{{ citation.chunkIndex }}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Cosine Similarity:</span>
        <span class="text-emerald-400 font-semibold">{{ citation.score.toFixed(4) }}</span>
      </div>
    </div>

    <!-- Cosine Similarity Heat Bar -->
    <div class="mb-3">
      <div class="flex justify-between text-[10px] text-slate-400 mb-1">
        <span>Similarity Confidence</span>
        <span class="text-cyan-400 font-bold">{{ Math.round(citation.score * 100) }}%</span>
      </div>
      <div class="w-full bg-[#1E2230] h-1.5 rounded-full overflow-hidden">
        <div
          ref="progressBarRef"
          class="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full"
          style="width: 0%"
        ></div>
      </div>
    </div>

    <!-- Raw Retrieved Text Excerpt -->
    <div>
      <span class="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 font-semibold">
        Exact pgvector Retrieved Paragraph:
      </span>
      <div class="p-2.5 rounded bg-[#090A0F] border border-[#1E2230] text-slate-300 font-sans text-xs leading-relaxed max-h-36 overflow-y-auto">
        {{ citation.rawText }}
      </div>
    </div>
  </div>
</template>
