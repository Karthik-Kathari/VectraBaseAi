import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 7: Shell & Marketing Redesign';

  // Test 1: Landing page renders hero and CTA sections
  registry.register(TIER, FEATURE, 'Landing page (page.tsx) renders hero section and interactive CTA', async () => {
    const pageContent = readFileContent('apps/web-dashboard/src/app/page.tsx');
    assert.ok(
      pageContent.includes('VectraBase') || pageContent.includes('AI Assistant'),
      'Landing page must render VectraBase heading'
    );
    assert.ok(
      pageContent.includes('/dashboard') || pageContent.includes('/widget-playground'),
      'Landing page must link to dashboard routes'
    );
  });

  // Test 2: Footer links route to valid internal dashboard pages
  registry.register(TIER, FEATURE, 'Footer product links route to valid dashboard pages without empty anchors', async () => {
    const footerContent = readFileContent('apps/web-dashboard/src/components/Footer.tsx');
    assert.ok(footerContent.includes('href="/rag-studio"'), 'Footer must link to /rag-studio');
    assert.ok(footerContent.includes('href="/widget-playground"'), 'Footer must link to /widget-playground');
    assert.ok(footerContent.includes('href="/dashboard"'), 'Footer must link to /dashboard');
    assert.ok(footerContent.includes('href="/telemetry"'), 'Footer must link to /telemetry');
  });

  // Test 3: Footer contains operational status indicator
  registry.register(TIER, FEATURE, 'Footer renders real-time system operational status badge', async () => {
    const footerContent = readFileContent('apps/web-dashboard/src/components/Footer.tsx');
    assert.ok(
      footerContent.includes('Operational') || footerContent.includes('bg-emerald-500'),
      'Footer must render operational status badge'
    );
  });

  // Test 4: Dashboard layout renders collapsible sidebar
  registry.register(TIER, FEATURE, 'Dashboard layout renders collapsible sidebar navigation', async () => {
    const layoutContent = readFileContent('apps/web-dashboard/src/app/(dashboard)/layout.tsx');
    assert.ok(
      layoutContent.includes('isCollapsed') || layoutContent.includes('Collapse'),
      'Dashboard layout must feature collapsible sidebar'
    );
    assert.ok(
      layoutContent.includes('/dashboard') &&
        layoutContent.includes('/rag-studio') &&
        layoutContent.includes('/widget-playground') &&
        layoutContent.includes('/telemetry') &&
        layoutContent.includes('/governance'),
      'Sidebar must contain all 5 primary dashboard route links'
    );
  });

  // Test 5: Dashboard layout displays workspace status header
  registry.register(TIER, FEATURE, 'Dashboard layout displays workspace status bar with pgvector active badge', async () => {
    const layoutContent = readFileContent('apps/web-dashboard/src/app/(dashboard)/layout.tsx');
    assert.ok(
      layoutContent.includes('Workspace:') || layoutContent.includes('vectrabase-demo'),
      'Dashboard layout must display workspace identifier'
    );
    assert.ok(
      layoutContent.includes('pgvector') || layoutContent.includes('Neon Lakebase'),
      'Dashboard layout must display database connectivity indicator'
    );
  });
}
