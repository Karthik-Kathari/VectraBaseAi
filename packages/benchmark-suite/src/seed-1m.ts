// VectraBase AI — 1M-Row Deterministic Seed Generator
// Author: Karthik Kathari (github.com/Karthik-Kathari)
// Strategy: PostgreSQL generate_series INSERT for maximum throughput

import "dotenv/config";
import { Pool, type PoolClient } from "pg";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set in environment");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 5 });

async function getTenantId(client: PoolClient): Promise<string> {
  const res = await client.query<{ id: string }>(
    `SELECT id FROM "Tenant" ORDER BY "createdAt" ASC LIMIT 1`
  );
  if (res.rows.length === 0) {
    throw new Error(
      'No tenant found in the database. Run the api-gateway seed first (pnpm --filter api-gateway prisma db seed).'
    );
  }
  return res.rows[0]!.id;
}

async function getCurrentCount(client: PoolClient): Promise<number> {
  const res = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM "RagTelemetryLog"`
  );
  return parseInt(res.rows[0]!.count, 10);
}

async function seed1M(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log("🔍  Connecting to database...");

    const existingCount = await getCurrentCount(client);
    if (existingCount >= 1_000_000) {
      console.log(
        `✓  Table already contains ${existingCount.toLocaleString()} rows — skipping seed.`
      );
      return;
    }

    const remaining = 1_000_000 - existingCount;
    console.log(
      `📊  Existing rows: ${existingCount.toLocaleString()} — seeding ${remaining.toLocaleString()} more rows...`
    );

    const tenantId = await getTenantId(client);
    console.log(`🏢  Using tenant: ${tenantId}`);

    console.log(`🌱  Seeding ${remaining.toLocaleString()} rows...`);
    const start = Date.now();

    await client.query(`SET work_mem = '256MB'`);

    // Use generate_series for maximum INSERT throughput — single statement,
    // no network round-trips per row, let Postgres do the heavy lifting.
    await client.query(
      `
      INSERT INTO "RagTelemetryLog" (
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
      )
      SELECT
        gen_random_uuid(),
        $1::uuid,
        (ARRAY[
          'What is VectraBase AI?',
          'How does pgvector work?',
          'Explain HNSW indexing',
          'What is RAG?',
          'How does Redis caching work?',
          'What is JWT authentication?',
          'Explain vector embeddings',
          'How does Karthik Kathari architect systems?',
          'What is the chunking strategy?',
          'How does the similarity threshold work?'
        ])[floor(random() * 10 + 1)],
        md5(random()::text),
        floor(random() * 150 + 10)::int,
        floor(random() * 200 + 20)::int,
        floor(random() * 500 + 100)::int,
        floor(random() * 800 + 50)::int,
        random() < 0.3,
        random() < 0.05,
        random() < 0.02,
        floor(random() * 5 + 1)::int,
        random() * 0.4 + 0.6,
        floor(random() * 2000 + 100)::int,
        NOW() - (random() * interval '365 days')
      FROM generate_series(1, $2::int)
      `,
      [tenantId, remaining]
    );

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const finalCount = await getCurrentCount(client);

    console.log(`✓  ${finalCount.toLocaleString()} rows seeded in ${elapsed}s`);

    if (finalCount < 1_000_000) {
      console.warn(
        `⚠️  Expected 1,000,000 rows but got ${finalCount.toLocaleString()}. Check for constraint violations.`
      );
    } else {
      console.log(`🎉  1M-row seed complete! Total: ${finalCount.toLocaleString()} rows in ${elapsed}s`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

seed1M().catch((err: unknown) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
