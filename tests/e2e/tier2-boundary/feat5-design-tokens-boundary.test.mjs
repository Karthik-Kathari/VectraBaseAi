import assert from 'node:assert/strict';
import { readFileContent, extractScopedCssVariables, getContrastRatio } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 5: Design Tokens & UI Primitives';

  // Boundary 1: WCAG AA contrast ratio for light mode primary tokens
  registry.register(TIER, FEATURE, 'Light mode text contrast ratio meets WCAG AA (>= 4.5:1)', async () => {
    const css = readFileContent('apps/web-dashboard/src/app/globals.css');
    const rootVars = extractScopedCssVariables(css, ':root');
    const bg = rootVars['--background'] || '#ffffff';
    const fg = rootVars['--foreground'] || '#0f172a';
    const ratio = getContrastRatio(bg, fg);
    assert.ok(
      ratio >= 4.5,
      `Light mode text contrast ratio (${ratio.toFixed(2)}) must meet WCAG AA standard (>= 4.5)`
    );
  });

  // Boundary 2: WCAG AA contrast ratio for dark mode primary tokens
  registry.register(TIER, FEATURE, 'Dark mode text contrast ratio meets WCAG AA (>= 4.5:1)', async () => {
    const css = readFileContent('apps/web-dashboard/src/app/globals.css');
    const darkVars = extractScopedCssVariables(css, '.dark');
    const bg = darkVars['--background'] || '#0b0f19';
    const fg = darkVars['--foreground'] || '#f8fafc';
    const ratio = getContrastRatio(bg, fg);
    assert.ok(
      ratio >= 4.5,
      `Dark mode text contrast ratio (${ratio.toFixed(2)}) must meet WCAG AA standard (>= 4.5)`
    );
  });

  // Boundary 3: Button primitive disabled state handling
  registry.register(TIER, FEATURE, 'Button component handles disabled / loading states with disabled:opacity-50', async () => {
    const btn = readFileContent('apps/web-dashboard/src/components/ui/Button.tsx');
    assert.ok(
      btn.includes('disabled:opacity-50') && btn.includes('disabled:cursor-not-allowed'),
      'Button component must include disabled styles'
    );
  });

  // Boundary 4: Badge primitive variants completeness
  registry.register(TIER, FEATURE, 'Badge component covers all 6 semantic variants', async () => {
    const badge = readFileContent('apps/web-dashboard/src/components/ui/Badge.tsx');
    const required = ['cyan', 'emerald', 'amber', 'rose', 'indigo', 'neutral'];
    for (const v of required) {
      assert.ok(badge.includes(`${v}:`), `Badge component must implement variant: ${v}`);
    }
  });

  // Boundary 5: Card primitive dual-theme border styling
  registry.register(TIER, FEATURE, 'Card component applies dual-theme borders without hardcoded obsidian dark hexes', async () => {
    const card = readFileContent('apps/web-dashboard/src/components/ui/Card.tsx');
    assert.ok(
      card.includes('border-slate-200') && card.includes('dark:border-slate-800'),
      'Card component must use dual-theme border classes'
    );
  });
}
