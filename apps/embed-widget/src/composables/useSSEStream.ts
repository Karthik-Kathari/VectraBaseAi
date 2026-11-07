// ============================================================================
// embed-widget — useSSEStream Composable
// Author: Karthik Kathari
// ============================================================================
// Wraps the browser's native EventSource / fetch-based SSE reader.
// Returns reactive state and imperative connect / disconnect methods.

import { ref, type Ref } from "vue";
import type { SSEEvent } from "@/types/widget";

export interface SSEStreamOptions {
  /** Called for every parsed SSEEvent */
  onEvent: (event: SSEEvent) => void;
  /** Called when the stream ends cleanly (after a "done" event) */
  onDone?: () => void;
  /** Called when a network or parse error occurs */
  onError?: (err: Error) => void;
  /** Extra request headers */
  headers?: Record<string, string>;
  /** Request body (for POST streams) */
  body?: Record<string, unknown>;
  /** HTTP method — defaults to GET */
  method?: "GET" | "POST";
}

export interface UseSSEStreamReturn {
  isStreaming: Ref<boolean>;
  error: Ref<string | null>;
  connect: (url: string, options: SSEStreamOptions) => Promise<void>;
  disconnect: () => void;
}

export function useSSEStream(): UseSSEStreamReturn {
  const isStreaming = ref(false);
  const error = ref<string | null>(null);

  let controller: AbortController | null = null;

  // -------------------------------------------------------------------------
  // disconnect — abort any in-flight stream
  // -------------------------------------------------------------------------
  function disconnect(): void {
    if (controller) {
      controller.abort();
      controller = null;
    }
    isStreaming.value = false;
  }

  // -------------------------------------------------------------------------
  // connect — open a streaming fetch, parse SSE line-by-line
  // -------------------------------------------------------------------------
  async function connect(
    url: string,
    options: SSEStreamOptions,
  ): Promise<void> {
    // Cancel any previous stream
    disconnect();

    controller = new AbortController();
    isStreaming.value = true;
    error.value = null;

    const resolvedUrl = resolveUrl(url);

    try {
      const response = await fetch(resolvedUrl, {
        method: options.method ?? "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          ...injectTenantHeader(),
          ...(options.headers ?? {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        let message = `HTTP ${response.status}`;
        try {
          const json = JSON.parse(text) as Record<string, unknown>;
          if (typeof json.message === "string") message = json.message;
        } catch {
          // ignore parse error — use raw text
        }

        // Check for rate limit
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : null;
          const err = new Error(
            message || "Rate limit exceeded.",
          ) as Error & { code: string; retryAfterMs: number | null };
          err.code = "RATE_LIMITED";
          err.retryAfterMs = retryMs;
          options.onError?.(err);
          error.value = err.message;
          isStreaming.value = false;
          return;
        }

        // Check for guardrail block
        if (response.status === 400) {
          const err = new Error(message) as Error & { code: string };
          err.code = "GUARDRAIL_BLOCK";
          options.onError?.(err);
          error.value = err.message;
          isStreaming.value = false;
          return;
        }

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error("Response body is null — SSE not supported.");
      }

      // Read the stream line by line
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double newline
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          let dataLine = "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              dataLine = line.slice(6).trim();
            }
          }

          if (!dataLine || dataLine === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataLine) as SSEEvent;
            options.onEvent(parsed);

            if (parsed.type === "done") {
              options.onDone?.();
              isStreaming.value = false;
              return;
            }

            if (parsed.type === "error") {
              const err = new Error(parsed.message);
              options.onError?.(err);
              error.value = parsed.message;
              isStreaming.value = false;
              return;
            }
          } catch {
            // Malformed JSON — skip
            console.warn("[VectraBase SSE] Malformed event data:", dataLine);
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Intentional disconnect — not an error
        return;
      }
      const message =
        err instanceof Error ? err.message : "Unknown streaming error";
      error.value = message;
      options.onError?.(
        err instanceof Error ? err : new Error(message),
      );
    } finally {
      isStreaming.value = false;
    }
  }

  return { isStreaming, error, connect, disconnect };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    (
      (window as unknown as Record<string, unknown>)
        .__VECTRABASE_API_URL__ as string | undefined
    ) ??
    import.meta.env.VITE_API_URL ??
    "";
  return `${base}${path}`;
}

function injectTenantHeader(): Record<string, string> {
  const tenantId = (window as unknown as Record<string, unknown>)
    .__VECTRABASE_TENANT_ID__;
  if (typeof tenantId === "string" && tenantId.length > 0) {
    return { "x-tenant-id": tenantId };
  }
  return {};
}
