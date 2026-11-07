/**
 * VectraBase AI — Telemetry Routes
 * Author: Karthik Kathari
 *
 * GET /api/telemetry — Cursor-paginated 1M-row keyset query
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { defaultRateLimiter } from '../middleware/rateLimiter';

export const telemetryRouter = Router();
telemetryRouter.use(authenticate);

// ─── Cursor Encoding / Decoding ───────────────────────────────────────────────

interface TelemetryCursor {
  createdAt: string; // ISO string
  id: string;
}

function encodeCursor(createdAt: Date, id: string): string {
  const payload: TelemetryCursor = { createdAt: createdAt.toISOString(), id };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeCursor(cursor: string): TelemetryCursor | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    return JSON.parse(decoded) as TelemetryCursor;
  } catch {
    return null;
  }
}

// ─── Query Schema ─────────────────────────────────────────────────────────────

const TelemetryQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  search: z.string().optional(),
  tenantId: z.string().uuid().optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
  cacheHit: z.enum(['true', 'false']).optional(),
  rateLimited: z.enum(['true', 'false']).optional(),
  guardrailBlocked: z.enum(['true', 'false']).optional(),
});

// ─── GET / ────────────────────────────────────────────────────────────────────

telemetryRouter.get('/', defaultRateLimiter, async (req: Request, res: Response) => {
  const parse = TelemetryQuerySchema.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parse.error.issues[0]?.message },
    });
    return;
  }

  const { cursor, limit, search, tenantId, dateFrom, dateTo, cacheHit, rateLimited, guardrailBlocked } = parse.data;
  const startMs = Date.now();

  // Resolve tenant scope: WORKSPACE_OWNER can query cross-tenant if tenantId provided,
  // otherwise restricted to their own tenant
  const resolvedTenantId =
    req.user!.role === 'WORKSPACE_OWNER' && tenantId ? tenantId : req.user!.tenantId;

  // Decode cursor for keyset pagination
  let keysetCursor: TelemetryCursor | null = null;
  if (cursor) {
    keysetCursor = decodeCursor(cursor);
    if (!keysetCursor) {
      res.status(400).json({ success: false, error: { code: 'INVALID_CURSOR', message: 'Invalid pagination cursor' } });
      return;
    }
  }

  // Build WHERE clause
  const where: Record<string, unknown> = {
    tenantId: resolvedTenantId,
    ...(cacheHit !== undefined && { cacheHit: cacheHit === 'true' }),
    ...(rateLimited !== undefined && { rateLimited: rateLimited === 'true' }),
    ...(guardrailBlocked !== undefined && { guardrailBlocked: guardrailBlocked === 'true' }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
    ...(search && {
      queryText: { contains: search, mode: 'insensitive' },
    }),
  };

  // Keyset pagination using (createdAt DESC, id DESC)
  // For keyset: WHERE (createdAt, id) < (cursor.createdAt, cursor.id)
  if (keysetCursor) {
    // Prisma doesn't support tuple comparisons natively, use raw SQL for the cursor
    const cursorDate = new Date(keysetCursor.createdAt);
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        tenantId: string;
        queryText: string;
        normalizedQueryHash: string;
        queryEmbeddingMs: number;
        vectorSearchMs: number;
        llmStreamMs: number;
        totalLatencyMs: number;
        cacheHit: boolean;
        rateLimited: boolean;
        guardrailBlocked: boolean;
        chunkCount: number;
        topScore: number | null;
        tokensUsed: number;
        createdAt: Date;
      }>
    >`
      SELECT
        id,
        "tenantId",
        "queryText",
        "normalizedQueryHash",
        "queryEmbeddingMs",
        "vectorSearchMs",
        "llmStreamMs",
        "totalLatencyMs",
        "cacheHit",
        "rateLimited",
        "guardrailBlocked",
        "chunkCount",
        "topScore",
        "tokensUsed",
        "createdAt"
      FROM "RagTelemetryLog"
      WHERE
        "tenantId" = ${resolvedTenantId}::uuid
        ${search ? prisma.$queryRaw`AND "queryText" ILIKE ${'%' + search + '%'}` : prisma.$queryRaw``}
        AND ("createdAt", id) < (${cursorDate}::timestamptz, ${keysetCursor.id}::uuid)
        ${dateFrom ? prisma.$queryRaw`AND "createdAt" >= ${new Date(dateFrom)}::timestamptz` : prisma.$queryRaw``}
        ${dateTo ? prisma.$queryRaw`AND "createdAt" <= ${new Date(dateTo)}::timestamptz` : prisma.$queryRaw``}
        ${cacheHit !== undefined ? prisma.$queryRaw`AND "cacheHit" = ${cacheHit === 'true'}` : prisma.$queryRaw``}
        ${rateLimited !== undefined ? prisma.$queryRaw`AND "rateLimited" = ${rateLimited === 'true'}` : prisma.$queryRaw``}
        ${guardrailBlocked !== undefined ? prisma.$queryRaw`AND "guardrailBlocked" = ${guardrailBlocked === 'true'}` : prisma.$queryRaw``}
      ORDER BY "createdAt" DESC, id DESC
      LIMIT ${limit + 1}
    `;

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const lastItem = items[items.length - 1];
    const nextCursor = hasMore && lastItem ? encodeCursor(lastItem.createdAt, lastItem.id) : null;

    res.json({
      success: true,
      data: {
        logs: items,
        cursor: nextCursor,
        hasMore,
        executionTimeMs: Date.now() - startMs,
      },
    });
    return;
  }

  // First page — use standard Prisma query (no cursor)
  const logs = await prisma.ragTelemetryLog.findMany({
    where,
    select: {
      id: true,
      tenantId: true,
      queryText: true,
      normalizedQueryHash: true,
      queryEmbeddingMs: true,
      vectorSearchMs: true,
      llmStreamMs: true,
      totalLatencyMs: true,
      cacheHit: true,
      rateLimited: true,
      guardrailBlocked: true,
      chunkCount: true,
      topScore: true,
      tokensUsed: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
  });

  const hasMore = logs.length > limit;
  const items = hasMore ? logs.slice(0, limit) : logs;
  const lastItem = items[items.length - 1];
  const nextCursor = hasMore && lastItem ? encodeCursor(lastItem.createdAt, lastItem.id) : null;

  res.json({
    success: true,
    data: {
      logs: items,
      cursor: nextCursor,
      hasMore,
      executionTimeMs: Date.now() - startMs,
    },
  });
});
