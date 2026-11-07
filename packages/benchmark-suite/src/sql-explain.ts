// VectraBase AI — SQL EXPLAIN ANALYZE Runner
// Author: Karthik Kathari (github.com/Karthik-Kathari)
// Runs EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) on the cursor-pagination query
// and saves structured results to results/explain-{timestamp}.json

import "dotenv/config";
import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set in environment");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 3 });

// Ensure results directory exists
const RESULTS_DIR = path.resolve(process.cwd(), "results");
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

interface ExplainResult {
  query: string;
  description: string;
  planJson: unknown;
  executionTimeMs: number;
  planningTimeMs: number;
  totalTimeMs: number;
  timestamp: string;
}

interface ExplainReport {
  runAt: string;
  databaseUrl: string;
  queries: ExplainResult[];
  summary: {
    keysetCursorP50EstimateMs: number;
    worstCaseMs: number;
    indexesUsed: string[];
  };
}

/** Extract planning and execution times from JSON EXPLAIN output */
function extractTimes(planJson: unknown): { planningTimeMs: number; executionTimeMs: number } {
  if (!Array.isArray(planJson) || planJson.length === 0) {
    return { planningTimeMs: 0, executionTimeMs: 0 };
  }
  const root = planJson[0] as Record<string, unknown>;
  return {
    planningTimeMs: typeof root["Planning Time"] === "number" ? (root["Planning Time"] as number) : 0,
    executionTimeMs: typeof root["Execution Time"] === "number" ? (root["Execution Time"] as number) : 0,
  };
}

/** Extract index names mentioned in a JSON plan */
function extractIndexNames(planJson: unknown): string[] {
  const indexes: string[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (typeof obj["Index Name"] === "string") {
      indexes.push(obj["Index Name"] as string);
    }
    for (const val of Object.values(obj)) {
      if (typeof val === "object") walk(val);
    }
  };
  walk(planJson);
  return [...new Set(indexes)];
}

async function runExplain(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log("🔍  Running SQL EXPLAIN ANALYZE benchmarks...\n");

    // Get a sample tenant and row for realistic cursor values
    const tenantRes = await client.query<{ id: string }>(
      `SELECT id FROM "Tenant" ORDER BY "createdAt" ASC LIMIT 1`
    );
    const tenantId = tenantRes.rows[0]?.id ?? "00000000-0000-0000-0000-000000000000";

    // Get a mid-table cursor position (simulate deep pagination)
    const cursorRes = await client.query<{ createdAt: Date; id: string }>(
      `SELECT "createdAt", id
       FROM "RagTelemetryLog"
       WHERE "tenantId" = $1
       ORDER BY "createdAt" DESC, id DESC
       OFFSET 50000 LIMIT 1`,
      [tenantId]
    );
    const cursorRow = cursorRes.rows[0];
    const cursorCreatedAt = cursorRow?.createdAt ?? new Date();
    const cursorId = cursorRow?.id ?? "00000000-0000-0000-0000-000000000000";

    // ── Query definitions ───────────────────────────────────────────────────
    const queries: Array<{ description: string; sql: string; params: unknown[] }> = [
      {
        description: "Keyset cursor pagination — first page (no cursor, tenant filter)",
        sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
          SELECT id, "queryText", "totalLatencyMs", "cacheHit", "createdAt"
          FROM "RagTelemetryLog"
          WHERE "tenantId" = $1
          ORDER BY "createdAt" DESC, id DESC
          LIMIT 50`,
        params: [tenantId],
      },
      {
        description: "Keyset cursor pagination — deep page at offset 50,000",
        sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
          SELECT id, "queryText", "totalLatencyMs", "cacheHit", "createdAt"
          FROM "RagTelemetryLog"
          WHERE "tenantId" = $1
            AND ("createdAt", id) < ($2, $3)
          ORDER BY "createdAt" DESC, id DESC
          LIMIT 50`,
        params: [tenantId, cursorCreatedAt, cursorId],
      },
      {
        description: "Cache hit aggregation — count + ratio over 24h",
        sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
          SELECT
            COUNT(*) FILTER (WHERE "cacheHit" = true)  AS cache_hits,
            COUNT(*)                                     AS total_queries,
            ROUND(
              COUNT(*) FILTER (WHERE "cacheHit" = true)::numeric /
              NULLIF(COUNT(*), 0) * 100, 2
            )                                            AS hit_rate_pct,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "totalLatencyMs") AS p50_ms,
            PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY "totalLatencyMs") AS p99_ms
          FROM "RagTelemetryLog"
          WHERE "tenantId" = $1
            AND "createdAt" >= NOW() - interval '24 hours'`,
        params: [tenantId],
      },
      {
        description: "Full table count — verify 1M rows",
        sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
          SELECT COUNT(*) FROM "RagTelemetryLog"`,
        params: [],
      },
    ];

    const results: ExplainResult[] = [];
    const allIndexes: string[] = [];

    for (const q of queries) {
      console.log(`  ► ${q.description}`);
      const before = Date.now();
      const res = await client.query<{ "QUERY PLAN": unknown[] }>(q.sql, q.params);
      const wallMs = Date.now() - before;

      const planJson = res.rows[0]?.["QUERY PLAN"] ?? [];
      const { planningTimeMs, executionTimeMs } = extractTimes(planJson);
      const idxNames = extractIndexNames(planJson);
      allIndexes.push(...idxNames);

      const result: ExplainResult = {
        query: q.sql.replace(/\n\s+/g, " ").trim(),
        description: q.description,
        planJson,
        executionTimeMs,
        planningTimeMs,
        totalTimeMs: wallMs,
        timestamp: new Date().toISOString(),
      };

      results.push(result);

      console.log(
        `     Planning: ${planningTimeMs.toFixed(2)}ms  |  Execution: ${executionTimeMs.toFixed(2)}ms  |  Wall: ${wallMs}ms`
      );
      if (idxNames.length > 0) {
        console.log(`     Indexes:  ${idxNames.join(", ")}`);
      }
      console.log();
    }

    // ── Build report ────────────────────────────────────────────────────────
    const keysetDeepResult = results[1];
    const report: ExplainReport = {
      runAt: new Date().toISOString(),
      databaseUrl: DATABASE_URL!.replace(/:\/\/[^@]+@/, "://***:***@"), // mask credentials
      queries: results,
      summary: {
        keysetCursorP50EstimateMs: keysetDeepResult?.executionTimeMs ?? 0,
        worstCaseMs: Math.max(...results.map((r) => r.executionTimeMs)),
        indexesUsed: [...new Set(allIndexes)],
      },
    };

    // ── Save report ─────────────────────────────────────────────────────────
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const outPath = path.join(RESULTS_DIR, `explain-${timestamp}.json`);
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");

    console.log(`\n✓  EXPLAIN report saved → ${outPath}`);
    console.log(`\n📊  Summary:`);
    console.log(`   Keyset cursor deep page execution:  ${report.summary.keysetCursorP50EstimateMs.toFixed(2)}ms`);
    console.log(`   Worst query execution time:         ${report.summary.worstCaseMs.toFixed(2)}ms`);
    console.log(`   Indexes used:                       ${report.summary.indexesUsed.join(", ") || "none detected"}`);

    if (report.summary.keysetCursorP50EstimateMs > 50) {
      console.warn(`\n⚠️  Keyset cursor p50 exceeded 50ms target. Check index on ("tenantId", "createdAt" DESC, id DESC).`);
    } else {
      console.log(`\n🎉  Keyset cursor pagination within performance targets!`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runExplain().catch((err: unknown) => {
  console.error("❌  EXPLAIN run failed:", err);
  process.exit(1);
});
