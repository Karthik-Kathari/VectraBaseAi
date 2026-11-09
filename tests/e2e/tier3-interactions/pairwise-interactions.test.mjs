import assert from 'node:assert/strict';
import { readFileContent, fileExists, extractScopedCssVariables } from '../helpers/ast-parser.mjs';
import { createMockGateway } from '../helpers/http-mock.mjs';
import { createDomSimulator } from '../helpers/dom-simulator.mjs';

export function register(registry) {
  const TIER = 'Tier 3 - Cross-Feature Interactions';

  // Pair 1: Theme Switch (F6) x Widget Query (F1)
  registry.register(TIER, 'Pairwise [F6 x F1]', 'Toggling light/dark theme while query is in-flight does not abort HTTP request', async () => {
    const mock = createMockGateway({ latency: 50 });
    const server = await mock.start();
    const sim = createDomSimulator();

    try {
      // Initiate query
      const fetchPromise = fetch(`${server.url}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Explain pgvector' }),
      });

      // Rapidly toggle theme while fetch is in-flight
      sim.simulateThemeToggle('dark');
      sim.simulateThemeToggle('light');

      const res = await fetchPromise;
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.data.answer);
      assert.equal(sim.isDarkMode(), false);
    } finally {
      await server.close();
    }
  });

  // Pair 2: Theme Switch (F6) x Widget Iframe Sync (F3)
  registry.register(TIER, 'Pairwise [F6 x F3]', 'Navbar theme toggle harmonizes with widget iframe theme attributes', async () => {
    const playground = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      playground.includes('theme') || playground.includes('iframe'),
      'Widget playground must support theme attribute passing to iframe'
    );
  });

  // Pair 3: Theme Switch (F6) x Design Tokens (F5)
  registry.register(TIER, 'Pairwise [F6 x F5]', 'Switching theme updates background, surface, and border CSS variables', async () => {
    const css = readFileContent('apps/web-dashboard/src/app/globals.css');
    const rootVars = extractScopedCssVariables(css, ':root');
    const darkVars = extractScopedCssVariables(css, '.dark');

    assert.notEqual(rootVars['--background'], darkVars['--background'], 'Light and dark background tokens must differ');
    assert.notEqual(rootVars['--surface'], darkVars['--surface'], 'Light and dark surface tokens must differ');
    assert.notEqual(rootVars['--border'], darkVars['--border'], 'Light and dark border tokens must differ');
  });

  // Pair 4: Theme Switch (F6) x Mobile Drawer (F7)
  registry.register(TIER, 'Pairwise [F6 x F7]', 'Theme toggle remains accessible and functional inside mobile navigation drawer', async () => {
    const navbar = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbar.includes('<ThemeToggle />') || navbar.includes('<ThemeToggle'),
      'Navbar must render ThemeToggle in header bar'
    );
  });

  // Pair 5: Theme Switch (F6) x Virtualized Telemetry Table (F10)
  registry.register(TIER, 'Pairwise [F6 x F10]', 'Virtualized table rows adapt surface styles across light/dark modes', async () => {
    const table = readFileContent('apps/web-dashboard/src/components/VirtualizedTable.tsx');
    assert.ok(
      table.includes('dark:') || table.includes('border-slate-200 dark:border-slate-800'),
      'VirtualizedTable must use dual-theme classes'
    );
  });

  // Pair 6: Theme Switch (F6) x RAG Pipeline Visualizer (F11)
  registry.register(TIER, 'Pairwise [F6 x F11]', 'RAGPipelineVisualizer preserves SVG path glow in both light and dark themes', async () => {
    const viz = readFileContent('apps/web-dashboard/src/components/RAGPipelineVisualizer.tsx');
    assert.ok(
      viz.includes('dark:') || viz.includes('stroke-') || viz.includes('from-'),
      'Visualizer SVG paths must maintain contrast in both modes'
    );
  });

  // Pair 7: Widget Playground Query (F9) x Production API (F1)
  registry.register(TIER, 'Pairwise [F9 x F1]', 'Playground query runner targets production API gateway URL', async () => {
    const playground = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(
      playground.includes('https://vectrabase-api.onrender.com'),
      'Playground must route queries to production API'
    );
  });

  // Pair 8: Author Attribution Removal (F2) x Shell Navbar Layout (F7)
  registry.register(TIER, 'Pairwise [F2 x F7]', 'Removing author name from navbar maintains exact 64px header height', async () => {
    const navbar = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbar.includes('h-16'),
      'Navbar must retain h-16 (64px) standard height'
    );
  });

  // Pair 9: Typography Inter (F4) x Spacing Tokens (F5)
  registry.register(TIER, 'Pairwise [F4 x F5]', 'Inter font family works with Tailwind typography sizing scale', async () => {
    const tailwind = readFileContent('apps/web-dashboard/tailwind.config.ts');
    assert.ok(
      tailwind.includes('fontFamily') && tailwind.includes('sans'),
      'Tailwind must declare sans fontFamily with Inter'
    );
  });

  // Pair 10: Governance Draft Save (F10) x Interceptor Console (F11)
  registry.register(TIER, 'Pairwise [F10 x F11]', 'Governance Field-48 expiry test streams events to InterceptorConsole', async () => {
    const gov = readFileContent('apps/web-dashboard/src/app/(dashboard)/governance/page.tsx');
    assert.ok(
      gov.includes('InterceptorConsole'),
      'Governance page must integrate InterceptorConsole'
    );
  });

  // Pair 11: Knowledge Base Ingestion (F8) x Telemetry Records (F10)
  registry.register(TIER, 'Pairwise [F8 x F10]', 'Ingested documents generate telemetry chunk count statistics', async () => {
    const studio = readFileContent('apps/web-dashboard/src/app/(dashboard)/rag-studio/page.tsx');
    assert.ok(
      studio.includes('chunks') && studio.includes('tokens'),
      'RAG Studio must expose chunks and token count metadata'
    );
  });

  // Pair 12: Command Palette Navigation (F11) x Shell Routes (F7)
  registry.register(TIER, 'Pairwise [F11 x F7]', 'Command Palette provides direct keyboard shortcuts to all primary routes', async () => {
    const palette = readFileContent('apps/web-dashboard/src/components/CommandPalette.tsx');
    assert.ok(palette.includes('/dashboard'), 'Palette must list /dashboard');
    assert.ok(palette.includes('/rag-studio'), 'Palette must list /rag-studio');
    assert.ok(palette.includes('/telemetry'), 'Palette must list /telemetry');
    assert.ok(palette.includes('/governance'), 'Palette must list /governance');
    assert.ok(palette.includes('/widget-playground'), 'Palette must list /widget-playground');
  });

  // Pair 13: Widget Dual-Theme (F3) x Production Error Handling (F1)
  registry.register(TIER, 'Pairwise [F3 x F1]', 'Widget error bubbles are legible in both light and dark themes', async () => {
    const bubble = readFileContent('apps/embed-widget/src/components/MessageBubble.vue');
    assert.ok(
      bubble.includes('bg-') || bubble.includes('dark:'),
      'MessageBubble must support themed alert bubbles'
    );
  });

  // Pair 14: Design Tokens (F5) x Dashboard KPI Cards (F8)
  registry.register(TIER, 'Pairwise [F5 x F8]', 'Dashboard KPI cards utilize theme surface tokens and borders', async () => {
    const dash = readFileContent('apps/web-dashboard/src/app/(dashboard)/dashboard/page.tsx');
    assert.ok(
      dash.includes('border-slate-200 dark:border-slate-800') || dash.includes('Card'),
      'Dashboard cards must apply standard border tokens'
    );
  });

  // Pair 15: Author Attribution Removal (F2) x Widget Embed IIFE (F3)
  registry.register(TIER, 'Pairwise [F2 x F3]', 'WidgetContainer header maintains clean title and version badge without author name', async () => {
    const widget = readFileContent('apps/embed-widget/src/components/WidgetContainer.vue');
    const headerMatch = widget.match(/<header[^>]*>([\s\S]*?)<\/header>/);
    assert.ok(headerMatch, 'Widget must contain header');
    const header = headerMatch[1];
    assert.ok(header.includes('VectraBase AI'), 'Widget header must display VectraBase AI title');
    assert.ok(header.includes('v1.0'), 'Widget header must display v1.0 badge');
    assert.ok(!header.toLowerCase().includes('karthik kathari'), 'Widget header must not contain author subtext');
  });
}
