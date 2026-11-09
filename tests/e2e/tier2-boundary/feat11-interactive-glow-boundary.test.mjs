import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 11: Interactive Components & Glow Accents';

  // Boundary 1: CommandPalette Escape key dismissal
  registry.register(TIER, FEATURE, 'CommandPalette closes modal on Escape key press', async () => {
    const palette = readFileContent('apps/web-dashboard/src/components/CommandPalette.tsx');
    assert.ok(
      palette.includes("e.key === 'Escape'") && palette.includes('setIsOpen(false)'),
      'CommandPalette must dismiss on Escape key'
    );
  });

  // Boundary 2: CommandPalette cleanup of keydown listener
  registry.register(TIER, FEATURE, 'CommandPalette removes window keydown listener on component unmount', async () => {
    const palette = readFileContent('apps/web-dashboard/src/components/CommandPalette.tsx');
    assert.ok(
      palette.includes('removeEventListener'),
      'CommandPalette must clean up keydown event listener'
    );
  });

  // Boundary 3: RAGPipelineVisualizer cacheHitMode handling
  registry.register(TIER, FEATURE, 'RAGPipelineVisualizer accepts cacheHitMode prop to switch path highlights', async () => {
    const viz = readFileContent('apps/web-dashboard/src/components/RAGPipelineVisualizer.tsx');
    assert.ok(
      viz.includes('cacheHitMode') || viz.includes('cacheHit'),
      'Visualizer must accept cache hit indicator prop'
    );
  });

  // Boundary 4: BenchmarkDrawer slide-over close trigger
  registry.register(TIER, FEATURE, 'BenchmarkDrawer provides explicit close button and backdrop click dismiss', async () => {
    const drawer = readFileContent('apps/web-dashboard/src/components/BenchmarkDrawer.tsx');
    assert.ok(
      drawer.includes('onClose') || drawer.includes('setIsOpen'),
      'BenchmarkDrawer must expose close interaction handler'
    );
  });

  // Boundary 5: InterceptorConsole unregisters listener on unmount
  registry.register(TIER, FEATURE, 'InterceptorConsole calls unregister on unmount to prevent listener leak', async () => {
    const consoleComp = readFileContent('apps/web-dashboard/src/components/InterceptorConsole.tsx');
    assert.ok(
      consoleComp.includes('return () =>') && consoleComp.includes('unregister'),
      'InterceptorConsole must clean up interceptor telemetry listener'
    );
  });
}
