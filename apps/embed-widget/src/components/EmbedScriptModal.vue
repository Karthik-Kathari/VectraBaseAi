<script setup lang="ts">
/**
 * VectraBase AI — Copy-Paste Embed Script Generator Modal
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { ref } from 'vue';

const props = defineProps<{
  tenantId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const copied = ref(false);

const embedSnippet = `<div id="vectrabase-widget"></div>
<script src="https://vectrabase-ai.vercel.app/widget.js"><\/script>
<script>
  VectraBaseWidget.init({
    tenantId: '${props.tenantId || '00000000-0000-0000-0000-000000000001'}',
    apiUrl: 'https://vectrabase-api.onrender.com',
    theme: 'dark',
    position: 'bottom-right'
  });
<\/script>`;

async function copyToClipboard() {
  await navigator.clipboard.writeText(embedSnippet);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2500);
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
    <div class="bg-[#11131C] border border-[#2A2F45] rounded-xl max-w-lg w-full p-5 shadow-2xl text-slate-200 font-mono">
      <div class="flex items-center justify-between pb-3 border-b border-[#1E2230] mb-4">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <h3 class="font-bold text-sm text-white">Embed AI Widget on Any Website</h3>
        </div>
        <button
          @click="emit('close')"
          class="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1E2230]"
        >
          ✕
        </button>
      </div>

      <p class="text-xs text-slate-300 font-sans mb-3">
        Paste this lightweight 2-line snippet right before the closing <code class="text-cyan-300">&lt;/body&gt;</code> tag of any HTML document, React app, or CMS.
      </p>

      <div class="relative bg-[#090A0F] border border-[#1E2230] rounded-lg p-3 text-xs mb-4 overflow-x-auto text-cyan-300">
        <pre class="whitespace-pre-wrap break-all font-mono">{{ embedSnippet }}</pre>
      </div>

      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          @click="emit('close')"
          class="px-3 py-1.5 rounded-md text-xs border border-[#2A2F45] hover:bg-[#1E2230] transition-colors"
        >
          Close
        </button>
        <button
          type="button"
          @click="copyToClipboard"
          class="px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5"
          :class="copied ? 'bg-emerald-600 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-black font-semibold'"
        >
          <span v-if="copied">✓ Snippet Copied!</span>
          <span v-else>Copy HTML Snippet</span>
        </button>
      </div>
    </div>
  </div>
</template>

