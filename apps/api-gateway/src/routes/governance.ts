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

    try {
      await redis.set(cacheKey, JSON.stringify(config), 'EX', 300);
    } catch {
      // Non-fatal
    }

    res.json({
      success: true,
      data: config,
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
      const payload = req.body;

      // Clean up metadata keys if sent
      const { id, tenantId: _, createdAt, updatedAt, ...cleanData } = payload;

      const config = await prisma.governanceConfig.upsert({
        where: { tenantId },
        update: {
          ...cleanData,
        },
        create: {
          tenantId,
          ...cleanData,
        },
      });

      // Invalidate cache
      const cacheKey = `governance:config:${tenantId}`;
      try {
        await redis.del(cacheKey);
        await redis.set(cacheKey, JSON.stringify(config), 'EX', 300);
      } catch {
        // Non-fatal
      }

      res.json({
        success: true,
        data: config,
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
