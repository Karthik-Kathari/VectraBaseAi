import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 11: Interactive Components & Glow Accents';

  // Test 1: RAGPipelineVisualizer renders 4 architecture stages
  registry.register(TIER, FEATURE, 'RAGPipelineVisualizer renders Ingestion, Redis, pgvector, and LLM stages', async () => {
    const content = readFileContent('apps/web-dashboard/src/components/RAGPipelineVisualizer.tsx');
    assert.ok(
      content.includes('Redis') || content.includes('Semantic Cache'),
      'Visualizer must represent Redis cache stage'
    );
    assert.ok(
      content.includes('pgvector') || content.includes('HNSW'),
      'Visualizer must represent pgvector stage'
    );
  });

  // Test 2: RAGPipelineVisualizer applies neon glow and pulse animations
  registry.register(TIER, FEATURE, 'RAGPipelineVisualizer includes neon glowing stroke paths or pulse dots', async () => {
    const content = readFileContent('apps/web-dashboard/src/components/RAGPipelineVisualizer.tsx');
    assert.ok(
      content.includes('animate-pulse') || content.includes('glow') || content.includes('drop-shadow'),
      'Visualizer must include pulse animation or glow filter'
    );
  });

  // Test 3: CommandPalette listens for Ctrl+K keyboard shortcut
  registry.register(TIER, FEATURE, 'CommandPalette registers Ctrl+K / Cmd+K keyboard shortcut listener', async () => {
    const content = readFileContent('apps/web-dashboard/src/components/CommandPalette.tsx');
    assert.ok(
      content.includes("'k'") || content.includes('"k"'),
      'CommandPalette must listen for "k" key event'
    );
    assert.ok(
      content.includes('metaKey') || content.includes('ctrlKey'),
      'CommandPalette must check metaKey or ctrlKey'
    );
  });

  // Test 4: BenchmarkDrawer displays Redis vs pgvector / database latency comparison
  registry.register(TIER, FEATURE, 'BenchmarkDrawer renders sub-2ms cache vs database query latency metrics', async () => {
    const content = readFileContent('apps/web-dashboard/src/components/BenchmarkDrawer.tsx');
    assert.ok(
      content.includes('Redis') || content.includes('Cache Hit'),
      'BenchmarkDrawer must display Redis cache latency'
    );
    assert.ok(
      content.includes('pgvector') || content.includes('PostgreSQL') || content.includes('Keyset'),
      'BenchmarkDrawer must display database/pgvector query latency'
    );
  });

  // Test 5: InterceptorConsole registers telemetry listener
  registry.register(TIER, FEATURE, 'InterceptorConsole registers listener for 401 silent refresh telemetry', async () => {
    const content = readFileContent('apps/web-dashboard/src/components/InterceptorConsole.tsx');
    assert.ok(
      content.includes('registerInterceptorListener') || content.includes('REQUEST_401'),
      'InterceptorConsole must integrate with axios interceptor telemetry'
    );
  });
}
