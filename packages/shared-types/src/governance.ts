// ============================================================================
// @vectrabase/shared-types — AI Governance Wizard Schemas & Types (50 fields)
// Author: Karthik Kathari
// ============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Step 1 — Workspace Identity (10 fields)
// ---------------------------------------------------------------------------

export const GovernanceStep1Schema = z.object({
  /** Human-readable workspace name, e.g. "Acme Corp AI" */
  workspaceName: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(128),
  /** URL-safe slug, lowercase letters, digits, and hyphens only */
  workspaceSlug: z
    .string()
    .min(2)
    .max(64)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with optional hyphens",
    ),
  /** Public-facing display name shown in the widget header */
  displayName: z.string().min(1).max(128),
  /** Primary admin contact email for this workspace */
  adminEmail: z.string().email("A valid admin email is required"),
  /** IANA timezone identifier, e.g. "America/New_York" */
  timezone: z.string().min(1).max(64),
  /** BCP-47 language tag for default locale, e.g. "en-US" */
  defaultLanguage: z.string().min(2).max(16),
  /** Absolute URL to workspace logo (PNG/SVG, 512×512 recommended) */
  logoUrl: z.string().url().optional(),
  /** Short description shown on workspace settings and onboarding */
  description: z.string().max(1024).default(""),
  /** Webhook URL that receives workspace-level lifecycle events */
  contactWebhookUrl: z.string().url().optional(),
  /** Email address used for billing receipts and payment alerts */
  billingEmail: z.string().email("A valid billing email is required"),
});
export type GovernanceStep1 = z.infer<typeof GovernanceStep1Schema>;

// ---------------------------------------------------------------------------
// Step 2 — Vector & Chunking Hyperparameters (10 fields)
// ---------------------------------------------------------------------------

export const EmbeddingModelSchema = z.enum([
  "nomic-embed-text",
  "text-embedding-3-small",
  "text-embedding-ada-002",
]);
export type EmbeddingModel = z.infer<typeof EmbeddingModelSchema>;

export const EmbeddingDimensionsSchema = z.union([
  z.literal(384),
  z.literal(768),
  z.literal(1536),
]);
export type EmbeddingDimensions = z.infer<typeof EmbeddingDimensionsSchema>;

export const GovernanceStep2Schema = z.object({
  /** Token count per document chunk (128–2048) */
  chunkSize: z.number().int().min(128).max(2048).default(512),
  /** Overlapping token count between adjacent chunks (0–256) */
  chunkOverlap: z.number().int().min(0).max(256).default(64),
  /** Embedding model used to encode document chunks and queries */
  embeddingModel: EmbeddingModelSchema.default("nomic-embed-text"),
  /** Dimensionality of the embedding vectors stored in pgvector */
  embeddingDimensions: EmbeddingDimensionsSchema.default(768),
  /** HNSW graph connectivity parameter M (4–64) */
  hnswM: z.number().int().min(4).max(64).default(16),
  /** HNSW build-time ef_construction parameter (32–512) */
  hnswEfConstruction: z.number().int().min(32).max(512).default(200),
  /** Minimum cosine similarity to include a chunk in results (0.0–1.0) */
  similarityThreshold: z.number().min(0.0).max(1.0).default(0.72),
  /** Number of top-K chunks to retrieve from the vector store (1–20) */
  topKResults: z.number().int().min(1).max(20).default(5),
  /** Hard cap on tokens per chunk (enforced after chunkSize splitting) */
  maxTokensPerChunk: z.number().int().positive(),
  /** Whether to run a cross-encoder re-ranker after ANN retrieval */
  rerankEnabled: z.boolean().default(false),
});
export type GovernanceStep2 = z.infer<typeof GovernanceStep2Schema>;

// ---------------------------------------------------------------------------
// Step 3 — Guardrails & PII Masking (10 fields)
// ---------------------------------------------------------------------------

export const PiiCategorySchema = z.enum([
  "EMAIL",
  "PHONE",
  "SSN",
  "CREDIT_CARD",
  "NAME",
  "ADDRESS",
]);
export type PiiCategory = z.infer<typeof PiiCategorySchema>;

export const GuardrailActionSchema = z.enum(["BLOCK", "WARN", "LOG"]);
export type GuardrailAction = z.infer<typeof GuardrailActionSchema>;

export const GovernanceStep3Schema = z.object({
  /** Master switch for PII detection & redaction pipeline */
  piiMaskingEnabled: z.boolean().default(false),
  /** Which PII entity categories to detect and mask */
  piiCategories: z.array(PiiCategorySchema).default([]),
  /** Enable heuristic prompt-injection detection middleware */
  promptInjectionGuardrail: z.boolean().default(true),
  /** Maximum character length allowed per user query (1–10000) */
  maxQueryLength: z.number().int().min(1).max(10_000).default(2000),
  /** Whitelist of topic keywords; queries must touch at least one (empty = unrestricted) */
  allowedTopics: z.array(z.string().min(1).max(128)).default([]),
  /** Denylist of exact keywords; matching queries are guardrailed */
  blockedKeywords: z.array(z.string().min(1).max(256)).default([]),
  /** Action taken when a guardrail fires */
  guardrailAction: GuardrailActionSchema.default("BLOCK"),
  /** LLM-confidence threshold below which responses are flagged (0.0–1.0) */
  confidenceThreshold: z.number().min(0.0).max(1.0).default(0.6),
  /** Enable post-generation hallucination detection filter */
  hallucingationFilter: z.boolean().default(false),
  /** Number of days to retain audit log entries (1–365) */
  auditLogRetentionDays: z.number().int().min(1).max(365).default(90),
});
export type GovernanceStep3 = z.infer<typeof GovernanceStep3Schema>;

