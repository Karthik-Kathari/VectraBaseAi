import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 2: Navbar Author Attribution Removal';

  // Test 1: Navbar logo section has no author subtext
  registry.register(TIER, FEATURE, 'Navbar logo branding excludes author attribution ("by Karthik Kathari")', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    // Extract the brand container around Link href="/"
    const brandRegex = /<Link[^>]*href="\/"[^>]*>([\s\S]*?)<\/Link>/;
    const match = navbarContent.match(brandRegex);
    assert.ok(match, 'Navbar must contain brand Link href="/"');
    const brandBlock = match[1];
    assert.ok(
      !brandBlock.toLowerCase().includes('karthik kathari'),
      'Navbar brand logo block must not contain "Karthik Kathari"'
    );
  });

  // Test 2: Widget container header excludes author attribution
  registry.register(TIER, FEATURE, 'WidgetContainer header excludes "By Karthik Kathari" below logo', async () => {
    const widgetContent = readFileContent('apps/embed-widget/src/components/WidgetContainer.vue');
    // Extract header section
    const headerRegex = /<header[^>]*>([\s\S]*?)<\/header>/;
    const match = widgetContent.match(headerRegex);
    assert.ok(match, 'WidgetContainer.vue must contain <header>');
    const headerBlock = match[1];
    assert.ok(
      !headerBlock.toLowerCase().includes('karthik kathari'),
      'Widget header must not contain "Karthik Kathari" below logo'
    );
  });

  // Test 3: Logo geometric SVG prism icon preserved
  registry.register(TIER, FEATURE, 'Navbar brand icon preserves geometric SVG prism structure', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbarContent.includes('<polygon') && navbarContent.includes('points="12 2 2 7 12 12 22 7 12 2"'),
      'Navbar brand logo SVG prism structure must be preserved'
    );
  });

  // Test 4: Version badge preserved
  registry.register(TIER, FEATURE, 'Navbar version badge (v1.0) remains positioned next to title', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbarContent.includes('v1.0'),
      'Navbar brand must preserve v1.0 version badge'
    );
  });

  // Test 5: Layout alignment preserved
  registry.register(TIER, FEATURE, 'Navbar left brand layout maintains flex alignment and spacing', async () => {
    const navbarContent = readFileContent('apps/web-dashboard/src/components/Navbar.tsx');
    assert.ok(
      navbarContent.includes('flex items-center gap-'),
      'Navbar brand must use flex alignment with consistent gap spacing'
    );
  });
}
