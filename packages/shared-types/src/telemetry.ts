// ============================================================================
// @vectrabase/shared-types — Telemetry Schemas & Types
// Author: Karthik Kathari
// ============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// RAG Telemetry Log
// ---------------------------------------------------------------------------

export const RagTelemetryLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  queryText: z.string().min(1).max(10_000),
  /** Time taken to embed the user query (ms) */
  queryEmbeddingMs: z.number().int().nonnegative(),
  /** Time taken for HNSW / pgvector ANN search (ms) */
  vectorSearchMs: z.number().int().nonnegative(),
  /** Time taken for LLM streaming completion (ms) */
  llmStreamMs: z.number().int().nonnegative(),
  /** End-to-end wall-clock latency (ms) */
  totalLatencyMs: z.number().int().nonnegative(),
  /** Whether the response was served from the Redis semantic cache */
  cacheHit: z.boolean(),
  /** Whether the request was throttled by the rate limiter */
  rateLimited: z.boolean(),
  /** Number of chunks retrieved from the vector store */
  chunkCount: z.number().int().nonnegative(),
  /** Highest cosine similarity score among retrieved chunks */
  topScore: z.number().min(0).max(1).nullable(),
  createdAt: z.string().datetime(),
});
export type RagTelemetryLog = z.infer<typeof RagTelemetryLogSchema>;

// ---------------------------------------------------------------------------
// Cursor Pagination Params
// ---------------------------------------------------------------------------

export const TelemetryCursorParamsSchema = z.object({
  /** Opaque base-64 cursor from a previous page response */
  cursor: z.string().optional(),
  /** Number of rows to return (1–200, default 50) */
  limit: z.number().int().min(1).max(200).default(50),
  /** Full-text search applied to queryText */
  search: z.string().max(512).optional(),
  tenantId: z.string().uuid().optional(),
  /** ISO-8601 lower bound for createdAt */
  dateFrom: z.string().datetime().optional(),
  /** ISO-8601 upper bound for createdAt */
  dateTo: z.string().datetime().optional(),
  /** Filter: minimum totalLatencyMs */
  minLatency: z.number().int().nonnegative().optional(),
  /** Filter: maximum totalLatencyMs */
  maxLatency: z.number().int().nonnegative().optional(),
});
export type TelemetryCursorParams = z.infer<typeof TelemetryCursorParamsSchema>;

// ---------------------------------------------------------------------------
// Cursor-Paginated Page
// ---------------------------------------------------------------------------

export const TelemetryCursorPageSchema = z.object({
  data: z.array(RagTelemetryLogSchema),
  /** Opaque cursor to pass for the next page; null when no more pages */
  nextCursor: z.string().nullable(),
  /** Opaque cursor to pass for the previous page; null when on first page */
  prevCursor: z.string().nullable(),
  /** Approximate total matching rows (may be an index estimate, not exact) */
  totalEstimate: z.number().int().nonnegative(),
  /** Time the database query took to execute (ms) */
  executionTimeMs: z.number().int().nonnegative(),
  /** Whether the query path used an index scan (vs. seq scan) */
  indexScanUsed: z.boolean(),
});
export type TelemetryCursorPage = z.infer<typeof TelemetryCursorPageSchema>;

// ---------------------------------------------------------------------------
// Benchmark Result (SQL EXPLAIN ANALYZE output)
// ---------------------------------------------------------------------------

export const BenchmarkResultSchema = z.object({
  /** Number of rows processed or scanned */
  rowCount: z.number().int().nonnegative(),
  /** Total query execution time (ms) */
  executionTimeMs: z.number().nonnegative(),
  /** Whether the planner chose an index scan */
  indexScan: z.boolean(),
  /** Raw PostgreSQL query plan text (EXPLAIN ANALYZE output) */
  queryPlan: z.string(),
  /** Round-trip latency for a cache-hit path (ms) */
  cacheHitLatencyMs: z.number().nonnegative(),
  /** Round-trip latency for a cache-miss / PostgreSQL-only path (ms) */
  pgMissLatencyMs: z.number().nonnegative(),
  /** Number of DOM nodes in the UI rendering this benchmark result */
  domNodeCount: z.number().int().nonnegative(),
});
export type BenchmarkResult = z.infer<typeof BenchmarkResultSchema>;
