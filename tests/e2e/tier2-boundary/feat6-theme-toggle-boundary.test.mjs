import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';
import { createDomSimulator } from '../helpers/dom-simulator.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 6: Working Light/Dark Mode Navbar Toggle';

  // Boundary 1: Rapid 20x consecutive theme toggling preserves deterministic state
  registry.register(TIER, FEATURE, 'Rapid 20x sequential theme toggling maintains state consistency', async () => {
    const sim = createDomSimulator();
    for (let i = 0; i < 20; i++) {
      const next = i % 2 === 0 ? 'dark' : 'light';
      sim.simulateThemeToggle(next);
    }
    // 19th iteration (i=19, odd) -> 'light'
    assert.equal(sim.isDarkMode(), false);
    assert.equal(sim.getStoredTheme(), 'light');
  });

  // Boundary 2: SSR hydration mount check in ThemeToggle
  registry.register(TIER, FEATURE, 'ThemeToggle implements mounted check to prevent SSR hydration flash', async () => {
    const navbar = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbar.includes('mounted') && navbar.includes('setMounted'),
      'ThemeToggle must use mounted guard for hydration safety'
    );
  });

  // Boundary 3: Sun and Moon icons render conditionally
  registry.register(TIER, FEATURE, 'ThemeToggle renders Sun icon in dark mode and Moon icon in light mode', async () => {
    const navbar = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(navbar.includes('<Sun'), 'ThemeToggle must render <Sun /> icon');
    assert.ok(navbar.includes('<Moon'), 'ThemeToggle must render <Moon /> icon');
  });

  // Boundary 4: Theme button has cursor-pointer utility
  registry.register(TIER, FEATURE, 'ThemeToggle button includes cursor-pointer styling for interactive affordance', async () => {
    const navbar = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbar.includes('cursor-pointer'),
      'ThemeToggle button must have cursor-pointer class'
    );
  });

  // Boundary 5: ThemeProvider defaultTheme config in providers.tsx
  registry.register(TIER, FEATURE, 'providers.tsx specifies defaultTheme or enableSystem in ThemeProvider', async () => {
    const providers = readFileContent('apps/web-dashboard/src/app/providers.tsx');
    assert.ok(
      providers.includes('defaultTheme') || providers.includes('enableSystem'),
      'ThemeProvider in providers.tsx must declare defaultTheme or enableSystem'
    );
  });
}
