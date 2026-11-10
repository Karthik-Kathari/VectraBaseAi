/**
 * VectraBase AI — Free Trial & Quota Guard Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export interface TrialGuardOptions {
  action: 'query' | 'document';
}

export function trialGuard(options: TrialGuardOptions = { action: 'query' }) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Resolve effective tenantId from authenticated user or req.body / header
    const tenantId =
      req.user?.tenantId ||
      req.body?.tenantId ||
      (req.headers['x-tenant-id'] as string) ||
      '00000000-0000-0000-0000-000000000001';

    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          plan: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          trialQueriesUsed: true,
          trialQueriesLimit: true,
          trialDocsUsed: true,
          trialDocsLimit: true,
        },
      });

      if (!tenant) {
        // If tenant doesn't exist, proceed with demo fallback
        next();
        return;
      }

      // Pro & Enterprise tenants have unlimited queries and uploads
      if (tenant.plan === 'PRO' || tenant.plan === 'ENTERPRISE') {
        next();
        return;
      }

      // Check if time-based trial has expired
      const now = new Date();
      if (tenant.trialEndsAt && now > tenant.trialEndsAt) {
        res.status(402).json({
          success: false,
          error: {
            code: 'TRIAL_EXPIRED',
            message: 'Your 14-day free trial has expired. Upgrade to Pro to continue querying and uploading documents.',
            upgradeUrl: '/pricing',
            trialStatus: {
              plan: tenant.plan,
              status: 'EXPIRED',
              queriesUsed: tenant.trialQueriesUsed,
              queriesLimit: tenant.trialQueriesLimit,
              docsUsed: tenant.trialDocsUsed,
              docsLimit: tenant.trialDocsLimit,
              expiredAt: tenant.trialEndsAt,
            },
          },
        });
        return;
      }

      // Check action-specific usage limit
      if (options.action === 'query') {
        if (tenant.trialQueriesUsed >= tenant.trialQueriesLimit) {
          res.status(402).json({
            success: false,
            error: {
              code: 'TRIAL_LIMIT_REACHED',
              message: `You have reached your free trial limit of ${tenant.trialQueriesLimit} queries. Upgrade to Pro for unlimited queries.`,
              upgradeUrl: '/pricing',
              trialStatus: {
                plan: tenant.plan,
                status: 'QUOTA_EXHAUSTED',
                queriesUsed: tenant.trialQueriesUsed,
                queriesLimit: tenant.trialQueriesLimit,
                remainingQueries: 0,
              },
            },
          });
          return;
        }

        // Increment query usage atomically
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { trialQueriesUsed: { increment: 1 } },
        });
      } else if (options.action === 'document') {
        if (tenant.trialDocsUsed >= tenant.trialDocsLimit) {
          res.status(402).json({
            success: false,
            error: {
              code: 'TRIAL_LIMIT_REACHED',
              message: `You have reached your free trial limit of ${tenant.trialDocsLimit} documents. Upgrade to Pro to upload unlimited documents.`,
              upgradeUrl: '/pricing',
              trialStatus: {
                plan: tenant.plan,
                status: 'QUOTA_EXHAUSTED',
                docsUsed: tenant.trialDocsUsed,
                docsLimit: tenant.trialDocsLimit,
                remainingDocs: 0,
              },
            },
          });
          return;
        }

        // Increment doc usage atomically
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { trialDocsUsed: { increment: 1 } },
        });
      }

      next();
    } catch (err: any) {
      console.error('[TrialGuard Error]', err.message);
      // Fail open on database error so user experience is not disrupted unexpectedly
      next();
    }
  };
}

