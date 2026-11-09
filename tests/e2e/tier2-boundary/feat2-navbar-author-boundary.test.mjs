import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 2: Navbar Author Attribution Removal';

  // Boundary 1: Case-insensitive scan across Navbar.tsx logo area
  registry.register(TIER, FEATURE, 'Navbar brand logo markup contains zero case-insensitive variants of author name', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    const brandMatch = navbarContent.match(/<Link[^>]*href="\/"[^>]*>([\s\S]*?)<\/Link>/);
    assert.ok(brandMatch, 'Brand Link must exist');
    const brandLower = brandMatch[1].toLowerCase();
    assert.ok(!brandLower.includes('karthik'), 'Must not contain "karthik" in brand Link');
    assert.ok(!brandLower.includes('kathari'), 'Must not contain "kathari" in brand Link');
  });

  // Boundary 2: Case-insensitive scan across WidgetContainer.vue logo area
  registry.register(TIER, FEATURE, 'Widget header markup contains zero case-insensitive variants of author name', async () => {
    const widgetContent = readFileContent('apps/embed-widget/src/components/WidgetContainer.vue');
    const headerMatch = widgetContent.match(/<header[^>]*>([\s\S]*?)<\/header>/);
    assert.ok(headerMatch, 'Widget header must exist');
    const headerLower = headerMatch[1].toLowerCase();
    assert.ok(!headerLower.includes('karthik'), 'Must not contain "karthik" in widget header');
    assert.ok(!headerLower.includes('kathari'), 'Must not contain "kathari" in widget header');
  });

  // Boundary 3: Mobile responsiveness of logo container
  registry.register(TIER, FEATURE, 'Navbar brand logo container includes sm: / responsive sizing utilities', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbarContent.includes('sm:') || navbarContent.includes('flex items-center'),
      'Navbar brand must use responsive flex utilities'
    );
  });

  // Boundary 4: Accessibility attributes clean of author name
  registry.register(TIER, FEATURE, 'Navbar logo link aria-label / title does not leak author name', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    const linkMatch = navbarContent.match(/<Link[^>]*href="\/"[^>]*>/);
    if (linkMatch && linkMatch[0].includes('aria-label')) {
      assert.ok(!linkMatch[0].toLowerCase().includes('karthik'), 'aria-label must not leak author name');
    }
  });

  // Boundary 5: widget-frame.html does not inject external attribution header
  registry.register(TIER, FEATURE, 'widget-frame.html body contains only widget mount point without attribution banner', async () => {
    const frameContent = readFileContent('apps/web-dashboard/public/widget-frame.html');
    const bodyMatch = frameContent.match(/<body>([\s\S]*?)<\/body>/);
    assert.ok(bodyMatch, 'widget-frame.html must have <body>');
    assert.ok(!bodyMatch[1].toLowerCase().includes('karthik kathari'), 'widget-frame.html body must not include author banner');
  });
}
