import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 7: Shell & Marketing Redesign';

  // Boundary 1: Zero empty href="#" in Footer
  registry.register(TIER, FEATURE, 'Footer component contains zero empty href="#" placeholder links', async () => {
    const footer = readFileContent('apps/web-dashboard/src/components/Footer.tsx');
    assert.ok(
      !footer.includes('href="#"') && !footer.includes("href='#'"),
      'Footer must not contain dead href="#" links'
    );
  });

  // Boundary 2: External GitHub link security attributes
  registry.register(TIER, FEATURE, 'External GitHub link includes target="_blank" and rel="noreferrer"', async () => {
    const navbar = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbar.includes('target="_blank"') && navbar.includes('rel="noreferrer"'),
      'External links in Navbar must use target="_blank" and rel="noreferrer"'
    );
  });

  // Boundary 3: Mobile menu hamburger icon toggle
  registry.register(TIER, FEATURE, 'Mobile hamburger button toggles icon paths when open vs closed', async () => {
    const navbar = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbar.includes('isMobileMenuOpen ?'),
      'Mobile hamburger button must swap icon paths based on open state'
    );
  });

  // Boundary 4: Sidebar collapse button aria and tooltip handling
  registry.register(TIER, FEATURE, 'Sidebar collapse button toggles label between "← Collapse" and "→"', async () => {
    const layout = readFileContent('apps/web-dashboard/src/app/(dashboard)/layout.tsx');
    assert.ok(
      layout.includes("isCollapsed ? '→' : '← Collapse'"),
      'Sidebar collapse toggle must render descriptive arrow cues'
    );
  });

  // Boundary 5: Backdrop blur on sticky navbar
  registry.register(TIER, FEATURE, 'Navbar header applies backdrop-blur-md for translucent sticky overlay', async () => {
    const navbar = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbar.includes('sticky top-0') && navbar.includes('backdrop-blur-md'),
      'Navbar must be sticky with backdrop-blur styling'
    );
  });
}
