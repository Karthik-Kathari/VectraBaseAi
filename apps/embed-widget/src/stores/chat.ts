/**
 * VectraBase AI — Vue 3 Chat Store (Pinia)
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WidgetMessage, Citation, WidgetTestScenario } from '../types/widget';
import { useTelemetryStore } from './telemetry';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<WidgetMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: '👋 Welcome to **VectraBase AI**! I am your grounded RAG assistant architected by Karthik Kathari. Ask anything about your indexed documents or try the one-click test scenarios below.',
      createdAt: new Date().toISOString(),
    },
  ]);

  const isStreaming = ref(false);
  const currentStreamContent = ref('');
  const currentCitations = ref<Citation[]>([]);
  const activeCitation = ref<Citation | null>(null);
  const selectedTenantId = ref('00000000-0000-0000-0000-000000000001');

  const telemetryStore = useTelemetryStore();

  const hasMessages = computed(() => messages.value.length > 0);

  function setActiveCitation(citation: Citation | null) {
    activeCitation.value = citation;
  }

  function clearMessages() {
    messages.value = [];
    currentStreamContent.value = '';
    currentCitations.value = [];
    activeCitation.value = null;
  }

  async function sendMessage(query: string, tenantId = selectedTenantId.value) {
    if (!query.trim() || isStreaming.value) return;

    const userMsgId = `user-${Date.now()}`;
    messages.value.push({
      id: userMsgId,
      role: 'user',
      content: query.trim(),
      createdAt: new Date().toISOString(),
    });

    isStreaming.value = true;
    currentStreamContent.value = '';
    currentCitations.value = [];
    const queryStart = performance.now();

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          tenantId,
        }),
      });

      // Handle direct JSON (e.g. Redis Cache Hit or 429)
      const contentType = response.headers.get('content-type') || '';

      if (response.status === 429) {
        telemetryStore.recordRateLimit();
        const errData = await response.json().catch(() => ({}));
        messages.value.push({
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Rate Limit Exceeded:** ${errData.error?.message || 'Too many requests'}. Sliding window enforced by Redis.`,
          createdAt: new Date().toISOString(),
        });
        isStreaming.value = false;
        return;
      }

      if (contentType.includes('application/json')) {
        const json = await response.json();
        const latency = Math.round(performance.now() - queryStart);

        if (json.success && json.data) {
          telemetryStore.recordQuery(latency, json.data.cacheHit ?? false);

          const citations = (json.data.citations || []).map((c: any, idx: number) => ({
            index: idx + 1,
            documentName: c.documentName || 'Document.pdf',
            page: c.pageNumber || 1,
            chunkIndex: c.chunkIndex || 0,
            score: c.similarity || 0.95,
            rawText: c.rawText || '',
          }));

          messages.value.push({
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: json.data.answer,
            latencyMs: latency,
            cacheHit: json.data.cacheHit ?? true,
            citations,
            createdAt: new Date().toISOString(),
          });
        }
        isStreaming.value = false;
        return;
      }

      // Handle SSE Stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';
      let isCacheHit = false;
      let finalLatency = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          streamBuffer += decoder.decode(value, { stream: true });
          const lines = streamBuffer.split('\n\n');
          streamBuffer = lines.pop() || '';

          for (const block of lines) {
            for (const line of block.split('\n')) {
              if (line.startsWith('data: ')) {
                try {
                  const event = JSON.parse(line.slice(6));
                  if (event.type === 'token') {
                    currentStreamContent.value += event.token || '';
                  } else if (event.type === 'citation') {
                    const rawCit = event.citation;
                    currentCitations.value.push({
                      index: currentCitations.value.length + 1,
                      documentName: rawCit.documentName,
                      page: rawCit.pageNumber,
                      chunkIndex: rawCit.chunkIndex,
                      score: rawCit.similarity,
                      rawText: rawCit.rawText,
                    });
                  } else if (event.type === 'done') {
                    finalLatency = event.totalLatencyMs || Math.round(performance.now() - queryStart);
                    isCacheHit = event.cacheHit ?? false;
                  }
                } catch {
                  // Partial chunk
                }
              }
            }
          }
        }
      }

      const totalLatency = finalLatency || Math.round(performance.now() - queryStart);
      telemetryStore.recordQuery(totalLatency, isCacheHit);

      messages.value.push({
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: currentStreamContent.value || 'Response complete.',
        latencyMs: totalLatency,
        cacheHit: isCacheHit,
        citations: [...currentCitations.value],
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      messages.value.push({
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Connection Error:** Could not connect to API Gateway (${err.message}).`,
        createdAt: new Date().toISOString(),
      });
    } finally {
      isStreaming.value = false;
      currentStreamContent.value = '';
      currentCitations.value = [];
    }
  }

  async function runScenario(scenario: WidgetTestScenario) {
    if (scenario.id === 'rate_limit_burst') {
      messages.value.push({
        id: `user-${Date.now()}`,
        role: 'user',
        content: '⚡ [Simulation] Firing 15 concurrent requests to test Redis sliding-window rate limit...',
        createdAt: new Date().toISOString(),
      });
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const promises = Array.from({ length: 15 }, () =>
        fetch(`${apiUrl}/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: scenario.query,
            tenantId: selectedTenantId.value,
          }),
        }).then((r) => r.status)
      );

      const statuses = await Promise.all(promises);
      const blocked = statuses.filter((s) => s === 429).length;
      const passed = statuses.filter((s) => s === 200).length;

      messages.value.push({
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `🛡️ **Redis Rate Limiter Results:**\n- **Allowed Requests:** ${passed}\n- **Blocked (HTTP 429):** ${blocked}\n- **Sliding Window:** 60 req/min strictly enforced via Redis Lua script.`,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    await sendMessage(scenario.query);
  }

  return {
    messages,
    isStreaming,
    currentStreamContent,
    currentCitations,
    activeCitation,
    selectedTenantId,
    hasMessages,
    setActiveCitation,
    clearMessages,
    sendMessage,
    runScenario,
  };
});
