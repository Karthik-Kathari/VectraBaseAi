<script setup lang="ts">
/**
 * VectraBase AI — Chat Message Bubble with Citations and Latency Badges
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import type { WidgetMessage, Citation } from '../types/widget';
import StreamingText from './StreamingText.vue';
import LatencyBadge from './LatencyBadge.vue';
import CitationPill from './CitationPill.vue';

defineProps<{
  message: WidgetMessage;
  activeCitation?: Citation | null;
}>();

const emit = defineEmits<{
  (e: 'selectCitation', citation: Citation): void;
}>();
</script>

<template>
  <div
    class="flex flex-col gap-2 transition-all duration-200"
    :class="message.role === 'user' ? 'items-end' : 'items-start'"
  >
    <!-- Message Content Box -->
    <div
      class="rounded-xl px-4 py-3 max-w-[85%] text-sm"
      :class="[
        message.role === 'user'
          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/40 rounded-br-none'
          : 'bg-[#11131C] text-slate-200 border border-[#1E2230] shadow-md shadow-black/30 rounded-bl-none'
      ]"
    >
      <StreamingText :content="message.content" />

      <!-- Latency & Cache Hit Badge for Assistant Responses -->
      <div
        v-if="message.role === 'assistant' && (message.latencyMs || message.cacheHit)"
        class="mt-2.5 pt-2 border-t border-[#1E2230] flex items-center justify-between"
      >
        <LatencyBadge :latencyMs="message.latencyMs" :cacheHit="message.cacheHit" />
        <span class="text-[10px] text-slate-500 font-mono">
          {{ new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
        </span>
      </div>
    </div>

    <!-- Citations Row (Below Assistant Message) -->
    <div
      v-if="message.role === 'assistant' && message.citations && message.citations.length > 0"
      class="flex flex-wrap gap-1.5 max-w-[85%] pl-1"
    >
      <span class="text-[10px] text-slate-400 font-mono uppercase tracking-wider self-center mr-1 font-semibold">
        Sources:
      </span>
      <CitationPill
        v-for="citation in message.citations"
        :key="citation.index"
        :citation="citation"
        :isActive="activeCitation?.index === citation.index"
        @select="emit('selectCitation', citation)"
      />
    </div>
  </div>
</template>
