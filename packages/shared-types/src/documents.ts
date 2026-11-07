// ============================================================================
// @vectrabase/shared-types — Document Schemas & Types
// Author: Karthik Kathari
// ============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const DocumentSourceSchema = z.enum(["PDF", "MARKDOWN", "URL", "TXT"]);
export type DocumentSource = z.infer<typeof DocumentSourceSchema>;

export const DocumentStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "INDEXED",
  "FAILED",
]);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

export const IngestionStageSchema = z.enum([
  "EXTRACTING",
  "CHUNKING",
  "EMBEDDING",
  "STORING",
  "COMPLETE",
  "FAILED",
]);
export type IngestionStage = z.infer<typeof IngestionStageSchema>;

// ---------------------------------------------------------------------------
// Document Chunk
// ---------------------------------------------------------------------------

export const DocumentChunkSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
  content: z.string().min(1),
  chunkIndex: z.number().int().nonnegative(),
  tokenCount: z.number().int().positive(),
  embeddingDimensions: z.number().int().positive(),
  pageNumber: z.number().int().nonnegative().nullable(),
  /** Cosine similarity score – only present on retrieval/search results */
  similarity: z.number().min(0).max(1).optional(),
  createdAt: z.string().datetime(),
});
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

// ---------------------------------------------------------------------------
// Document Record
// ---------------------------------------------------------------------------

export const DocumentRecordSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(512),
  source: DocumentSourceSchema,
  sha256Hash: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]+$/i, "Must be a valid SHA-256 hex digest"),
  status: DocumentStatusSchema,
  totalChunks: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  fileSizeBytes: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DocumentRecord = z.infer<typeof DocumentRecordSchema>;

// ---------------------------------------------------------------------------
// Upload Request / Response
// ---------------------------------------------------------------------------

export const UploadDocumentRequestSchema = z.object({
  tenantId: z.string().uuid(),
  source: DocumentSourceSchema,
  /** For URL-type documents; mutually exclusive with binary file upload */
  url: z.string().url().optional(),
  /** Display name override; defaults to filename or URL hostname */
  name: z.string().min(1).max(512).optional(),
});
export type UploadDocumentRequest = z.infer<typeof UploadDocumentRequestSchema>;

export const UploadDocumentResponseSchema = z.object({
  documentId: z.string().uuid(),
  name: z.string(),
  source: DocumentSourceSchema,
  status: DocumentStatusSchema,
  sha256Hash: z.string().length(64),
  fileSizeBytes: z.number().int().nonnegative(),
  /** SSE stream URL for ingestion progress */
  progressStreamUrl: z.string().url(),
  createdAt: z.string().datetime(),
});
export type UploadDocumentResponse = z.infer<
  typeof UploadDocumentResponseSchema
>;

// ---------------------------------------------------------------------------
// Ingestion Progress SSE Event
// ---------------------------------------------------------------------------

export const IngestProgressEventSchema = z.object({
  documentId: z.string().uuid(),
  stage: IngestionStageSchema,
  /** Overall progress percentage: 0–100 */
  progress: z.number().int().min(0).max(100),
  chunksProcessed: z.number().int().nonnegative(),
  totalChunks: z.number().int().nonnegative(),
  /** Preview of the chunk currently being processed (truncated to 120 chars) */
  currentChunkPreview: z.string().max(120).nullable(),
  /** Wall-clock milliseconds since ingestion started */
  elapsedMs: z.number().int().nonnegative(),
});
export type IngestProgressEvent = z.infer<typeof IngestProgressEventSchema>;
