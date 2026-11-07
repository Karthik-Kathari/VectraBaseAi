/**
 * VectraBase AI — Express Application Setup
 * Author: Karthik Kathari
 */

import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import { authRouter } from './routes/auth';
import { documentsRouter } from './routes/documents';
import { telemetryRouter } from './routes/telemetry';
import { governanceRouter } from './routes/governance';
import { queryRouter } from './routes/query';
import { benchmarkRouter } from './routes/benchmark';
import { healthRouter } from './routes/health';

export const app: Application = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const defaultCorsOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://vectrabaseai.vercel.app',
  'https://vectrabase-ai.vercel.app',
];

const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const corsOrigins = Array.from(new Set([...defaultCorsOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        corsOrigins.includes('*') ||
        corsOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  }),
);

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Request Logging ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Trust Proxy (for rate limiting behind reverse proxy) ─────────────────────
app.set('trust proxy', 1);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/governance', governanceRouter);
app.use('/api/query', queryRouter);
app.use('/api/benchmark', benchmarkRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource does not exist',
    },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? err.statusCode ?? 500;
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[Error] ${err.message}`, isDev ? err.stack : '');

  res.status(status).json({
    success: false,
    error: {
      code: status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message: status === 500 && !isDev ? 'An internal server error occurred' : err.message,
      ...(isDev && { stack: err.stack }),
    },
  });
});
