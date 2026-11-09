import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 4: Typography Standardization';

  // Test 1: Layout configures Inter font
  registry.register(TIER, FEATURE, 'Root layout configures Inter font family', async () => {
    const layoutContent = readFileContent('apps/web-dashboard/src/app/layout.tsx');
    const globalsContent = readFileContent('apps/web-dashboard/src/app/globals.css');
    const tailwindContent = readFileContent('apps/web-dashboard/tailwind.config.ts');

    const hasInter =
      layoutContent.includes('Inter') ||
      globalsContent.includes('Inter') ||
      tailwindContent.includes('Inter');
    assert.ok(hasInter, 'Inter font family must be configured in layout, globals.css, or tailwind config');
  });

  // Test 2: Tailwind config extends sans fontFamily with Inter
  registry.register(TIER, FEATURE, 'tailwind.config.ts includes Inter as primary sans-serif font', async () => {
    const tailwindContent = readFileContent('apps/web-dashboard/tailwind.config.ts');
    assert.ok(
      tailwindContent.includes('sans:') && tailwindContent.includes("'Inter'") || tailwindContent.includes('"Inter"'),
      'tailwind.config.ts must specify Inter in fontFamily.sans'
    );
  });

  // Test 3: Tailwind config extends mono fontFamily with JetBrains Mono
  registry.register(TIER, FEATURE, 'tailwind.config.ts includes JetBrains Mono as primary monospace font', async () => {
    const tailwindContent = readFileContent('apps/web-dashboard/tailwind.config.ts');
    assert.ok(
      tailwindContent.includes('mono:') && (tailwindContent.includes("'JetBrains Mono'") || tailwindContent.includes('"JetBrains Mono"')),
      'tailwind.config.ts must specify JetBrains Mono in fontFamily.mono'
    );
  });

  // Test 4: Body element applies font-sans class
  registry.register(TIER, FEATURE, 'Root body element applies font-sans utility class', async () => {
    const layoutContent = readFileContent('apps/web-dashboard/src/app/layout.tsx');
    assert.ok(
      layoutContent.includes('font-sans'),
      'apps/web-dashboard/src/app/layout.tsx body must apply font-sans'
    );
  });

  // Test 5: Globals.css provides clean font smoothing and antialiasing
  registry.register(TIER, FEATURE, 'Root styling provides antialiasing and modern font rendering', async () => {
    const layoutContent = readFileContent('apps/web-dashboard/src/app/layout.tsx');
    assert.ok(
      layoutContent.includes('antialiased'),
      'Layout body must include antialiased font smoothing class'
    );
  });
}
