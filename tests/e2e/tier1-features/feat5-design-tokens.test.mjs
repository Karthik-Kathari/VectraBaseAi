import assert from 'node:assert/strict';
import { readFileContent, extractScopedCssVariables } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 5: Design Tokens & UI Primitives';

  // Test 1: Primary surface tokens defined for light (:root) and dark (.dark)
  registry.register(TIER, FEATURE, 'CSS variables define primary background and surface tokens in globals.css', async () => {
    const cssContent = readFileContent('apps/web-dashboard/src/app/globals.css');
    const rootVars = extractScopedCssVariables(cssContent, ':root');
    const darkVars = extractScopedCssVariables(cssContent, '.dark');

    assert.ok(rootVars['--background'], ':root must define --background');
    assert.ok(darkVars['--background'], '.dark must define --background');
    assert.ok(rootVars['--surface'], ':root must define --surface');
    assert.ok(darkVars['--surface'], '.dark must define --surface');
  });

  // Test 2: Border and foreground tokens defined
  registry.register(TIER, FEATURE, 'CSS variables define border and foreground tokens for both modes', async () => {
    const cssContent = readFileContent('apps/web-dashboard/src/app/globals.css');
    const rootVars = extractScopedCssVariables(cssContent, ':root');
    const darkVars = extractScopedCssVariables(cssContent, '.dark');

    assert.ok(rootVars['--border'], ':root must define --border');
    assert.ok(darkVars['--border'], '.dark must define --border');
    assert.ok(rootVars['--foreground'], ':root must define --foreground');
    assert.ok(darkVars['--foreground'], '.dark must define --foreground');
  });

  // Test 3: Accent colors (purple and red) defined in theme
  registry.register(TIER, FEATURE, 'Purple and red accent tokens defined in Tailwind or globals.css', async () => {
    const tailwindContent = readFileContent('apps/web-dashboard/tailwind.config.ts');
    const cssContent = readFileContent('apps/web-dashboard/src/app/globals.css');

    const hasPurpleAccent =
      tailwindContent.includes('purple') ||
      tailwindContent.includes('indigo') ||
      cssContent.includes('--accent-purple');
    const hasRedAccent =
      tailwindContent.includes('red') ||
      tailwindContent.includes('rose') ||
      cssContent.includes('--accent-red');

    assert.ok(hasPurpleAccent, 'Purple/indigo accent colors must be defined in tokens');
    assert.ok(hasRedAccent, 'Red/rose accent colors must be defined in tokens');
  });

  // Test 4: Yellow highlight token defined
  registry.register(TIER, FEATURE, 'Yellow / amber highlight token defined for prominent UI elements', async () => {
    const tailwindContent = readFileContent('apps/web-dashboard/tailwind.config.ts');
    const cssContent = readFileContent('apps/web-dashboard/src/app/globals.css');

    const hasYellow =
      tailwindContent.includes('amber') ||
      tailwindContent.includes('yellow') ||
      cssContent.includes('--highlight-yellow');
    assert.ok(hasYellow, 'Yellow/amber highlight color must be defined');
  });

  // Test 5: Neon glow shadows defined in Tailwind config
  registry.register(TIER, FEATURE, 'Neon glow shadows (cyan-glow / purple-glow) configured in tailwind.config.ts', async () => {
    const tailwindContent = readFileContent('apps/web-dashboard/tailwind.config.ts');
    assert.ok(
      tailwindContent.includes('boxShadow') &&
        (tailwindContent.includes('glow') || tailwindContent.includes('cyan-glow')),
      'tailwind.config.ts must configure neon glow box shadows'
    );
  });
}
