<script setup lang="ts">
/**
 * VectraBase AI — Embeddable Widget Container Shell
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { ref, onMounted, nextTick, watch } from 'vue';
import { useChatStore } from '../stores/chat';
import MessageBubble from './MessageBubble.vue';
import CitationCard from './CitationCard.vue';
import StreamingText from './StreamingText.vue';
import TestScenarioButtons from './TestScenarioButtons.vue';
import EmbedScriptModal from './EmbedScriptModal.vue';
import type { Citation, WidgetTestScenario } from '../types/widget';

const chatStore = useChatStore();
const queryInput = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const showEmbedModal = ref(false);

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(() => chatStore.messages.length, scrollToBottom);
watch(() => chatStore.currentStreamContent, scrollToBottom);

function handleSend() {
  if (!queryInput.value.trim() || chatStore.isStreaming) return;
  const q = queryInput.value;
  queryInput.value = '';
  chatStore.sendMessage(q);
}

function handleSelectScenario(scenario: WidgetTestScenario) {
  chatStore.runScenario(scenario);
}

function handleSelectCitation(citation: Citation) {
  chatStore.setActiveCitation(citation);
}

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="flex flex-col h-full bg-[#090A0F] text-slate-100 font-sans border border-[#1E2230] rounded-2xl overflow-hidden shadow-2xl relative">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 bg-[#11131C] border-b border-[#1E2230] flex-shrink-0">
      <div class="flex items-center gap-2.5">
        <!-- Geometric Vector Prism SVG Logo -->
        <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-1 shadow-md shadow-cyan-500/20">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="12 2 2 7 12 12 22 7 12 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="2 17 12 22 22 17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="2 12 12 17 22 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div>
          <h2 class="text-xs font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
            VectraBase AI
            <span class="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 font-normal">
              v1.0 RAG
            </span>
          </h2>
          <p class="text-[10px] text-slate-400 font-mono">By Karthik Kathari · Grounded pgvector</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="showEmbedModal = true"
          class="px-2 py-1 rounded text-[11px] font-mono bg-[#1E2230] hover:bg-[#2A2F45] text-cyan-400 transition-colors border border-[#2A2F45] flex items-center gap-1 cursor-pointer"
          title="Get embed code for your site"
        >
          <span>&lt;/&gt;</span>
          <span>Embed</span>
        </button>
        <button
          type="button"
          @click="chatStore.clearMessages"
          class="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1E2230] transition-colors"
          title="Clear Chat History"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Chat Messages Scroll Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      <MessageBubble
        v-for="msg in chatStore.messages"
        :key="msg.id"
        :message="msg"
        :activeCitation="chatStore.activeCitation"
        @selectCitation="handleSelectCitation"
      />

      <!-- In-Flight Streaming Message -->
      <div
        v-if="chatStore.isStreaming"
        class="flex flex-col items-start gap-2"
      >
        <div class="rounded-xl px-4 py-3 max-w-[85%] text-sm bg-[#11131C] text-slate-200 border border-cyan-500/30 shadow-lg rounded-bl-none">
          <StreamingText :content="chatStore.currentStreamContent" :isStreaming="true" />
        </div>

        <div v-if="chatStore.currentCitations.length > 0" class="flex flex-wrap gap-1.5 pl-1">
          <span class="text-[10px] text-cyan-400 font-mono animate-pulse">
            Retrieving sources...
          </span>
        </div>
      </div>

      <!-- Slide-Out Citation Inspector Card -->
      <div v-if="chatStore.activeCitation" class="sticky bottom-2 z-10 pt-2">
        <CitationCard
          :citation="chatStore.activeCitation"
          @close="chatStore.setActiveCitation(null)"
        />
      </div>
    </div>

    <!-- Recruiter 4-Preset Test Buttons -->
    <TestScenarioButtons
      :disabled="chatStore.isStreaming"
      @selectScenario="handleSelectScenario"
    />

    <!-- Input Box -->
    <form
      @submit.prevent="handleSend"
      class="p-3 bg-[#11131C] border-t border-[#1E2230] flex items-center gap-2 flex-shrink-0"
    >
      <input
        v-model="queryInput"
        type="text"
        :disabled="chatStore.isStreaming"
        placeholder="Ask anything about your indexed documents..."
        class="flex-1 bg-[#090A0F] border border-[#2A2F45] focus:border-cyan-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors font-mono disabled:opacity-50"
      />
      <button
        type="submit"
        :disabled="!queryInput.trim() || chatStore.isStreaming"
        class="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-950 flex items-center gap-1 cursor-pointer"
      >
        <span>Send</span>
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </form>

    <!-- Embed Code Modal -->
    <EmbedScriptModal
      v-if="showEmbedModal"
      :tenantId="chatStore.selectedTenantId"
      @close="showEmbedModal = false"
    />
  </div>
</template>
