/**
 * VectraBase AI — Authentication Routes
 * Author: Karthik Kathari
 *
 * POST /api/auth/register   — Create Tenant + WORKSPACE_OWNER user
 * POST /api/auth/login      — Verify credentials, issue JWT pair
 * POST /api/auth/refresh    — Rotate refresh token, issue new access token
 * POST /api/auth/logout     — Invalidate refresh token
 * GET  /api/auth/me         — Return current user profile
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, JwtPayload } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

// ─── Validation Schemas ───────────────────────────────────────────────────────

const RegisterSchema = z.object({
  tenantName: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, 'Password must contain uppercase, number, and special character'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function issueAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_TTL });
}

function issueRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setCookieRefresh(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: '/api/auth',
  });
}

// ─── POST /register ───────────────────────────────────────────────────────────

authRouter.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parse.error.issues[0]?.message ?? 'Validation failed', issues: parse.error.issues } });
    return;
  }

  const { tenantName, slug, email, password } = parse.data;

  // Check slug uniqueness
  const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
  if (existingTenant) {
    res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Tenant slug already exists' } });
    return;
  }

  // Check email uniqueness
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Email already registered' } });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const refreshToken = issueRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  // Create tenant and user in a transaction
  const { tenant, user } = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: tenantName, slug },
    });

    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        role: 'WORKSPACE_OWNER',
        refreshToken: refreshTokenHash,
        refreshTokenExpiresAt,
      },
    });

    // Create default governance config
    await tx.governanceConfig.create({
      data: { tenantId: tenant.id, workspaceName: tenantName, contactEmail: email },
    });

    // Store refresh token in family for rotation tracking
    await tx.refreshTokenFamily.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return { tenant, user };
  });

  const accessToken = issueAccessToken({
    sub: user.id,
    tenantId: tenant.id,
    email: user.email,
    role: user.role,
  });

  setCookieRefresh(res, refreshToken);

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        plan: tenant.plan,
      },
    },
  });
});

// ─── POST /login ──────────────────────────────────────────────────────────────

authRouter.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parse.error.issues[0]?.message ?? 'Validation failed' } });
    return;
  }

  const { email, password } = parse.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: { select: { id: true, slug: true, plan: true } } },
  });

  if (!user) {
    res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    return;
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    return;
  }

  const refreshToken = issueRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash, refreshTokenExpiresAt },
    }),
    prisma.refreshTokenFamily.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
      },
    }),
  ]);

  const accessToken = issueAccessToken({
    sub: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  });

  setCookieRefresh(res, refreshToken);

  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug: user.tenant.slug,
        plan: user.tenant.plan,
      },
    },
  });
});

// ─── POST /refresh ────────────────────────────────────────────────────────────

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies?.refreshToken as string | undefined;

  if (!incomingRefreshToken) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' } });
    return;
  }

  const tokenHash = hashToken(incomingRefreshToken);

  // Find token in family
  const tokenRecord = await prisma.refreshTokenFamily.findUnique({
    where: { tokenHash },
    include: {
      user: { include: { tenant: { select: { id: true, slug: true, plan: true } } } },
    },
  });

  if (!tokenRecord) {
    res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Refresh token not found' } });
    return;
  }

  // Detect token reuse (rotation violation)
  if (tokenRecord.used) {
    // Revoke all tokens for this user (possible token theft)
    await prisma.refreshTokenFamily.updateMany({
      where: { userId: tokenRecord.userId },
      data: { used: true },
    });
    res.status(401).json({ success: false, error: { code: 'TOKEN_REUSE', message: 'Refresh token already used. All sessions invalidated.' } });
    return;
  }

  if (tokenRecord.expiresAt < new Date()) {
    res.status(401).json({ success: false, error: { code: 'TOKEN_EXPIRED', message: 'Refresh token has expired' } });
    return;
  }

  const { user } = tokenRecord;
  const newRefreshToken = issueRefreshToken();
  const newRefreshTokenHash = hashToken(newRefreshToken);
  const newRefreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  // Rotate: mark old as used, insert new
  await prisma.$transaction([
    prisma.refreshTokenFamily.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    }),
    prisma.refreshTokenFamily.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt: newRefreshTokenExpiresAt,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshTokenHash, refreshTokenExpiresAt: newRefreshTokenExpiresAt },
    }),
  ]);

  const accessToken = issueAccessToken({
    sub: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  });

  setCookieRefresh(res, newRefreshToken);

  res.json({
    success: true,
    data: { accessToken },
  });
});

// ─── POST /logout ─────────────────────────────────────────────────────────────

authRouter.post('/logout', authenticate, async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies?.refreshToken as string | undefined;

  if (incomingRefreshToken) {
    const tokenHash = hashToken(incomingRefreshToken);
    // Invalidate the token (mark as used)
    await prisma.refreshTokenFamily.updateMany({
      where: { tokenHash },
      data: { used: true },
    });
  }

  if (req.user) {
    await prisma.user.update({
      where: { id: req.user.sub },
      data: { refreshToken: null, refreshTokenExpiresAt: null },
    });
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });

  res.json({ success: true, data: { message: 'Logged out successfully' } });
});

// ─── GET /me ──────────────────────────────────────────────────────────────────

authRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      email: true,
      role: true,
      tenantId: true,
      createdAt: true,
      tenant: {
        select: { id: true, name: true, slug: true, plan: true, apiKey: true },
      },
    },
  });

  if (!user) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    return;
  }

  res.json({ success: true, data: { user } });
});
