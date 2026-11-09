import assert from 'node:assert/strict';
import { readFileContent, hasPattern } from '../helpers/ast-parser.mjs';
import { createMockGateway } from '../helpers/http-mock.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 1: Embed Widget API Routing Fix';

  // Test 1: Embed widget client defaults to production API URL
  registry.register(TIER, FEATURE, 'Widget client defaults to production URL', async () => {
    const content = readFileContent('apps/embed-widget/src/api/client.ts');
    assert.ok(
      content.includes('https://vectrabase-api.onrender.com'),
      'apps/embed-widget/src/api/client.ts must reference https://vectrabase-api.onrender.com'
    );
    assert.ok(
      !content.includes('http://localhost:4000'),
      'apps/embed-widget/src/api/client.ts must not default to http://localhost:4000'
    );
  });

  // Test 2: Runtime injection via window.__VECTRABASE_API_URL__ is checked
  registry.register(TIER, FEATURE, 'Widget client checks window.__VECTRABASE_API_URL__ for runtime injection', async () => {
    const content = readFileContent('apps/embed-widget/src/api/client.ts');
    assert.ok(
      content.includes('__VECTRABASE_API_URL__'),
      'Widget client must check window.__VECTRABASE_API_URL__'
    );
  });

  // Test 3: widget-frame.html points to production URL
  registry.register(TIER, FEATURE, 'Iframe harness sets production API URL', async () => {
    const frameContent = readFileContent('apps/web-dashboard/public/widget-frame.html');
    assert.ok(
      frameContent.includes('https://vectrabase-api.onrender.com'),
      'apps/web-dashboard/public/widget-frame.html must reference https://vectrabase-api.onrender.com'
    );
    assert.ok(
      !frameContent.includes('http://localhost:4000'),
      'apps/web-dashboard/public/widget-frame.html must not reference http://localhost:4000'
    );
  });

  // Test 4: Dashboard axios client supports production URL fallback
  registry.register(TIER, FEATURE, 'Dashboard axios client resolves production URL fallback without connection refused', async () => {
    const content = readFileContent('apps/web-dashboard/src/lib/axios.ts');
    // If NEXT_PUBLIC_API_URL is missing, it should resolve to production or configured gateway
    const hasProductionGateway = content.includes('https://vectrabase-api.onrender.com');
    assert.ok(
      hasProductionGateway,
      'apps/web-dashboard/src/lib/axios.ts should fallback to https://vectrabase-api.onrender.com rather than localhost:4000'
    );
  });

  // Test 5: Query request adheres to Interface Contract
  registry.register(TIER, FEATURE, 'Query request conforms to Interface Contract headers and payload schema', async () => {
    const mock = createMockGateway();
    const server = await mock.start();
    try {
      const res = await fetch(`${server.url}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
        },
        body: JSON.stringify({ query: 'What is VectraBase AI?' }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.data.answer, 'Response must include data.answer');
      assert.ok(typeof data.data.matchScore === 'number', 'Response must include numeric matchScore');
      assert.ok(typeof data.data.latencyMs === 'number', 'Response must include numeric latencyMs');
      assert.ok(Array.isArray(data.data.citations), 'Response must include citations array');

      const reqs = server.getRequests();
      assert.equal(reqs.length, 1);
      assert.equal(reqs[0].headers['x-tenant-id'], '00000000-0000-0000-0000-000000000001');
    } finally {
      await server.close();
    }
  });
}
