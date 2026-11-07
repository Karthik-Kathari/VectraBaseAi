/**
 * VectraBase AI — Health Check Route
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let redisStatus = 'healthy';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'unhealthy';
  }

  try {
    await redis.ping();
  } catch (error) {
    redisStatus = 'unhealthy';
  }

  const isHealthy = dbStatus === 'healthy' && redisStatus === 'healthy';
  const responseTimeMs = Date.now() - startTime;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    author: 'Karthik Kathari',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'healthy',
      database: dbStatus,
      redis: redisStatus,
    },
    responseTimeMs,
  });
});
