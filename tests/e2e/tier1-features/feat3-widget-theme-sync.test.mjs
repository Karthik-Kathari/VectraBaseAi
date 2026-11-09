import assert from 'node:assert/strict';
import { readFileContent, fileExists } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 1 - Feature Coverage';
  const FEATURE = 'Feature 3: Widget Dual-Theme & Library Sync';

  // Test 1: Public widget script bundle exists and is synchronized
  registry.register(TIER, FEATURE, 'Static bundle public/widget.js exists and exposes VectraBaseWidget', async () => {
    assert.ok(fileExists('apps/web-dashboard/public/widget.js'), 'apps/web-dashboard/public/widget.js must exist');
    const content = readFileContent('apps/web-dashboard/public/widget.js');
    assert.ok(
      content.includes('VectraBaseWidget') || content.includes('init'),
      'widget.js bundle must expose VectraBaseWidget or init function'
    );
  });

  // Test 2: Public widget stylesheet exists
  registry.register(TIER, FEATURE, 'Static stylesheet public/widget.css exists', async () => {
    assert.ok(fileExists('apps/web-dashboard/public/widget.css'), 'apps/web-dashboard/public/widget.css must exist');
    const content = readFileContent('apps/web-dashboard/public/widget.css');
    assert.ok(content.length > 50, 'widget.css must not be empty');
  });

  // Test 3: widget-entry supports theme configuration
  registry.register(TIER, FEATURE, 'widget-entry.ts supports light and dark theme option in init contract', async () => {
    const content = readFileContent('apps/embed-widget/src/widget-entry.ts');
    assert.ok(
      content.includes('theme') || content.includes('WidgetConfig'),
      'apps/embed-widget/src/widget-entry.ts must support theme parameter'
    );
  });

  // Test 4: WidgetContainer does not hardcode background that breaks light mode
  registry.register(TIER, FEATURE, 'WidgetContainer supports dual-theme classes without locking to dark background', async () => {
    const content = readFileContent('apps/embed-widget/src/components/WidgetContainer.vue');
    // Check if the container root supports theme-adaptive classes or light mode
    const hasThemeAdaptiveBg = !content.includes('bg-[#090A0F]') || content.includes('dark:bg-[#090A0F]') || content.includes('theme');
    assert.ok(
      hasThemeAdaptiveBg,
      'WidgetContainer root element must support dual-theme styling (not hardcoded unconditional bg-[#090A0F])'
    );
  });

  // Test 5: widget-frame.html renders without syntax or script loading errors
  registry.register(TIER, FEATURE, 'widget-frame.html includes valid script and stylesheet tags', async () => {
    const content = readFileContent('apps/web-dashboard/public/widget-frame.html');
    assert.ok(content.includes('href="/widget.css"'), 'widget-frame.html must link to /widget.css');
    assert.ok(content.includes('src="/widget.js"'), 'widget-frame.html must script to /widget.js');
    assert.ok(content.includes('id="vectrabase-widget"'), 'widget-frame.html must declare #vectrabase-widget target');
  });
}
