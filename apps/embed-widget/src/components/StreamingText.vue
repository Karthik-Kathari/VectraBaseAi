<script setup lang="ts">
/**
 * VectraBase AI — Streaming Markdown & Token Display
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps<{
  content: string;
  isStreaming?: boolean;
}>();

const parsedMarkdown = computed(() => {
  return marked.parse(props.content || '', { gfm: true, breaks: true });
});
</script>

<template>
  <div class="prose prose-invert prose-sm max-w-none leading-relaxed text-slate-200">
    <!-- Rendered Markdown -->
    <div v-html="parsedMarkdown" class="markdown-body"></div>

    <!-- Blinking Cursor during live SSE stream -->
    <span
      v-if="isStreaming"
      class="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle"
    ></span>
  </div>
</template>

<style scoped>
:deep(.markdown-body p) {
  margin-bottom: 0.75rem;
}
:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body code) {
  background: #1E2230;
  padding: 0.15rem 0.35rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.85em;
  color: #38BDF8;
}
:deep(.markdown-body pre) {
  background: #090A0F;
  border: 1px solid #1E2230;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}
:deep(.markdown-body strong) {
  color: #F8FAFC;
}
:deep(.markdown-body ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}
</style>

