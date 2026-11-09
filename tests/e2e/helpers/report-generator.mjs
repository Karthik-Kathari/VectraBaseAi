export class TestRegistry {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  register(tier, feature, name, testFn) {
    this.tests.push({ tier, feature, name, testFn });
  }

  async runAll() {
    this.results = [];
    const startTime = Date.now();

    for (const t of this.tests) {
      const testStart = Date.now();
      try {
        await t.testFn();
        const durationMs = Date.now() - testStart;
        this.results.push({
          tier: t.tier,
          feature: t.feature,
          name: t.name,
          passed: true,
          durationMs,
        });
      } catch (err) {
        const durationMs = Date.now() - testStart;
        this.results.push({
          tier: t.tier,
          feature: t.feature,
          name: t.name,
          passed: false,
          error: err.message || String(err),
          stack: err.stack,
          durationMs,
        });
      }
    }

    const totalDurationMs = Date.now() - startTime;
    return this.generateSummary(totalDurationMs);
  }

  generateSummary(totalDurationMs) {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

    const byTier = {};
    for (const r of this.results) {
      if (!byTier[r.tier]) {
        byTier[r.tier] = { total: 0, passed: 0, failed: 0 };
      }
      byTier[r.tier].total++;
      if (r.passed) byTier[r.tier].passed++;
      else byTier[r.tier].failed++;
    }

    return {
      total,
      passed,
      failed,
      passRate: `${passRate}%`,
      totalDurationMs,
      byTier,
      failures: this.results.filter((r) => !r.passed),
      results: this.results,
    };
  }

  printSummary(summary) {
    console.log('\n=============================================================');
    console.log('              VECTRABASE AI — E2E TEST REPORT                 ');
    console.log('=============================================================');
    console.log(`Total Tests Run:  ${summary.total}`);
    console.log(`Passed:           \x1b[32m${summary.passed}\x1b[0m`);
    console.log(`Failed:           \x1b[31m${summary.failed}\x1b[0m`);
    console.log(`Pass Rate:        ${summary.passRate}`);
    console.log(`Total Duration:   ${(summary.totalDurationMs / 1000).toFixed(2)}s\n`);

    console.log('------------------------- BY TIER ---------------------------');
    for (const [tier, stat] of Object.entries(summary.byTier)) {
      const tierRate = ((stat.passed / stat.total) * 100).toFixed(1);
      const color = stat.failed === 0 ? '\x1b[32m' : '\x1b[33m';
      console.log(
        `${tier.padEnd(28)} Passed: ${stat.passed}/${stat.total} (${color}${tierRate}%\x1b[0m)`
      );
    }
    console.log('-------------------------------------------------------------\n');

    if (summary.failures.length > 0) {
      console.log('\x1b[31mFAILURES IDENTIFIED (POTENTIAL IMPLEMENTATION DEFECTS):\x1b[0m');
      summary.failures.forEach((f, idx) => {
        console.log(`\n  ${idx + 1}) [${f.tier}] ${f.feature}: ${f.name}`);
        console.log(`     \x1b[31mError: ${f.error}\x1b[0m`);
      });
      console.log('');
    }
  }
}
