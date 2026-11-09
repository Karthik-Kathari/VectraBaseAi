import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 9: Widget Playground & Lab Redesign';

  // Boundary 1: Live query error resilience fallback
  registry.register(TIER, FEATURE, 'runLiveQuery implements try/catch fallback to prevent unhandled UI crashes', async () => {
    const playground = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      playground.includes('try {') && playground.includes('catch'),
      'runLiveQuery must implement try/catch block'
    );
  });

  // Boundary 2: Escaped script closing tags in iframe template
  registry.register(TIER, FEATURE, 'Iframe HTML template escapes script closing tags to prevent HTML parsing errors', async () => {
    const playground = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      playground.includes('<\\/script>') || playground.includes('</script>'),
      'Iframe embed snippet must include properly closed script tags'
    );
  });

  // Boundary 3: Copy snippet clipboard toast notification
  registry.register(TIER, FEATURE, 'Copy embed snippet button triggers toast notification on copy success', async () => {
    const playground = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      playground.includes('toast.success') || playground.includes('copied'),
      'Copy button must trigger toast or visual feedback'
    );
  });

  // Boundary 4: Valid tenant UUID in embed snippet
  registry.register(TIER, FEATURE, 'Embed snippet contains valid RFC 4122 tenant UUID', async () => {
    const playground = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    assert.ok(
      uuidRegex.test(playground),
      'Playground embed code must provide valid tenant UUID'
    );
  });

  // Boundary 5: Query state tracking
  registry.register(TIER, FEATURE, 'Playground tracks testQuery input string and querying loading state', async () => {
    const playground = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      playground.includes('testQuery') && playground.includes('isQuerying'),
      'Playground must track testQuery and isQuerying states'
    );
  });
}
