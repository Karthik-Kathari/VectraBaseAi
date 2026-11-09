import fs from 'node:fs';
import path from 'node:path';
import { TestRegistry } from './helpers/report-generator.mjs';

// Tier 1 imports
import { register as registerT1F1 } from './tier1-features/feat1-api-routing.test.mjs';
import { register as registerT1F2 } from './tier1-features/feat2-navbar-author.test.mjs';
import { register as registerT1F3 } from './tier1-features/feat3-widget-theme-sync.test.mjs';
import { register as registerT1F4 } from './tier1-features/feat4-typography.test.mjs';
import { register as registerT1F5 } from './tier1-features/feat5-design-tokens.test.mjs';
import { register as registerT1F6 } from './tier1-features/feat6-theme-toggle.test.mjs';
import { register as registerT1F7 } from './tier1-features/feat7-shell-marketing.test.mjs';
import { register as registerT1F8 } from './tier1-features/feat8-dashboard-pages.test.mjs';
import { register as registerT1F9 } from './tier1-features/feat9-widget-playground.test.mjs';
import { register as registerT1F10 } from './tier1-features/feat10-telemetry-governance.test.mjs';
import { register as registerT1F11 } from './tier1-features/feat11-interactive-glow.test.mjs';

// Tier 2 imports
import { register as registerT2F1 } from './tier2-boundary/feat1-api-routing-boundary.test.mjs';
import { register as registerT2F2 } from './tier2-boundary/feat2-navbar-author-boundary.test.mjs';
import { register as registerT2F3 } from './tier2-boundary/feat3-widget-theme-boundary.test.mjs';
import { register as registerT2F4 } from './tier2-boundary/feat4-typography-boundary.test.mjs';
import { register as registerT2F5 } from './tier2-boundary/feat5-design-tokens-boundary.test.mjs';
import { register as registerT2F6 } from './tier2-boundary/feat6-theme-toggle-boundary.test.mjs';
import { register as registerT2F7 } from './tier2-boundary/feat7-shell-marketing-boundary.test.mjs';
import { register as registerT2F8 } from './tier2-boundary/feat8-dashboard-pages-boundary.test.mjs';
import { register as registerT2F9 } from './tier2-boundary/feat9-widget-playground-boundary.test.mjs';
import { register as registerT2F10 } from './tier2-boundary/feat10-telemetry-governance-boundary.test.mjs';
import { register as registerT2F11 } from './tier2-boundary/feat11-interactive-glow-boundary.test.mjs';

// Tier 3 imports
import { register as registerT3 } from './tier3-interactions/pairwise-interactions.test.mjs';

// Tier 4 imports
import { register as registerT4 } from './tier4-scenarios/user-scenarios.test.mjs';

async function main() {
  console.log('\x1b[36m=============================================================\x1b[0m');
  console.log('\x1b[36m  VECTRABASE AI — COMPREHENSIVE 4-TIER E2E TEST SUITE RUNNER  \x1b[0m');
  console.log('\x1b[36m=============================================================\x1b[0m\n');

  const registry = new TestRegistry();

  // Register Tier 1
  registerT1F1(registry);
  registerT1F2(registry);
  registerT1F3(registry);
  registerT1F4(registry);
  registerT1F5(registry);
  registerT1F6(registry);
  registerT1F7(registry);
  registerT1F8(registry);
  registerT1F9(registry);
  registerT1F10(registry);
  registerT1F11(registry);

  // Register Tier 2
  registerT2F1(registry);
  registerT2F2(registry);
  registerT2F3(registry);
  registerT2F4(registry);
  registerT2F5(registry);
  registerT2F6(registry);
  registerT2F7(registry);
  registerT2F8(registry);
  registerT2F9(registry);
  registerT2F10(registry);
  registerT2F11(registry);

  // Register Tier 3
  registerT3(registry);

  // Register Tier 4
  registerT4(registry);

  console.log(`Registered ${registry.tests.length} tests across Tiers 1-4.`);
  console.log('Executing test suite...\n');

  const summary = await registry.runAll();
  registry.printSummary(summary);

  // Save results json
  const resultsPath = path.resolve(process.cwd(), 'tests/e2e/results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Detailed test results written to: ${resultsPath}\n`);

  const allowFailures = process.argv.includes('--allow-failures') || process.env.ALLOW_FAILURES === 'true';

  if (summary.failed > 0 && !allowFailures) {
    console.log(`\x1b[31mE2E Suite completed with ${summary.failed} failures.\x1b[0m`);
    process.exitCode = 1;
  } else {
    console.log('\x1b[32mE2E Suite execution completed successfully.\x1b[0m');
    process.exitCode = 0;
  }
}

main().catch((err) => {
  console.error('\x1b[31mFatal error in E2E runner:\x1b[0m', err);
  process.exitCode = 1;
});
