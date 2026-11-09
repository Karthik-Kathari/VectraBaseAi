import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 8: Dashboard Pages Redesign';

  // Test 1: /dashboard renders 4 primary KPI stat cards
  registry.register(TIER, FEATURE, '/dashboard renders KPI cards for Knowledge Chunks, Cache Hit Rate, Latency, and Tokens', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/dashboard/page.tsx');
    assert.ok(content.includes('Knowledge Chunks'), '/dashboard must include Knowledge Chunks card');
    assert.ok(content.includes('Instant Cache Hit Rate'), '/dashboard must include Instant Cache Hit Rate card');
    assert.ok(content.includes('Average Response Time'), '/dashboard must include Average Response Time card');
    assert.ok(content.includes('Tokens Saved'), '/dashboard must include Tokens Saved card');
  });

  // Test 2: /dashboard renders recent query stream with latency metrics
  registry.register(TIER, FEATURE, '/dashboard renders recent vector query stream with latency figures', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/dashboard/page.tsx');
    assert.ok(
      content.includes('recentQueries') || content.includes('Recent Queries') || content.includes('sub-2ms'),
      '/dashboard must render recent queries list'
    );
  });

  // Test 3: /rag-studio renders File and URL ingestion tabs
  registry.register(TIER, FEATURE, '/rag-studio renders document ingestion tabs for FILE and URL sources', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/rag-studio/page.tsx');
    assert.ok(content.includes('FILE'), '/rag-studio must support FILE tab');
    assert.ok(content.includes('URL'), '/rag-studio must support URL tab');
  });

  // Test 4: /rag-studio displays indexed document library with chunk counts
  registry.register(TIER, FEATURE, '/rag-studio renders document library table with chunks and sha256', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/rag-studio/page.tsx');
    assert.ok(
      content.includes('chunks') && (content.includes('sha256') || content.includes('SHA256')),
      '/rag-studio must display indexed documents with chunks and sha256 hashes'
    );
  });

  // Test 5: Dashboard pages use theme-aware classes
  registry.register(TIER, FEATURE, 'Dashboard pages apply dual-theme surface classes', async () => {
    const dashContent = readFileContent('apps/web-dashboard/src/app/(dashboard)/dashboard/page.tsx');
    const studioContent = readFileContent('apps/web-dashboard/src/app/(dashboard)/rag-studio/page.tsx');

    assert.ok(dashContent.includes('dark:'), '/dashboard must contain dark: class modifiers');
    assert.ok(studioContent.includes('dark:'), '/rag-studio must contain dark: class modifiers');
  });
}
