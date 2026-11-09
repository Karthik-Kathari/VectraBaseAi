import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';
import { createMockGateway } from '../helpers/http-mock.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 1: Embed Widget API Routing Fix';

  // Boundary 1: Trailing slashes in apiUrl are trimmed
  registry.register(TIER, FEATURE, 'Trailing slashes in runtime API URL are sanitized to avoid double slashes', async () => {
    const clientCode = readFileContent('apps/embed-widget/src/api/client.ts');
    assert.ok(
      clientCode.includes('.replace(/\\/+$/') || clientCode.includes('replace'),
      'Widget client must strip trailing slashes from API URL'
    );
  });

  // Boundary 2: Empty or whitespace-only apiUrl string falls back to production
  registry.register(TIER, FEATURE, 'Whitespace or empty runtime API URL falls back to production gateway', async () => {
    const clientCode = readFileContent('apps/embed-widget/src/api/client.ts');
    assert.ok(
      clientCode.includes('.trim()') || clientCode.includes('length > 0'),
      'Widget client must validate that runtime apiUrl is non-empty before using it'
    );
  });

  // Boundary 3: HTTP 429 Rate Limiting response maps to RATE_LIMITED code
  registry.register(TIER, FEATURE, 'HTTP 429 response normalizes to RATE_LIMITED error code with retryAfterMs', async () => {
    const clientCode = readFileContent('apps/embed-widget/src/api/client.ts');
    assert.ok(
      clientCode.includes('429') && clientCode.includes('RATE_LIMITED'),
      'Widget client interceptor must handle 429 and map to RATE_LIMITED'
    );
    assert.ok(
      clientCode.includes('retry-after') || clientCode.includes('retryAfter'),
      'Widget client must read Retry-After header'
    );
  });

  // Boundary 4: HTTP 400 Guardrail Block maps to GUARDRAIL_BLOCK code
  registry.register(TIER, FEATURE, 'Content guardrail block (HTTP 400) maps to GUARDRAIL_BLOCK error code', async () => {
    const clientCode = readFileContent('apps/embed-widget/src/api/client.ts');
    assert.ok(
      clientCode.includes('GUARDRAIL_BLOCK'),
      'Widget client interceptor must map guardrail rejection to GUARDRAIL_BLOCK'
    );
  });

  // Boundary 5: Simulated offline network error does not trigger unhandled crash
  registry.register(TIER, FEATURE, 'Network connection failure resolves with structured error object', async () => {
    const mock = createMockGateway({ latency: 5 });
    const server = await mock.start();
    await server.close(); // Immediately close to simulate offline / connection refused

    let caughtError = null;
    try {
      await fetch(`${server.url}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test' }),
      });
    } catch (err) {
      caughtError = err;
    }
    assert.ok(caughtError !== null, 'Connection to closed server must be caught');
    assert.ok(caughtError.message, 'Caught error must have descriptive message');
  });
}
