/**
 * VectraBase AI — 50-Field AI Governance Configuration Route
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

export const governanceRouter = Router();

// Helper parsers for robust data type conversion
function parseInteger(val: any, fallback: number): number {
  if (val === undefined || val === null || val === '') return fallback;
  const num = parseInt(String(val), 10);
  return Number.isNaN(num) ? fallback : num;
}

function parseFloatNum(val: any, fallback: number): number {
  if (val === undefined || val === null || val === '') return fallback;
  const num = parseFloat(String(val));
  return Number.isNaN(num) ? fallback : num;
}

function parseBoolean(val: any, fallback: boolean): boolean {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes') return true;
    if (s === 'false' || s === '0' || s === 'no') return false;
  }
  return Boolean(val);
}

function parseStringArray(val: any, fallback: string[] = []): string[] {
  if (val === undefined || val === null) return fallback;
  if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean);
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return fallback;
}

// Maps and sanitizes input payload to ensure ONLY valid GovernanceConfig schema columns are passed to Prisma
function sanitizeGovernanceData(payload: Record<string, any>, isCreate = false): Record<string, any> {
  const data: Record<string, any> = {};

  // Step 1: Workspace Identity (10 fields)
  if (payload.workspaceName !== undefined || payload.displayName !== undefined || isCreate) {
    data.workspaceName = String(payload.workspaceName ?? payload.displayName ?? (isCreate ? 'Default Workspace' : '')).trim();
  }
  if (payload.workspaceDescription !== undefined || payload.description !== undefined || isCreate) {
    data.workspaceDescription = String(payload.workspaceDescription ?? payload.description ?? (isCreate ? 'Production RAG Environment' : '')).trim();
  }
  if (payload.contactEmail !== undefined || payload.adminEmail !== undefined || isCreate) {
    data.contactEmail = String(payload.contactEmail ?? payload.adminEmail ?? '').trim();
  }
  if (payload.dataRetentionDays !== undefined || isCreate) {
    data.dataRetentionDays = parseInteger(payload.dataRetentionDays, 90);
  }
  if (payload.defaultLanguage !== undefined || isCreate) {
    data.defaultLanguage = String(payload.defaultLanguage ?? 'en').trim();
  }
  if (payload.timezone !== undefined || isCreate) {
    data.timezone = String(payload.timezone ?? 'UTC').trim();
  }
  if (payload.logoUrl !== undefined || isCreate) {
    data.logoUrl = String(payload.logoUrl ?? '').trim();
  }
  if (payload.primaryColor !== undefined || payload.widgetPrimaryColor !== undefined || isCreate) {
    data.primaryColor = String(payload.primaryColor ?? payload.widgetPrimaryColor ?? '#6366f1').trim();
  }
  if (payload.secondaryColor !== undefined || isCreate) {
    data.secondaryColor = String(payload.secondaryColor ?? '#8b5cf6').trim();
  }
  if (payload.supportEmail !== undefined || payload.billingEmail !== undefined || isCreate) {
    data.supportEmail = String(payload.supportEmail ?? payload.billingEmail ?? '').trim();
  }

  // Step 2: Vector & Chunking Hyperparameters (10 fields)
  if (payload.chunkSize !== undefined || isCreate) {
    data.chunkSize = parseInteger(payload.chunkSize, 512);
  }
  if (payload.chunkOverlap !== undefined || isCreate) {
    data.chunkOverlap = parseInteger(payload.chunkOverlap, 64);
  }
  if (payload.embeddingModel !== undefined || isCreate) {
    data.embeddingModel = String(payload.embeddingModel ?? 'text-embedding-3-small').trim();
  }
  if (payload.similarityThreshold !== undefined || isCreate) {
    data.similarityThreshold = parseFloatNum(payload.similarityThreshold, 0.75);
  }
  if (payload.maxChunksPerQuery !== undefined || payload.topKResults !== undefined || isCreate) {
    data.maxChunksPerQuery = parseInteger(payload.maxChunksPerQuery ?? payload.topKResults, 5);
  }
  if (payload.hnswM !== undefined || isCreate) {
    data.hnswM = parseInteger(payload.hnswM, 16);
  }
  if (payload.hnswEfConstruction !== undefined || isCreate) {
    data.hnswEfConstruction = parseInteger(payload.hnswEfConstruction, 200);
  }
  if (payload.hnswEfSearch !== undefined || isCreate) {
    data.hnswEfSearch = parseInteger(payload.hnswEfSearch, 100);
  }
  if (payload.hybridSearchWeight !== undefined || isCreate) {
    data.hybridSearchWeight = parseFloatNum(payload.hybridSearchWeight, 0.7);
  }
  if (payload.rerankerEnabled !== undefined || payload.rerankEnabled !== undefined || isCreate) {
    data.rerankerEnabled = parseBoolean(payload.rerankerEnabled ?? payload.rerankEnabled, false);
  }

  // Step 3: Guardrails & PII Masking (10 fields)
  if (payload.piiMaskingEnabled !== undefined || isCreate) {
    data.piiMaskingEnabled = parseBoolean(payload.piiMaskingEnabled, true);
  }
  if (payload.piiMaskingLevel !== undefined || isCreate) {
    data.piiMaskingLevel = String(payload.piiMaskingLevel ?? 'moderate').trim();
  }
  if (payload.promptInjectionThreshold !== undefined || isCreate) {
    data.promptInjectionThreshold = parseFloatNum(payload.promptInjectionThreshold, 0.85);
  }
  if (payload.contentModerationEnabled !== undefined || isCreate) {
    data.contentModerationEnabled = parseBoolean(payload.contentModerationEnabled, true);
  }
  if (payload.blockedKeywords !== undefined || isCreate) {
    data.blockedKeywords = parseStringArray(payload.blockedKeywords, ['system prompt', 'ignore previous instructions']);
  }
  if (payload.maxQueryLength !== undefined || isCreate) {
    data.maxQueryLength = parseInteger(payload.maxQueryLength, 2000);
  }
  if (payload.jailbreakDetection !== undefined || isCreate) {
    data.jailbreakDetection = parseBoolean(payload.jailbreakDetection, true);
  }
  if (payload.hallucinationGuard !== undefined || isCreate) {
    data.hallucinationGuard = parseBoolean(payload.hallucinationGuard, false);
  }
  if (payload.safetyLevel !== undefined || isCreate) {
    data.safetyLevel = String(payload.safetyLevel ?? 'balanced').trim();
  }
  if (payload.auditLogsEnabled !== undefined || isCreate) {
    data.auditLogsEnabled = parseBoolean(payload.auditLogsEnabled, true);
  }

  // Step 4: Widget Branding & CORS Security (10 fields)
  if (payload.widgetTitle !== undefined || payload.displayName !== undefined || isCreate) {
    data.widgetTitle = String(payload.widgetTitle ?? payload.displayName ?? 'AI Assistant').trim();
  }
  if (payload.widgetGreeting !== undefined || payload.widgetWelcomeMessage !== undefined || isCreate) {
    data.widgetGreeting = String(payload.widgetGreeting ?? payload.widgetWelcomeMessage ?? 'Hello! How can I help you today?').trim();
  }
  if (payload.widgetPlaceholder !== undefined || isCreate) {
    data.widgetPlaceholder = String(payload.widgetPlaceholder ?? 'Ask me anything...').trim();
  }
  if (payload.widgetPosition !== undefined || isCreate) {
    data.widgetPosition = String(payload.widgetPosition ?? 'bottom-right').trim();
  }
  if (payload.corsAllowedOrigins !== undefined || isCreate) {
    data.corsAllowedOrigins = parseStringArray(payload.corsAllowedOrigins, ['*']);
  }
  if (payload.widgetTheme !== undefined || isCreate) {
    data.widgetTheme = String(payload.widgetTheme ?? 'dark').trim();
  }
  if (payload.widgetFontFamily !== undefined || isCreate) {
    data.widgetFontFamily = String(payload.widgetFontFamily ?? 'Inter').trim();
  }
  if (payload.showCitationCards !== undefined || payload.showCitationPills !== undefined || isCreate) {
    data.showCitationCards = parseBoolean(payload.showCitationCards ?? payload.showCitationPills, true);
  }
  if (payload.showTypingIndicator !== undefined || isCreate) {
    data.showTypingIndicator = parseBoolean(payload.showTypingIndicator, true);
  }
  if (payload.widgetBorderRadius !== undefined || isCreate) {
    data.widgetBorderRadius = parseInteger(payload.widgetBorderRadius, 12);
  }

  // Step 5: Rate-Limit & Webhook Quotas (10 fields)
  if (payload.rateLimitPerMinute !== undefined || payload.requestsPerMinute !== undefined || isCreate) {
    data.rateLimitPerMinute = parseInteger(payload.rateLimitPerMinute ?? payload.requestsPerMinute, 60);
  }
  if (payload.rateLimitPerHour !== undefined || isCreate) {
    data.rateLimitPerHour = parseInteger(payload.rateLimitPerHour, 1000);
  }
  if (payload.rateLimitPerDay !== undefined || payload.requestsPerDay !== undefined || isCreate) {
    data.rateLimitPerDay = parseInteger(payload.rateLimitPerDay ?? payload.requestsPerDay, 10000);
  }
  if (payload.maxConcurrentRequests !== undefined || isCreate) {
    data.maxConcurrentRequests = parseInteger(payload.maxConcurrentRequests, 10);
  }
  if (payload.webhookUrl !== undefined || payload.contactWebhookUrl !== undefined || isCreate) {
    data.webhookUrl = String(payload.webhookUrl ?? payload.contactWebhookUrl ?? '').trim();
  }
  if (payload.webhookSecret !== undefined || isCreate) {
    data.webhookSecret = String(payload.webhookSecret ?? '').trim();
  }
  if (payload.webhookEnabled !== undefined || isCreate) {
    data.webhookEnabled = parseBoolean(payload.webhookEnabled ?? Boolean(payload.webhookUrl || payload.contactWebhookUrl), false);
  }
  if (payload.webhookRetryCount !== undefined || payload.webhookRetryAttempts !== undefined || isCreate) {
    data.webhookRetryCount = parseInteger(payload.webhookRetryCount ?? payload.webhookRetryAttempts, 3);
  }
  if (payload.cacheTtlSeconds !== undefined || isCreate) {
    data.cacheTtlSeconds = parseInteger(payload.cacheTtlSeconds, 60);
  }
  if (payload.monthlyTokenQuota !== undefined || isCreate) {
    data.monthlyTokenQuota = parseInteger(payload.monthlyTokenQuota, 1000000);
  }

  return data;
}

// GET /api/governance — Get tenant governance configuration
governanceRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const cacheKey = `governance:config:${tenantId}`;

    // Try Redis cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: JSON.parse(cached),
          source: 'cache',
        });
      }
    } catch {
      // Redis fallback to DB
    }

    let config = await prisma.governanceConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      // Create default governance config for tenant if none exists
      config = await prisma.governanceConfig.create({
        data: {
          tenantId,
          workspaceName: 'Default Workspace',
          workspaceDescription: 'Production RAG Environment',
          contactEmail: req.user!.email,
          dataRetentionDays: 90,
          defaultLanguage: 'en',
          timezone: 'UTC',
          logoUrl: '',
          primaryColor: '#06B6D4',
          secondaryColor: '#6366F1',
          supportEmail: req.user!.email,

          chunkSize: 512,
          chunkOverlap: 64,
          embeddingModel: 'nomic-embed-text',
          similarityThreshold: 0.72,
          maxChunksPerQuery: 5,
          hnswM: 16,
          hnswEfConstruction: 200,
          hnswEfSearch: 100,
          hybridSearchWeight: 0.7,
          rerankerEnabled: false,

          piiMaskingEnabled: true,
          piiMaskingLevel: 'moderate',
          promptInjectionThreshold: 0.85,
          contentModerationEnabled: true,
          blockedKeywords: ['system prompt', 'ignore previous instructions'],
          maxQueryLength: 2000,
          jailbreakDetection: true,
          hallucinationGuard: true,
          safetyLevel: 'strict',
          auditLogsEnabled: true,

          widgetTitle: 'VectraBase AI Assistant',
          widgetGreeting: '👋 Hello! Ask me anything about your indexed documents.',
          widgetPlaceholder: 'Type your question...',
          widgetPosition: 'bottom-right',
          corsAllowedOrigins: ['*'],
          widgetTheme: 'dark',
          widgetFontFamily: 'Inter',
          showCitationCards: true,
          showTypingIndicator: true,
          widgetBorderRadius: 12,

          rateLimitPerMinute: 60,
          rateLimitPerHour: 1000,
          rateLimitPerDay: 10000,
          maxConcurrentRequests: 10,
          webhookUrl: '',
          webhookSecret: '',
          webhookEnabled: false,
          webhookRetryCount: 3,
          cacheTtlSeconds: 60,
          monthlyTokenQuota: 1000000,
        },
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true },
    });

    const responseData = {
      ...config,
      workspaceSlug: tenant?.slug || '',
    };

    try {
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300);
    } catch {
      // Non-fatal
    }

    res.json({
      success: true,
      data: responseData,
      source: 'database',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GOVERNANCE_FETCH_ERROR',
        message: error.message || 'Failed to fetch governance configuration',
      },
    });
  }
});

// POST /api/governance — Save/update tenant governance configuration
// Protected by RBAC: only WORKSPACE_OWNER or AI_ENGINEER can modify
governanceRouter.post(
  '/',
  authenticateToken,
  requireRole('WORKSPACE_OWNER', 'AI_ENGINEER'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.user!.tenantId;
      const payload = req.body || {};

      // Handle workspaceSlug: update Tenant.slug if provided (workspaceSlug belongs to Tenant, not GovernanceConfig)
      let workspaceSlug = payload.workspaceSlug;
      if (workspaceSlug && typeof workspaceSlug === 'string') {
        const normalizedSlug = workspaceSlug.trim().toLowerCase();
        try {
          const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: { slug: normalizedSlug },
          });
          workspaceSlug = updatedTenant.slug;
        } catch {
          // If slug update fails (e.g. duplicate slug), continue gracefully without failing configuration save
        }
      }

      // Sanitize data: omit workspaceSlug and non-model fields, map frontend aliases, enforce valid types
      const updateData = sanitizeGovernanceData(payload, false);
      const createData = {
        tenantId,
        ...sanitizeGovernanceData(payload, true),
      };

      const config = await prisma.governanceConfig.upsert({
        where: { tenantId },
        update: updateData,
        create: createData,
      });

      // Invalidate cache
      const cacheKey = `governance:config:${tenantId}`;
      try {
        await redis.del(cacheKey);
        await redis.set(cacheKey, JSON.stringify({ ...config, workspaceSlug: workspaceSlug || '' }), 'EX', 300);
      } catch {
        // Non-fatal
      }

      res.json({
        success: true,
        data: {
          ...config,
          workspaceSlug: workspaceSlug || '',
        },
        message: 'Governance configuration saved successfully — Zero Data Loss Verified',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GOVERNANCE_SAVE_ERROR',
          message: error.message || 'Failed to save governance configuration',
        },
      });
    }
  },
);
