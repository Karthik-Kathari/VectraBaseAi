import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 4: Typography Standardization';

  // Boundary 1: System fallback fonts in sans stack
  registry.register(TIER, FEATURE, 'fontFamily.sans includes robust system sans-serif fallback fonts', async () => {
    const config = readFileContent('apps/web-dashboard/tailwind.config.ts');
    assert.ok(
      config.includes('-apple-system') || config.includes('system-ui') || config.includes('sans-serif'),
      'tailwind sans font stack must provide system fallbacks'
    );
  });

  // Boundary 2: Monospace fallbacks
  registry.register(TIER, FEATURE, 'fontFamily.mono includes robust monospace fallback fonts', async () => {
    const config = readFileContent('apps/web-dashboard/tailwind.config.ts');
    assert.ok(
      config.includes('ui-monospace') || config.includes('Menlo') || config.includes('monospace'),
      'tailwind mono font stack must provide system monospace fallbacks'
    );
  });

  // Boundary 3: Tabular numbers rule declared in globals.css
  registry.register(TIER, FEATURE, 'globals.css defines .tabular-nums utility to prevent numeric jitter in tables', async () => {
    const css = readFileContent('apps/web-dashboard/src/app/globals.css');
    assert.ok(
      css.includes('.tabular-nums') && css.includes('tabular-nums'),
      'globals.css must define .tabular-nums for stable numeric rendering'
    );
  });

  // Boundary 4: Zero legacy/novelty fonts
  registry.register(TIER, FEATURE, 'Zero unauthorized novelty or decorative display fonts in Tailwind config', async () => {
    const config = readFileContent('apps/web-dashboard/tailwind.config.ts');
    const prohibited = ['comic', 'papyrus', 'times new roman', 'courier'];
    for (const p of prohibited) {
      assert.ok(!config.toLowerCase().includes(p), `Tailwind must not include prohibited font: ${p}`);
    }
  });

  // Boundary 5: Body overflow-x hidden prevents font-related horizontal scrollbar glitches
  registry.register(TIER, FEATURE, 'globals.css applies overflow-x: hidden on body to prevent horizontal scroll bleed', async () => {
    const css = readFileContent('apps/web-dashboard/src/app/globals.css');
    assert.ok(
      css.includes('overflow-x: hidden') || css.includes('overflow-x:hidden'),
      'globals.css body rule should include overflow-x: hidden'
    );
  });
}
