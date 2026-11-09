import http from 'node:http';

export function createMockGateway(options = {}) {
  const {
    latency = 10,
    rateLimitAfter = 100,
    simulateGuardrail = false,
  } = options;

  let requestCount = 0;
  const requests = [];

  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      requestCount++;
      const recorded = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: body ? safeJsonParse(body) : null,
        timestamp: Date.now(),
      };
      requests.push(recorded);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      setTimeout(() => {
        // Health check
        if (req.url === '/health') {
          res.writeHead(200);
          res.end(JSON.stringify({ status: 'ok', service: 'vectrabase-api' }));
          return;
        }

        // Demo session auth
        if (req.url === '/api/auth/demo-session') {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              accessToken: 'mock-jwt-access-token-demo-12345',
              refreshToken: 'mock-jwt-refresh-token-demo-67890',
              role: 'DEMO_ADMIN',
            },
          }));
          return;
        }

        // Token refresh
        if (req.url === '/api/auth/refresh') {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              accessToken: 'mock-refreshed-jwt-access-token',
              refreshToken: 'mock-refreshed-jwt-refresh-token',
            },
          }));
          return;
        }

        // Rate limit trigger
        if (requestCount > rateLimitAfter) {
          res.setHeader('Retry-After', '60');
          res.writeHead(429);
          res.end(JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please slow down.',
            code: 'RATE_LIMITED',
          }));
          return;
        }

        // Guardrail block trigger
        if (simulateGuardrail || (body && body.includes('ignore previous instructions'))) {
          res.writeHead(400);
          res.end(JSON.stringify({
            error: 'Bad Request',
            message: 'Your query was blocked by the content guardrail.',
            code: 'GUARDRAIL_BLOCK',
          }));
          return;
        }

        // Standard RAG query endpoint
        if (req.url === '/api/query') {
          const tenantId = req.headers['x-tenant-id'] || recorded.body?.tenantId;
          const query = recorded.body?.query || '';
          const isCacheHit = query.toLowerCase().includes('sub-2ms') || query.toLowerCase().includes('redis');

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              answer: `Grounded answer for query: "${query}" from VectraBase AI pgvector engine.`,
              confidence: 0.96,
              matchScore: isCacheHit ? 0.99 : 0.88,
              latencyMs: isCacheHit ? 1.4 : 124.6,
              cacheHit: isCacheHit,
              cacheStatus: isCacheHit ? 'HIT' : 'MISS',
              citations: [
                {
                  documentName: 'VectraBase-Architecture.pdf',
                  chunkId: 'chunk-uuid-001',
                  text: 'VectraBase utilizes pgvector HNSW indexing with Redis semantic caching.',
                },
              ],
            },
          }));
          return;
        }

        // Fallback 404
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
      }, latency);
    });
  });

  function safeJsonParse(str) {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  }

  return {
    start: (port = 0) =>
      new Promise((resolve) => {
        server.listen(port, () => {
          const actualPort = server.address().port;
          resolve({
            port: actualPort,
            url: `http://localhost:${actualPort}`,
            close: () =>
              new Promise((done) => {
                if (typeof server.closeAllConnections === 'function') {
                  server.closeAllConnections();
                }
                server.close(() => {
                  setImmediate(done);
                });
              }),
            getRequests: () => [...requests],
            resetRequests: () => {
              requests.length = 0;
              requestCount = 0;
            },
          });
        });
      }),
  };
}

export async function probeLiveEndpoint(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    return {
      reachable: true,
      status: res.status,
      ok: res.ok,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      reachable: false,
      error: err.message,
    };
  }
}
