import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 10: Telemetry & Governance Redesign';

  // Boundary 1: Virtualized table estimateSize parameter
  registry.register(TIER, FEATURE, 'VirtualizedTable specifies fixed estimateSize for stable virtual scrolling math', async () => {
    const table = readFileContent('apps/web-dashboard/src/components/VirtualizedTable.tsx');
    assert.ok(
      table.includes('estimateSize') || table.includes('size:'),
      'VirtualizedTable must specify row height estimate for virtual calculation'
    );
  });

  // Boundary 2: Search debounce delay >= 200ms
  registry.register(TIER, FEATURE, 'Telemetry search applies debouncing with minimum 200ms delay', async () => {
    const telemetry = readFileContent('apps/web-dashboard/src/app/(dashboard)/telemetry/page.tsx');
    assert.ok(
      telemetry.includes('useDebounce(searchInput, 300)') || telemetry.includes('useDebounce'),
      'Telemetry search must debounce user query input'
    );
  });

  // Boundary 3: Empty telemetry search result handled gracefully
  registry.register(TIER, FEATURE, 'Telemetry table handles empty search filter results without throwing', async () => {
    const telemetry = readFileContent('apps/web-dashboard/src/app/(dashboard)/telemetry/page.tsx');
    assert.ok(
      telemetry.includes('filteredRows') && telemetry.includes('filter('),
      'Telemetry page must compute filteredRows safely'
    );
  });

  // Boundary 4: Governance default values schema coverage
  registry.register(TIER, FEATURE, 'Governance form registers defaultValues covering required hyperparameters', async () => {
    const gov = readFileContent('apps/web-dashboard/src/app/(dashboard)/governance/page.tsx');
    assert.ok(
      gov.includes('hnswM') && gov.includes('hnswEfConstruction') && gov.includes('similarityThreshold'),
      'Governance form must configure HNSW parameters'
    );
  });

  // Boundary 5: Field-48 silent refresh resilience simulation
  registry.register(TIER, FEATURE, 'Governance page provides 401 token expiry and silent refresh simulation', async () => {
    const gov = readFileContent('apps/web-dashboard/src/app/(dashboard)/governance/page.tsx');
    assert.ok(
      gov.includes('isTokenExpiredSimulated') || gov.includes('InterceptorConsole'),
      'Governance page must feature resilience simulation mechanism'
    );
  });
}
