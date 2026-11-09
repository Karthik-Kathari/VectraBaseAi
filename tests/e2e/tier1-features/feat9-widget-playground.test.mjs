import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 9: Widget Playground & Lab Redesign';

  // Test 1: Widget playground references production API URL for queries
  registry.register(TIER, FEATURE, '/widget-playground targets https://vectrabase-api.onrender.com for queries', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      content.includes('https://vectrabase-api.onrender.com'),
      '/widget-playground must reference https://vectrabase-api.onrender.com'
    );
  });

  // Test 2: Embed snippet template specifies production API URL
  registry.register(TIER, FEATURE, 'Embed code snippet specifies production API endpoint in init script', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      content.includes("apiUrl: 'https://vectrabase-api.onrender.com'") ||
        content.includes('apiUrl: "https://vectrabase-api.onrender.com"'),
      'Embed snippet must configure production apiUrl'
    );
  });

  // Test 3: Embed snippet does not contain localhost:4000
  registry.register(TIER, FEATURE, 'Embed snippet contains zero localhost:4000 references', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    // Extract the embedSnippet variable
    const snippetMatch = content.match(/embedSnippet\s*=\s*`([\s\S]*?)`/);
    assert.ok(snippetMatch, 'page.tsx must define embedSnippet');
    assert.ok(
      !snippetMatch[1].includes('localhost:4000'),
      'Embed snippet must not contain localhost:4000'
    );
  });

  // Test 4: Playground renders live query runner and answer panel
  registry.register(TIER, FEATURE, 'Playground provides interactive query execution with answer state', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      content.includes('runLiveQuery') || content.includes('simulateWidgetQuery'),
      'Playground must implement query test function'
    );
    assert.ok(
      content.includes('answerOutput'),
      'Playground must display answer output state'
    );
  });

  // Test 5: Playground renders embedded iframe preview
  registry.register(TIER, FEATURE, 'Playground renders preview iframe container with widget-frame.html', async () => {
    const content = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      content.includes('<iframe') || content.includes('iframeHtml'),
      'Playground must embed or render widget preview iframe'
    );
  });
}
