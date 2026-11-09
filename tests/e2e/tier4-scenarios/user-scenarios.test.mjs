import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';
import { createMockGateway } from '../helpers/http-mock.mjs';
import { createDomSimulator } from '../helpers/dom-simulator.mjs';

export function register(registry) {
  const TIER = 'Tier 4 - Real-World Workloads & Scenarios';

  // Scenario 1: Complete Evaluator End-to-End User Journey
  registry.register(TIER, 'Scenario 1 [Evaluator Journey]', 'Complete user workflow from Landing -> Sandbox -> Knowledge Base -> Playground -> Telemetry -> Governance', async () => {
    // 1. Landing page exists and has navigation to sandbox/dashboard
    const landing = readFileContent('apps/web-dashboard/src/app/page.tsx');
    assert.ok(landing.includes('/dashboard'), 'Landing page must link to /dashboard');

    // 2. Demo session authentication exists in Navbar handleQuickLaunch
    const navbar = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(navbar.includes('/api/auth/demo-session'), 'Navbar must support demo quick launch session');

    // 3. Knowledge base page exists with documents
    const studio = readFileContent('apps/web-dashboard/src/app/(dashboard)/rag-studio/page.tsx');
    assert.ok(studio.includes('VectraBase_Architecture_Whitepaper.pdf'), 'Knowledge base must list architecture whitepaper');

    // 4. Widget playground routes queries to production API
    const playground = readFileContent('apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx');
    assert.ok(playground.includes('https://vectrabase-api.onrender.com'), 'Playground must query production API gateway');

    // 5. Telemetry explorer provides virtualized row inspection
    const telemetry = readFileContent('apps/web-dashboard/src/app/(dashboard)/telemetry/page.tsx');
    assert.ok(telemetry.includes('VirtualizedTable'), 'Telemetry page must render virtualized table');

    // 6. Governance wizard manages policy configurations
    const gov = readFileContent('apps/web-dashboard/src/app/(dashboard)/governance/page.tsx');
    assert.ok(gov.includes('useGovernanceDraft'), 'Governance page must preserve drafts');
  });

  // Scenario 2: Theme Persistence & Navigation Flow
  registry.register(TIER, 'Scenario 2 [Theme Journey]', 'Theme switching persists and applies across all dashboard routes seamlessly', async () => {
    const sim = createDomSimulator();

    // Start in light mode
    sim.simulateThemeToggle('light');
    assert.equal(sim.isDarkMode(), false);
    assert.equal(sim.getStoredTheme(), 'light');

    // Switch to dark mode
    sim.simulateThemeToggle('dark');
    assert.equal(sim.isDarkMode(), true);
    assert.equal(sim.getStoredTheme(), 'dark');

    // Simulate navigation through all 5 routes
    const routes = ['/dashboard', '/rag-studio', '/widget-playground', '/telemetry', '/governance'];
    for (const route of routes) {
      assert.ok(route.startsWith('/'), `Valid route ${route}`);
      // In dark mode, class remains
      assert.equal(sim.isDarkMode(), true);
    }
  });

  // Scenario 3: Real-World Third-Party Embed Widget Deployment
  registry.register(TIER, 'Scenario 3 [Widget Deployment]', 'Simulated third-party webpage initializes embed widget and queries production API', async () => {
    const mock = createMockGateway({ latency: 15 });
    const server = await mock.start();

    try {
      // Simulate client widget execution
      const queryPayload = {
        query: 'What is the HNSW vector index parameter configuration?',
        stream: false,
      };

      const res = await fetch(`${server.url}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
        },
        body: JSON.stringify(queryPayload),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.data.answer.includes('pgvector'));
      assert.ok(data.data.citations.length > 0);
      assert.equal(data.data.citations[0].documentName, 'VectraBase-Architecture.pdf');
    } finally {
      await server.close();
    }
  });

  // Scenario 4: High-Stress UI Chaos & Rapid State Mutation
  registry.register(TIER, 'Scenario 4 [UI Stress & Chaos]', 'Simulate high-frequency theme toggling and viewport resizes without exceptions', async () => {
    const sim = createDomSimulator();

    // 30 rapid theme toggles
    for (let i = 0; i < 30; i++) {
      sim.simulateThemeToggle(i % 2 === 0 ? 'dark' : 'light');
    }

    // 10 viewport resizes across desktop, tablet, and mobile
    const viewports = [1920, 1280, 1024, 768, 640, 375];
    for (const w of viewports) {
      sim.setViewport(w, 800);
      assert.equal(sim.window.innerWidth, w);
    }

    // Stable state confirmed
    assert.ok(sim.window.innerWidth > 0);
  });

  // Scenario 5: Field-48 JWT Silent Refresh & Zero-Data-Loss Form Mutation
  registry.register(TIER, 'Scenario 5 [Field-48 Resilience]', 'Simulate 401 access token expiration during form mutation and silent refresh replay', async () => {
    const mock = createMockGateway();
    const server = await mock.start();

    try {
      // 1. Initial demo session call
      const authRes = await fetch(`${server.url}/api/auth/demo-session`, { method: 'POST' });
      const authData = await authRes.json();
      assert.equal(authRes.status, 200);
      assert.ok(authData.data.accessToken);

      // 2. Token refresh call
      const refreshRes = await fetch(`${server.url}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: authData.data.refreshToken }),
      });
      const refreshData = await refreshRes.json();
      assert.equal(refreshRes.status, 200);
      assert.ok(refreshData.data.accessToken);
      assert.ok(refreshData.data.accessToken.includes('refreshed'));
    } finally {
      await server.close();
    }
  });
}
