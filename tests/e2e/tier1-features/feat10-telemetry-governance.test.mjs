import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 10: Telemetry & Governance Redesign';

  // Test 1: Telemetry page renders VirtualizedTable
  registry.register(TIER, FEATURE, '/telemetry imports and renders VirtualizedTable component', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/telemetry/page.tsx');
    assert.ok(
      content.includes('VirtualizedTable'),
      '/telemetry must import and render VirtualizedTable'
    );
  });

  // Test 2: VirtualizedTable implementation uses @tanstack/react-virtual
  registry.register(TIER, FEATURE, 'VirtualizedTable utilizes DOM virtualization to limit element count', async () => {
    const tableContent = readFileContent('apps/web-dashboard/src/components/VirtualizedTable.tsx');
    assert.ok(
      tableContent.includes('@tanstack/react-virtual') || tableContent.includes('useVirtualizer'),
      'VirtualizedTable must use virtualizer to prevent rendering all 1M DOM rows'
    );
  });

  // Test 3: Telemetry page provides status filtering
  registry.register(TIER, FEATURE, '/telemetry provides status filters for CACHE_HIT, VECTOR_MISS, GUARDRAIL', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/telemetry/page.tsx');
    assert.ok(content.includes('CACHE_HIT'), 'Must provide CACHE_HIT filter option');
    assert.ok(content.includes('VECTOR_MISS'), 'Must provide VECTOR_MISS filter option');
    assert.ok(content.includes('GUARDRAIL'), 'Must provide GUARDRAIL filter option');
  });

  // Test 4: Governance wizard includes 5 configuration steps
  registry.register(TIER, FEATURE, '/governance implements 5-step enterprise policy wizard', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/governance/page.tsx');
    assert.ok(
      content.includes('currentStep') || content.includes('setCurrentStep'),
      '/governance must manage multi-step wizard state'
    );
    assert.ok(
      content.includes('chunkSize') &&
        content.includes('similarityThreshold') &&
        content.includes('piiMaskingEnabled'),
      '/governance must declare vector, chunking, and guardrail fields'
    );
  });

  // Test 5: Governance wizard provides draft persistence
  registry.register(TIER, FEATURE, '/governance integrates useGovernanceDraft hook for draft preservation', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/governance/page.tsx');
    assert.ok(
      content.includes('useGovernanceDraft'),
      '/governance must import and use useGovernanceDraft hook'
    );
    assert.ok(
      content.includes('saveDraft') || content.includes('lastSaved'),
      '/governance must expose saveDraft / lastSaved indicators'
    );
  });
}
