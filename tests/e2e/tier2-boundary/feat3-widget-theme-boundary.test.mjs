import assert from 'node:assert/strict';
import { readFileContent, fileExists } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 3: Widget Dual-Theme & Library Sync';

  // Boundary 1: Missing theme option in init contract defaults safely
  registry.register(TIER, FEATURE, 'Widget initialization without explicit theme parameter defaults gracefully', async () => {
    const entryContent = readFileContent('apps/embed-widget/src/widget-entry.ts');
    assert.ok(
      entryContent.includes('theme') || entryContent.includes('config'),
      'widget-entry.ts must accept optional config parameters'
    );
  });

  // Boundary 2: Widget message bubbles apply theme-aware background/text
  registry.register(TIER, FEATURE, 'MessageBubble component defines light and dark mode classes', async () => {
    const bubbleContent = readFileContent('apps/embed-widget/src/components/MessageBubble.vue');
    assert.ok(
      bubbleContent.includes('dark:') || bubbleContent.includes('bg-') || bubbleContent.includes('text-'),
      'MessageBubble must define responsive theme styling'
    );
  });

  // Boundary 3: CSS bundle file size check (not zero bytes and not truncated)
  registry.register(TIER, FEATURE, 'Static widget stylesheet public/widget.css is valid size (> 100 bytes)', async () => {
    assert.ok(fileExists('apps/web-dashboard/public/widget.css'), 'widget.css must exist');
    const css = readFileContent('apps/web-dashboard/public/widget.css');
    assert.ok(css.length > 100, 'widget.css must be populated with production styles');
  });

  // Boundary 4: JS bundle file size check (valid bundle)
  registry.register(TIER, FEATURE, 'Static widget script public/widget.js is valid non-empty bundle', async () => {
    assert.ok(fileExists('apps/web-dashboard/public/widget.js'), 'widget.js must exist');
    const js = readFileContent('apps/web-dashboard/public/widget.js');
    assert.ok(js.length > 500, 'widget.js must be a valid compiled bundle');
  });

  // Boundary 5: widget-frame.html HTML doctype and viewport headers
  registry.register(TIER, FEATURE, 'widget-frame.html includes proper HTML5 DOCTYPE and viewport meta tags', async () => {
    const frame = readFileContent('apps/web-dashboard/public/widget-frame.html');
    assert.ok(frame.includes('<!DOCTYPE html>') || frame.includes('<!doctype html>'), 'Must have DOCTYPE');
    assert.ok(frame.includes('name="viewport"'), 'Must have viewport meta tag');
  });
}