// ---------------------------------------------------------------------------
// Step 4 — Widget Branding & CORS Security (10 fields)
// ---------------------------------------------------------------------------

export const WidgetThemeSchema = z.enum(["dark", "light", "auto"]);
export type WidgetTheme = z.infer<typeof WidgetThemeSchema>;

export const WidgetPositionSchema = z.enum([
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
]);
export type WidgetPosition = z.infer<typeof WidgetPositionSchema>;

export const GovernanceStep4Schema = z.object({
  /** Widget accent color as a 7-character hex string, e.g. "#6366F1" */
  widgetPrimaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color, e.g. #6366F1")
    .default("#6366F1"),
  /** CSS font-family string applied to widget text */
  widgetFontFamily: z.string().min(1).max(256).default("Inter, sans-serif"),
  /** Greeting message shown when the widget is first opened */
  widgetWelcomeMessage: z
    .string()
    .max(512)
    .default("👋 Hi! How can I help you today?"),
  /** Placeholder text in the query input box */
  widgetPlaceholder: z
    .string()
    .max(256)
    .default("Ask me anything about your documents…"),
  /** Origins allowed to embed the widget via CORS (wildcard "*" = public) */
  corsAllowedOrigins: z.array(z.string().min(1)).default([]),
  /** Raw Content-Security-Policy directive appended to the widget iframe */
  cspDirectives: z
    .string()
    .max(2048)
    .default("default-src 'self'; script-src 'self'"),
  /** Hostnames permitted to load the embed script */
  embedDomains: z.array(z.string().min(1)).default([]),
  /** Colour mode sent to the widget iframe */
  widgetTheme: WidgetThemeSchema.default("auto"),
  /** Whether to render clickable citation pills below each AI answer */
  showCitationPills: z.boolean().default(true),
  /** Corner of the host page where the widget launcher button appears */
  widgetPosition: WidgetPositionSchema.default("bottom-right"),
});
export type GovernanceStep4 = z.infer<typeof GovernanceStep4Schema>;

// ---------------------------------------------------------------------------
// Step 5 — Rate-Limit & Webhook Quotas (10 fields)
// ---------------------------------------------------------------------------

export const WebhookEventSchema = z.enum([
  "DOCUMENT_INDEXED",
  "QUERY_ANSWERED",
  "RATE_LIMITED",
  "GUARDRAIL_BLOCKED",
]);
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

export const GovernanceStep5Schema = z.object({
  /** Maximum API requests per minute, per tenant (1–10000) */
  requestsPerMinute: z.number().int().min(1).max(10_000).default(60),
  /** Maximum API requests per calendar day, per tenant */
  requestsPerDay: z.number().int().positive().default(10_000),
  /** Maximum LLM tokens consumed per calendar day, per tenant */
  tokenBudgetPerDay: z.number().int().positive().default(1_000_000),
  /** URL that receives webhook payloads for event subscriptions */
  webhookUrl: z.string().url().optional(),
  /** HMAC-SHA256 signing secret for webhook payload verification */
  webhookSecret: z.string().min(16).max(512).optional(),
  /** Event types that trigger a webhook delivery */
  webhookEvents: z.array(WebhookEventSchema).default([]),
  /** Maximum simultaneous in-flight requests processed for this tenant */
  maxConcurrentRequests: z.number().int().min(1).max(500).default(10),
  /** Burst multiplier applied on top of requestsPerMinute (1.0–5.0) */
  burstMultiplier: z.number().min(1.0).max(5.0).default(1.5),
  /**
   * Percentage of daily quota consumed that triggers an alert email
   * (0 = disabled, 100 = only when exhausted)
   */
  alertEmailThreshold: z.number().int().min(0).max(100).default(80),
  /** Number of automatic retry attempts for failed webhook deliveries (0–10) */
  webhookRetryAttempts: z.number().int().min(0).max(10).default(3),
});
export type GovernanceStep5 = z.infer<typeof GovernanceStep5Schema>;

// ---------------------------------------------------------------------------
// Combined Governance Config (all 50 fields)
// ---------------------------------------------------------------------------

export const GovernanceConfigSchema = GovernanceStep1Schema.merge(
  GovernanceStep2Schema,
)
  .merge(GovernanceStep3Schema)
  .merge(GovernanceStep4Schema)
  .merge(GovernanceStep5Schema);
export type GovernanceConfig = z.infer<typeof GovernanceConfigSchema>;

// ---------------------------------------------------------------------------
// Save Request & Draft Key
// ---------------------------------------------------------------------------

export const GovernanceSaveRequestSchema = z.object({
  tenantId: z.string().uuid(),
  config: GovernanceConfigSchema,
  /** If true, persist as a draft without full validation */
  isDraft: z.boolean().default(false),
});
export type GovernanceSaveRequest = z.infer<typeof GovernanceSaveRequestSchema>;

/**
 * Redis / local-storage key pattern for governance wizard drafts.
 * Format: `governance:draft:{tenantId}`
 */
export type GovernanceDraftKey = `governance:draft:${string}`;

export const makeGovernanceDraftKey = (tenantId: string): GovernanceDraftKey =>
  `governance:draft:${tenantId}`;
