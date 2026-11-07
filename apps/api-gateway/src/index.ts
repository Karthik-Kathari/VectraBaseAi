/**
 * VectraBase AI — API Gateway Entry Point
 * Author: Karthik Kathari
 */

import 'dotenv/config';
import http from 'http';
import { app } from './app';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

const server = http.createServer(app);

async function startServer(): Promise<void> {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log('✅ PostgreSQL connected');

    // Redis connectivity is verified in lib/redis.ts on ready event

    server.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║      VectraBase AI API Gateway — Karthik Kathari         ║');
      console.log('╠══════════════════════════════════════════════════════════╣');
      console.log(`║  🚀  Listening on http://localhost:${PORT}                   ║`);
      console.log(`║  🌍  Environment : ${(process.env.NODE_ENV ?? 'development').padEnd(36)}  ║`);
      console.log(`║  📅  Started at  : ${new Date().toISOString().padEnd(36)}  ║`);
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (err) {
    console.error('❌ Failed to start VectraBase API Gateway:', err);
    process.exit(1);
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  console.log(`\n⚡ ${signal} received — shutting down gracefully...`);

  server.close(async () => {
    console.log('🔌 HTTP server closed');

    try {
      await prisma.$disconnect();
      console.log('🔌 PostgreSQL disconnected');
    } catch (err) {
      console.error('Error disconnecting Prisma:', err);
    }

    try {
      await redis.quit();
      console.log('🔌 Redis disconnected');
    } catch (err) {
      console.error('Error disconnecting Redis:', err);
    }

    console.log('👋 VectraBase AI API Gateway shut down. Goodbye!');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⏰ Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('🔥 Unhandled Promise Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  shutdown('uncaughtException');
});

startServer();
