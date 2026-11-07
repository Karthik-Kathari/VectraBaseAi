/**
 * VectraBase AI — Autocannon High-Concurrency Load Tester
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

// @ts-ignore
import autocannon from 'autocannon';
import * as fs from 'fs';
import * as path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const RESULTS_DIR = path.join(__dirname, '../results');

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

async function runLoadTests() {
  console.log(`\n============================================================`);
  console.log(`  VectraBase AI — Autocannon Load & Stress Tester`);
  console.log(`  Target Gateway: ${API_URL}`);
  console.log(`  Author: Karthik Kathari (github.com/Karthik-Kathari)`);
  console.log(`============================================================\n`);

  // 1. Health Baseline Test
  console.log('⚡ Benchmark 1/3: Testing /health throughput...');
  const healthResult = await autocannon({
    url: `${API_URL}/health`,
    connections: 20,
    pipelining: 10,
    duration: 10,
  });

  console.log(`✓ Health Endpoint: ${healthResult.requests.average.toFixed(0)} req/sec (p99: ${healthResult.latency.p99}ms)`);

  // 2. Keyset Telemetry Pagination Test (1M-row scan)
  console.log('\n⚡ Benchmark 2/3: Testing /api/telemetry Keyset Pagination (Limit 50)...');
  const telemetryResult = await autocannon({
    url: `${API_URL}/api/telemetry?limit=50`,
    connections: 15,
    pipelining: 5,
    duration: 10,
  });

  console.log(`✓ 1M Keyset Telemetry: ${telemetryResult.requests.average.toFixed(0)} req/sec (p99: ${telemetryResult.latency.p99}ms)`);

  // 3. Redis Cache Hit Speed Test
  console.log('\n⚡ Benchmark 3/3: Testing /api/query Redis Semantic Cache Hits...');
  const queryResult = await autocannon({
    url: `${API_URL}/api/query`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'How does VectraBase AI achieve sub-2ms latency?',
      tenantId: '00000000-0000-0000-0000-000000000001',
    }),
    connections: 10,
    duration: 10,
  });

  console.log(`✓ Query Cache Hits: ${queryResult.requests.average.toFixed(0)} req/sec (p99: ${queryResult.latency.p99}ms)`);

  const report = {
    timestamp: new Date().toISOString(),
    testedBy: 'Karthik Kathari',
    benchmarks: {
      healthEndpoint: {
        rps: healthResult.requests.average,
        latencyP50: healthResult.latency.p50,
        latencyP99: healthResult.latency.p99,
      },
      keysetPagination1M: {
        rps: telemetryResult.requests.average,
        latencyP50: telemetryResult.latency.p50,
        latencyP99: telemetryResult.latency.p99,
      },
      redisCacheHitQuery: {
        rps: queryResult.requests.average,
        latencyP50: queryResult.latency.p50,
        latencyP99: queryResult.latency.p99,
      },
    },
  };

  const reportPath = path.join(RESULTS_DIR, `load-test-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n🎉 Load benchmark report saved to: ${reportPath}\n`);
}

runLoadTests().catch(console.error);
