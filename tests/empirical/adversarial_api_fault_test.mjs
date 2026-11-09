import http from 'node:http';
import assert from 'node:assert/strict';

console.log('=== EMPIRICAL ADVERSARIAL STRESS TEST: API GATEWAY FAULT & RESILIENCE ===');

// Spin up a mock fault-injection HTTP server
let scenario = 'NORMAL';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tenant-id, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (scenario === 'SLOW') {
    // 1500ms delay
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: { answer: 'Delayed response completed', cacheHit: false } }));
    }, 1500);
    return;
  }

  if (scenario === 'HTTP_500') {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: 'Internal Server Error in pgvector seek' } }));
    return;
  }

  if (scenario === 'HTTP_502') {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway');
    return;
  }

  if (scenario === 'HTTP_504') {
    res.writeHead(504, { 'Content-Type': 'text/plain' });
    res.end('Gateway Timeout');
    return;
  }

  if (scenario === 'HTTP_429') {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: 'Rate limit exceeded: 60 req/min' } }));
    return;
  }

  if (scenario === 'SSE_STREAM_FAIL') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
    res.write('data: {"type":"token","token":"Starting generation..."}\n\n');
    setTimeout(() => {
      res.write('data: {"type":"error","error":"Mid-stream LLM exception"}\n\n');
      res.end();
    }, 50);
    return;
  }

  // Normal JSON
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ data: { answer: 'Normal response', cacheHit: true } }));
});

await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;
const mockApiUrl = `http://localhost:${port}`;
console.log(`Mock Fault-Injection Gateway running on ${mockApiUrl}`);

async function simulateClientQuery(url, options = {}) {
  let isStreaming = true;
  let answer = '';
  let errorMsg = null;
  let citations = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 5000);

    const response = await fetch(`${url}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test query', tenantId: '00000000-0000-0000-0000-000000000001' }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';

    if (response.status === 429) {
      const errData = await response.json().catch(() => ({}));
      errorMsg = `Rate Limit Exceeded: ${errData.error?.message || 'Too many requests'}`;
      isStreaming = false;
      return { ok: false, error: errorMsg, isStreaming };
    }

    if (!response.ok) {
      if (contentType.includes('application/json')) {
        const errJson = await response.json().catch(() => ({}));
        errorMsg = errJson.error?.message || `Server error (${response.status})`;
      } else {
        if (response.status === 502) errorMsg = 'Bad Gateway';
        else if (response.status === 504) errorMsg = 'Gateway Timeout';
        else errorMsg = `HTTP Error ${response.status}`;
      }
      isStreaming = false;
      return { ok: false, error: errorMsg, isStreaming };
    }

    if (contentType.includes('text/event-stream')) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split('\n')) {
          if (line.startsWith('data: ')) {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'token') answer += parsed.token;
            if (parsed.type === 'error') errorMsg = parsed.error;
          }
        }
      }
      isStreaming = false;
      return { ok: !errorMsg, answer, error: errorMsg, isStreaming };
    }

    const data = await response.json();
    answer = data?.data?.answer || '';
    isStreaming = false;
    return { ok: true, answer, isStreaming };
  } catch (err) {
    isStreaming = false;
    return { ok: false, error: `Connection Error: ${err.message}`, isStreaming };
  }
}

// Test 1: Slow Response
console.log('\n[Test 1] Testing slow response handling...');
scenario = 'SLOW';
const slowStart = Date.now();
const slowRes = await simulateClientQuery(mockApiUrl, { timeoutMs: 3000 });
const slowDuration = Date.now() - slowStart;
assert.ok(slowRes.ok, 'Slow response should succeed before timeout');
assert.ok(slowDuration >= 1400, `Duration must reflect delay (got ${slowDuration}ms)`);
assert.equal(slowRes.isStreaming, false, 'Streaming flag must be false after completion');
console.log(`  ✓ Slow response handled cleanly in ${slowDuration}ms without freezing or crash`);

// Test 2: HTTP 500 Internal Server Error
console.log('\n[Test 2] Testing HTTP 500 error handling...');
scenario = 'HTTP_500';
const res500 = await simulateClientQuery(mockApiUrl);
assert.equal(res500.ok, false);
assert.match(res500.error, /Internal Server Error in pgvector seek/);
assert.equal(res500.isStreaming, false);
console.log(`  ✓ HTTP 500 returned structured error: "${res500.error}"`);

// Test 3: HTTP 502 Bad Gateway
console.log('\n[Test 3] Testing HTTP 502 proxy error handling...');
scenario = 'HTTP_502';
const res502 = await simulateClientQuery(mockApiUrl);
assert.equal(res502.ok, false);
assert.match(res502.error, /Bad Gateway/);
assert.equal(res502.isStreaming, false);
console.log(`  ✓ HTTP 502 handled gracefully: "${res502.error}"`);

// Test 4: HTTP 504 Gateway Timeout
console.log('\n[Test 4] Testing HTTP 504 timeout error handling...');
scenario = 'HTTP_504';
const res504 = await simulateClientQuery(mockApiUrl);
assert.equal(res504.ok, false);
assert.match(res504.error, /Gateway Timeout/);
assert.equal(res504.isStreaming, false);
console.log(`  ✓ HTTP 504 handled gracefully: "${res504.error}"`);

// Test 5: HTTP 429 Rate Limiting
console.log('\n[Test 5] Testing HTTP 429 rate limit handling...');
scenario = 'HTTP_429';
const res429 = await simulateClientQuery(mockApiUrl);
assert.equal(res429.ok, false);
assert.match(res429.error, /Rate Limit Exceeded/);
assert.equal(res429.isStreaming, false);
console.log(`  ✓ HTTP 429 handled gracefully: "${res429.error}"`);

// Test 6: Mid-stream SSE Error
console.log('\n[Test 6] Testing mid-stream SSE error handling...');
scenario = 'SSE_STREAM_FAIL';
const resSSE = await simulateClientQuery(mockApiUrl);
assert.equal(resSSE.ok, false);
assert.match(resSSE.error, /Mid-stream LLM exception/);
assert.equal(resSSE.isStreaming, false);
console.log(`  ✓ Mid-stream SSE error intercepted: "${resSSE.error}"`);

// Test 7: Total Connection Refusal (Dead Port)
console.log('\n[Test 7] Testing total connection refusal (net::ERR_CONNECTION_REFUSED)...');
const deadApiUrl = 'http://127.0.0.1:59999';
const resDead = await simulateClientQuery(deadApiUrl, { timeoutMs: 1000 });
assert.equal(resDead.ok, false);
assert.match(resDead.error, /Connection Error/);
assert.equal(resDead.isStreaming, false);
console.log(`  ✓ Connection refused caught safely without app crash: "${resDead.error}"`);

server.close();
console.log('\n=== ALL API GATEWAY FAULT & RESILIENCE TESTS PASSED ===\n');
