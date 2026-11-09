import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';
import { createDomSimulator } from '../helpers/dom-simulator.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 6: Working Light/Dark Mode Navbar Toggle';

  // Test 1: Navbar imports and renders ThemeToggle component
  registry.register(TIER, FEATURE, 'Navbar renders ThemeToggle component directly in header', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbarContent.includes('ThemeToggle') || navbarContent.includes('useTheme'),
      'Navbar must define or import ThemeToggle with useTheme'
    );
    assert.ok(
      navbarContent.includes('<ThemeToggle'),
      'Navbar header must render <ThemeToggle />'
    );
  });

  // Test 2: ThemeToggle uses next-themes useTheme hook
  registry.register(TIER, FEATURE, 'ThemeToggle uses next-themes hook to toggle theme state', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbarContent.includes("from 'next-themes'") || navbarContent.includes('from "next-themes"'),
      'ThemeToggle must import useTheme from next-themes'
    );
    assert.ok(
      navbarContent.includes('setTheme'),
      'ThemeToggle must invoke setTheme'
    );
  });

  // Test 3: Root providers configure ThemeProvider with class attribute
  registry.register(TIER, FEATURE, 'providers.tsx wraps tree with ThemeProvider attribute="class"', async () => {
    const providersContent = readFileContent('apps/web-dashboard/src/app/providers.tsx');
    assert.ok(
      providersContent.includes('ThemeProvider'),
      'providers.tsx must render ThemeProvider'
    );
    assert.ok(
      providersContent.includes('attribute="class"') || providersContent.includes("attribute='class'"),
      'ThemeProvider must configure attribute="class"'
    );
  });

  // Test 4: DOM simulator verifies class "dark" toggle mechanics
  registry.register(TIER, FEATURE, 'Toggling theme applies and removes "dark" class on html element', async () => {
    const sim = createDomSimulator();
    assert.equal(sim.isDarkMode(), false);

    sim.simulateThemeToggle('dark');
    assert.equal(sim.isDarkMode(), true);
    assert.equal(sim.getStoredTheme(), 'dark');

    sim.simulateThemeToggle('light');
    assert.equal(sim.isDarkMode(), false);
    assert.equal(sim.getStoredTheme(), 'light');
  });

  // Test 5: ThemeToggle button has accessibility attributes
  registry.register(TIER, FEATURE, 'ThemeToggle button includes aria-label and descriptive title', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbarContent.includes('aria-label="Toggle theme"') || navbarContent.includes("aria-label='Toggle theme'"),
      'ThemeToggle button must include aria-label="Toggle theme"'
    );
    assert.ok(
      navbarContent.includes('title='),
      'ThemeToggle button must include title attribute'
    );
  });
}
