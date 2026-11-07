// ============================================================================
// @vectrabase/shared-types — Widget Schemas & Types (Vue.js 3 embed widget)
// Author: Karthik Kathari
// ============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Citation
// ---------------------------------------------------------------------------

export const CitationSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
  chunkId: z.string().uuid(),
  documentName: z.string().min(1).max(512),
  pageNumber: z.number().int().nonnegative().nullable(),
  chunkIndex: z.number().int().nonnegative(),
  /** Cosine similarity score of this chunk against the user query */
  similarity: z.number().min(0).max(1),
  /** Raw chunk text shown in the citation drawer (truncated to 600 chars) */
  rawText: z.string().max(600),
});
export type Citation = z.infer<typeof CitationSchema>;

// ---------------------------------------------------------------------------
// Widget Message
// ---------------------------------------------------------------------------

export const MessageRoleSchema = z.enum(["user", "assistant"]);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const WidgetMessageSchema = z.object({
  id: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string(),
  citations: z.array(CitationSchema).default([]),
  timestamp: z.string().datetime(),
  /** End-to-end latency for assistant messages (ms); null for user messages */
  latencyMs: z.number().int().nonnegative().nullable(),
  /** Whether this response was served from the Redis semantic cache */
  cacheHit: z.boolean().nullable(),
});
export type WidgetMessage = z.infer<typeof WidgetMessageSchema>;

// ---------------------------------------------------------------------------
// Query Request
// ---------------------------------------------------------------------------

export const QueryRequestSchema = z.object({
  query: z
    .string()
    .min(1, "Query must not be empty")
    .max(10_000, "Query exceeds maximum length of 10,000 characters"),
  tenantId: z.string().uuid(),
  sessionId: z.string().uuid(),
  /** Optional per-request config overrides from the widget iframe */
  widgetConfig: z
    .object({
      topKResults: z.number().int().min(1).max(20).optional(),
      similarityThreshold: z.number().min(0).max(1).optional(),
      showCitations: z.boolean().optional(),
    })
    .optional(),
});
export type QueryRequest = z.infer<typeof QueryRequestSchema>;

// ---------------------------------------------------------------------------
// Query SSE Stream Event
// ---------------------------------------------------------------------------

export const QueryStreamEventTypeSchema = z.enum([
  "token",
  "citation",
  "done",
  "error",
]);
export type QueryStreamEventType = z.infer<typeof QueryStreamEventTypeSchema>;

export const QueryStreamEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("token"),
    /** Incremental text token from the LLM streaming response */
    token: z.string(),
  }),
  z.object({
    type: z.literal("citation"),
    /** A source chunk relevant to the current answer */
    citation: CitationSchema,
  }),
  z.object({
    type: z.literal("done"),
    /** Total end-to-end latency for this query (ms) */
    totalLatencyMs: z.number().int().nonnegative(),
    /** Whether this response was served from the Redis semantic cache */
    cacheHit: z.boolean(),
    /** Whether the request was throttled */
    rateLimited: z.boolean(),
  }),
  z.object({
    type: z.literal("error"),
    /** Human-readable error message */
    message: z.string(),
    /** Machine-readable error code */
    code: z.string(),
  }),
]);
export type QueryStreamEvent = z.infer<typeof QueryStreamEventSchema>;

// ---------------------------------------------------------------------------
// Widget Test Scenario Enum
// ---------------------------------------------------------------------------

export const WidgetTestScenarioSchema = z.enum([
  /** Standard grounded query that should retrieve document chunks */
  "GROUNDED_QUERY",
  /** Query intentionally matching a cached response to test Redis speed */
  "CACHE_SPEED_TEST",
  /** Query containing blocked keywords to test guardrail blocking */
  "GUARDRAIL_TEST",
  /** Rapid burst of requests designed to trigger the rate limiter */
  "RATE_LIMIT_BURST",
]);
export type WidgetTestScenario = z.infer<typeof WidgetTestScenarioSchema>;

// ---------------------------------------------------------------------------
// Rate-Limit Status Header Payload
// ---------------------------------------------------------------------------

export const RateLimitStatusSchema = z.object({
  /** Remaining requests in the current sliding window */
  remaining: z.number().int().nonnegative(),
  /** Maximum requests allowed in the window */
  limit: z.number().int().positive(),
  /** ISO-8601 timestamp when the current window resets */
  resetAt: z.string().datetime(),
  /** Duration of the sliding window in milliseconds */
  windowMs: z.number().int().positive(),
});
export type RateLimitStatus = z.infer<typeof RateLimitStatusSchema>;
