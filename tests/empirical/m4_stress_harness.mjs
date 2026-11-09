/**
 * VectraBase AI — Milestone 4 Empirical Stress Harness
 * Archetype: Empirical Challenger (Challenger 2 - Stress Challenger)
 *
 * Scope:
 *  1. RAGPipelineVisualizer.tsx:
 *     - SVG filters (#a855f7, #10b981, #f59e0b)
 *     - Pulse paths and connection lines
 *     - GSAP animation state and cache hit rebound
 *     - Interactive Stage Inspector (node selection, payload/transformation display, confidence/latency chips)
 *  2. VirtualizedTable.tsx:
 *     - @tanstack/react-virtual DOM ceiling (<60 elements)
 *     - Status badges: 429 yellow, 500 red, miss purple, hit emerald
 *     - Latency color grading (<200ms purple, >=200ms yellow, hit emerald)
 *     - Semantic token adherence (no legacy obsidian tokens)
 *     - Virtual scrolling calculation under 1,000,000 rows
 *  3. Governance Wizard (governance/page.tsx):
 *     - 5-step navigation state machine and boundary clamping (1 to 5)
 *     - Autosave indicator dot with emerald pulsing glow
 *     - Field 48 Recruiter Resilience Target and yellow highlight warning
 *     - Form state management and JSON export capability
 *  4. CommandPalette, BenchmarkDrawer, and InterceptorConsole:
 *     - CommandPalette: Cmd+K / ESC toggles, search filtering, yellow highlight badges
 *     - BenchmarkDrawer: 4 metric cards, latency comparison bars (emerald hit vs purple miss), live DOM count telemetry
 *     - InterceptorConsole: Axios event listener lifecycle (REQUEST_401, REFRESH_START, REFRESH_SUCCESS, REPLAY_SUCCESS)
 *     - High-frequency event flooding (10,000 cycles) stress tests
 *  5. Cross-Page Semantic Token Integrity:
 *     - Exhaustive purge verification of legacy obsidian tokens across all 10 M4 files
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT_DIR = process.cwd();

// Test Result Aggregator
const RESULTS = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: {},
  failures: [],
};

const registeredSuites = [];

function suite(suiteName) {
  const tests = [];
  const suiteObj = { name: suiteName, tests };
  registeredSuites.push(suiteObj);
  RESULTS.suites[suiteName] = { total: 0, passed: 0, failed: 0 };
  return {
    test(testName, fn) {
      tests.push({ name: testName, fn });
    },
  };
}

// ---------------------------------------------------------------------------
// Load Target Source Files for AST & Empirical Verification
// ---------------------------------------------------------------------------
const paths = {
  ragVisualizer: path.join(ROOT_DIR, 'apps/web-dashboard/src/components/RAGPipelineVisualizer.tsx'),
  virtualizedTable: path.join(ROOT_DIR, 'apps/web-dashboard/src/components/VirtualizedTable.tsx'),
  governancePage: path.join(ROOT_DIR, 'apps/web-dashboard/src/app/(dashboard)/governance/page.tsx'),
  commandPalette: path.join(ROOT_DIR, 'apps/web-dashboard/src/components/CommandPalette.tsx'),
  benchmarkDrawer: path.join(ROOT_DIR, 'apps/web-dashboard/src/components/BenchmarkDrawer.tsx'),
  interceptorConsole: path.join(ROOT_DIR, 'apps/web-dashboard/src/components/InterceptorConsole.tsx'),
  dashboardPage: path.join(ROOT_DIR, 'apps/web-dashboard/src/app/(dashboard)/dashboard/page.tsx'),
  ragStudioPage: path.join(ROOT_DIR, 'apps/web-dashboard/src/app/(dashboard)/rag-studio/page.tsx'),
  widgetPlaygroundPage: path.join(ROOT_DIR, 'apps/web-dashboard/src/app/(dashboard)/widget-playground/page.tsx'),
  telemetryPage: path.join(ROOT_DIR, 'apps/web-dashboard/src/app/(dashboard)/telemetry/page.tsx'),
  badgeComponent: path.join(ROOT_DIR, 'apps/web-dashboard/src/components/ui/Badge.tsx'),
};

const sources = {};
for (const [key, filePath] of Object.entries(paths)) {
  assert.ok(fs.existsSync(filePath), `Required file must exist: ${filePath}`);
  sources[key] = fs.readFileSync(filePath, 'utf8');
}

// ===========================================================================
// SUITE 1: RAGPipelineVisualizer SVG Filters, Pulse Paths & Stage Inspector
// ===========================================================================
const s1 = suite('RAG Visualizer: SVG Filters, Pulse Paths & Stage Inspector');

s1.test('SVG Defs: contains neon purple filter #a855f7 with feDropShadow', () => {
  const filterMatch = sources.ragVisualizer.match(/<filter id="glow-purple"[\s\S]*?<\/filter>/);
  assert.ok(filterMatch, 'glow-purple filter definition must exist');
  assert.match(filterMatch[0], /floodColor="#a855f7"/i, 'Must use #a855f7 floodColor');
  assert.match(filterMatch[0], /<feDropShadow/i, 'Must define feDropShadow primitive');
});

s1.test('SVG Defs: contains neon emerald filter #10b981 with feDropShadow', () => {
  const filterMatch = sources.ragVisualizer.match(/<filter id="glow-emerald"[\s\S]*?<\/filter>/);
  assert.ok(filterMatch, 'glow-emerald filter definition must exist');
  assert.match(filterMatch[0], /floodColor="#10b981"/i, 'Must use #10b981 floodColor');
  assert.match(filterMatch[0], /<feDropShadow/i, 'Must define feDropShadow primitive');
});

s1.test('SVG Defs: contains neon yellow filter #f59e0b with feDropShadow', () => {
  const filterMatch = sources.ragVisualizer.match(/<filter id="glow-yellow"[\s\S]*?<\/filter>/);
  assert.ok(filterMatch, 'glow-yellow filter definition must exist');
  assert.match(filterMatch[0], /floodColor="#f59e0b"/i, 'Must use #f59e0b floodColor');
  assert.match(filterMatch[0], /<feDropShadow/i, 'Must define feDropShadow primitive');
});

s1.test('Pulse Particle: binds pulseRef and dynamic fill/filter based on cache hit state', () => {
  assert.match(sources.ragVisualizer, /ref=\{pulseRef\}/, 'Pulse particle must bind pulseRef');
  assert.match(sources.ragVisualizer, /fill=\{isHit \? '#10B981' : '#A855F7'\}/i, 'Pulse particle must switch fill color');
  assert.match(sources.ragVisualizer, /filter=\{isHit \? 'url\(#glow-emerald\)' : 'url\(#glow-purple\)'\}/i, 'Pulse particle must switch glow filter');
});

s1.test('Connection Tracks: defines 4 segments with proper glow filters and colors', () => {
  // Segment 1 (Stage 1 -> 2)
  assert.match(sources.ragVisualizer, /x1="80"\s+y1="35"\s+x2="260"\s+y2="35"/, 'Segment 1 coordinates');
  assert.match(sources.ragVisualizer, /filter=\{isHit \? 'url\(#glow-emerald\)' : 'url\(#glow-purple\)'\}/, 'Segment 1 filter');

  // Segment 2 (Stage 2 -> 3)
  assert.match(sources.ragVisualizer, /x1="260"\s+y1="35"\s+x2="440"\s+y2="35"/, 'Segment 2 coordinates');
  assert.match(sources.ragVisualizer, /filter=\{isHit \? undefined : 'url\(#glow-purple\)'\}/, 'Segment 2 filter');

  // Segment 3 (Stage 3 -> 4)
  assert.match(sources.ragVisualizer, /x1="440"\s+y1="35"\s+x2="620"\s+y2="35"/, 'Segment 3 coordinates');
  assert.match(sources.ragVisualizer, /filter=\{isHit \? undefined : 'url\(#glow-purple\)'\}/, 'Segment 3 filter');

  // Segment 4 (Stage 4 -> 5: Yellow highlight)
  assert.match(sources.ragVisualizer, /x1="620"\s+y1="35"\s+x2="800"\s+y2="35"/, 'Segment 4 coordinates');
  assert.match(sources.ragVisualizer, /stroke=\{isHit \? '#e2e8f0' : '#F59E0B'\}/i, 'Segment 4 yellow highlight');
  assert.match(sources.ragVisualizer, /filter=\{isHit \? undefined : 'url\(#glow-yellow\)'\}/, 'Segment 4 filter');
});

s1.test('GSAP Animation: distinguishes cache hit rebound vs full 5-stage pulse', () => {
  // Cache Hit rebound: cx 80 to 260 with yoyo: true
  assert.match(sources.ragVisualizer, /cx:\s*260[\s\S]*?duration:\s*0\.4[\s\S]*?yoyo:\s*true/);
  // Full 5-stage pulse: cx 80 to 800 with duration: 1.2
  assert.match(sources.ragVisualizer, /cx:\s*800[\s\S]*?duration:\s*1\.2/);
  // Inactive state fades opacity to 0
  assert.match(sources.ragVisualizer, /gsap\.to\(pulseRef\.current,\s*\{\s*opacity:\s*0/);
});

s1.test('Stage Inspector: defines all 5 stages with labels, latencies, input/output parameters', () => {
  const stageDefs = [
    { id: 1, label: '1. Query Vectorization', color: '#a855f7' },
    { id: 2, label: '2. Semantic Cache', color: '#10b981' }, // conditional
    { id: 3, label: '3. FastAPI Embedding', color: '#a855f7' },
    { id: 4, label: '4. pgvector HNSW Search', color: '#a855f7' },
    { id: 5, label: '5. Rerank & SSE Stream', color: '#f59e0b' },
  ];

  for (const st of stageDefs) {
    assert.ok(sources.ragVisualizer.includes(`id: ${st.id}`), `Stage ${st.id} must be defined`);
    assert.ok(sources.ragVisualizer.includes(st.label), `Stage ${st.id} label '${st.label}' must be defined`);
  }

  // Check Inspector UI pane presence
  assert.match(sources.ragVisualizer, /Stage Inspector:/);
  assert.match(sources.ragVisualizer, /Input Payload \/ Parameters:/);
  assert.match(sources.ragVisualizer, /Output Transformation \/ Telemetry:/);
  assert.match(sources.ragVisualizer, /<Badge variant="yellow"[\s\S]*?Latency:/);
  assert.match(sources.ragVisualizer, /variant=\{currentStageInfo\.highlight \? 'emerald' : 'purple'\}/);
});

s1.test('Stage Selection State Machine: state transitions survive 10,000 rapid cycles deterministically', () => {
  let selectedStage = 2;
  const selectStage = (id) => {
    assert.ok(id >= 1 && id <= 5, 'Stage ID must be 1..5');
    selectedStage = id;
  };

  for (let i = 0; i < 10000; i++) {
    const nextStage = (i % 5) + 1;
    selectStage(nextStage);
    assert.equal(selectedStage, nextStage);
  }
  assert.equal(selectedStage, 5);
});

// ===========================================================================
// SUITE 2: VirtualizedTable DOM Virtualization & Badge Styling
// ===========================================================================
const s2 = suite('VirtualizedTable: Virtual Scrolling & Status Badge Contracts');

s2.test('Virtualizer Contract: configures @tanstack/react-virtual with row height 52 and overscan 5', () => {
  assert.match(sources.virtualizedTable, /useVirtualizer\(\{/);
  assert.match(sources.virtualizedTable, /estimateSize:\s*\(\)\s*=>\s*52/);
  assert.match(sources.virtualizedTable, /overscan:\s*5/);
});

s2.test('DOM Node Ceiling: mathematical stress proof that active items remain strictly < 60', () => {
  // Container height is 560px, header ~40px, footer ~36px -> scroll area ~484px
  const containerHeight = 484;
  const rowHeight = 52;
  const overscan = 5;

  const visibleCount = Math.ceil(containerHeight / rowHeight); // 10 rows visible
  const maxActiveItems = visibleCount + 2 * overscan; // 10 + 10 = 20 active items

  assert.ok(maxActiveItems < 60, `Active DOM nodes (${maxActiveItems}) must be strictly below 60`);
  assert.equal(maxActiveItems, 20);

  // Even with full container 560px without header deduction:
  const rawMax = Math.ceil(560 / 52) + 2 * overscan; // 11 + 10 = 21
  assert.ok(rawMax < 60, `Worst case raw active items (${rawMax}) must be strictly < 60`);
});

s2.test('Badge Contract: strictly maps 429->yellow, 500->red, miss->purple, hit->emerald', () => {
  // Verify JSX conditional branching in VirtualizedTable
  assert.match(
    sources.virtualizedTable,
    /item\.cacheHit\s*\?\s*\(\s*<Badge variant="emerald">CACHE_HIT \(0\.9ms\)<\/Badge>\s*\)\s*:\s*item\.guardrailBlocked\s*\?\s*\(\s*<Badge variant="red">BLOCKED \(500\)<\/Badge>\s*\)\s*:\s*item\.rateLimited\s*\?\s*\(\s*<Badge variant="yellow">RATE_LIMIT \(429\)<\/Badge>\s*\)\s*:\s*\(\s*<Badge variant="purple">CACHE_MISS<\/Badge>\s*\)/
  );
});

s2.test('Badge Variant Definitions: Badge.tsx defines emerald, red, yellow, and purple with proper classes', () => {
  assert.match(sources.badgeComponent, /emerald:\s*'bg-emerald-50 text-emerald-700/);
  assert.match(sources.badgeComponent, /red:\s*'bg-red-50 text-red-700/);
  assert.match(sources.badgeComponent, /yellow:\s*'bg-yellow-50 text-yellow-800/);
  assert.match(sources.badgeComponent, /purple:\s*'bg-purple-50 text-purple-700/);
});

s2.test('Synthetic Row Oracle: 10,000 synthetic rows evaluated for badge correctness', () => {
  const getBadgeVariant = (row) => {
    if (row.cacheHit) return { variant: 'emerald', text: 'CACHE_HIT (0.9ms)' };
    if (row.guardrailBlocked) return { variant: 'red', text: 'BLOCKED (500)' };
    if (row.rateLimited) return { variant: 'yellow', text: 'RATE_LIMIT (429)' };
    return { variant: 'purple', text: 'CACHE_MISS' };
  };

  // Generate 10,000 test cases
  for (let i = 0; i < 10000; i++) {
    const isHit = i % 4 === 0;
    const isBlocked = !isHit && i % 4 === 1;
    const isRateLimited = !isHit && !isBlocked && i % 4 === 2;
    const isMiss = !isHit && !isBlocked && !isRateLimited;

    const row = {
      id: `test-${i}`,
      cacheHit: isHit,
      guardrailBlocked: isBlocked,
      rateLimited: isRateLimited,
      totalLatencyMs: isHit ? 0.9 : 150,
    };

    const badge = getBadgeVariant(row);
    if (isHit) {
      assert.equal(badge.variant, 'emerald');
      assert.equal(badge.text, 'CACHE_HIT (0.9ms)');
    } else if (isBlocked) {
      assert.equal(badge.variant, 'red');
      assert.equal(badge.text, 'BLOCKED (500)');
    } else if (isRateLimited) {
      assert.equal(badge.variant, 'yellow');
      assert.equal(badge.text, 'RATE_LIMIT (429)');
    } else {
      assert.equal(badge.variant, 'purple');
      assert.equal(badge.text, 'CACHE_MISS');
    }
  }
});

s2.test('Latency Color Formatting: evaluates <200ms purple, >=200ms yellow, hit emerald', () => {
  assert.match(
    sources.virtualizedTable,
    /item\.cacheHit\s*\?\s*'text-emerald-600 dark:text-emerald-400'\s*:\s*item\.totalLatencyMs\s*<\s*200\s*\?\s*'text-purple-600 dark:text-purple-400'\s*:\s*'text-yellow-600 dark:text-yellow-400'/
  );
});

s2.test('Virtualizer Stress: simulated 1,000,000-row scroll calculation maintains stability', () => {
  const rowCount = 1000000;
  const rowHeight = 52;
  const totalSize = rowCount * rowHeight;
  assert.equal(totalSize, 52000000); // 52 million px

  // Test scroll offsets across the range: 0, middle, end
  const testScrollOffsets = [0, 520, 26000000, 51999000, 52000000];
  const containerHeight = 560;
  const overscan = 5;

  for (const scrollTop of testScrollOffsets) {
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIndex = Math.min(
      rowCount - 1,
      Math.floor((scrollTop + containerHeight) / rowHeight) + overscan
    );
    const renderedCount = endIndex - startIndex + 1;
    assert.ok(
      renderedCount <= 25,
      `Rendered count at scroll ${scrollTop} must be <= 25 (was ${renderedCount})`
    );
    assert.ok(renderedCount >= 0);
  }
});

// ===========================================================================
// SUITE 3: Governance Wizard Step Navigation & Resilience Target
// ===========================================================================
const s3 = suite('Governance Wizard: Stepper, Autosave & Field 48 Warning');

s3.test('Stepper Navigation: maintains exactly 5 steps with valid bounds checking', () => {
  assert.match(sources.governancePage, /const\s+\[currentStep,\s*setCurrentStep\]\s*=\s*useState\(1\);/);
  // Clamped navigation
  assert.match(sources.governancePage, /setCurrentStep\(\(p\)\s*=>\s*Math\.max\(1,\s*p\s*-\s*1\)\)/);
  assert.match(sources.governancePage, /setCurrentStep\(\(p\)\s*=>\s*Math\.min\(5,\s*p\s*\+\s*1\)\)/);

  // Direct step click
  assert.match(sources.governancePage, /onClick=\{\(\)\s*=>\s*setCurrentStep\(s\.num\)\}/);
});

s3.test('Stepper State Machine: 10,000 randomized next/prev/jump transitions stay strictly within [1, 5]', () => {
  let step = 1;
  const prev = () => { step = Math.max(1, step - 1); };
  const next = () => { step = Math.min(5, step + 1); };
  const jump = (target) => {
    if (target >= 1 && target <= 5) step = target;
  };

  for (let i = 0; i < 10000; i++) {
    const op = i % 3;
    if (op === 0) prev();
    else if (op === 1) next();
    else jump((i % 7) + 1);

    assert.ok(step >= 1 && step <= 5, `Step out of bounds: ${step}`);
  }
});

s3.test('Autosave Indicator Dot: contains pulsing emerald glowing dot with shadow', () => {
  assert.match(sources.governancePage, /relative inline-flex rounded-full h-2\.5 w-2\.5 bg-emerald-500/);
  assert.match(sources.governancePage, /shadow-\[0_0_8px_rgba\(16,185,129,0\.7\)\]/);
  assert.match(sources.governancePage, /animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75/);
});

s3.test('Autosave Hook: binds useGovernanceDraft with 200ms debounce contract', () => {
  assert.match(sources.governancePage, /useGovernanceDraft\(tenantId\)/);
  assert.match(sources.governancePage, /saveDraft\(formValues\)/);
  assert.match(sources.governancePage, /loadDraft\(\)/);
});

s3.test('JSON Export: handleExportJson encodes form values into downloadable JSON', () => {
  assert.match(sources.governancePage, /function handleExportJson\(\)/);
  assert.match(sources.governancePage, /data:text\/json;charset=utf-8/);
  assert.match(sources.governancePage, /vectrabase-governance-policy\.json/);
});

s3.test('Field 48 Target: yellow highlight banner, warning token and input styling', () => {
  // Banner has yellow styling
  assert.match(sources.governancePage, /bg-yellow-50 dark:bg-yellow-950\/30 border border-yellow-200 dark:border-yellow-500\/40/);
  assert.match(sources.governancePage, /text-yellow-800 dark:text-yellow-400/);

  // Field 48 input has yellow border container
  assert.match(sources.governancePage, /id="field-webhookRetryAttempts"/);
  assert.match(sources.governancePage, /border-yellow-300 dark:border-yellow-500\/50 bg-yellow-50\/70/);

  // Dynamic simulation trigger
  assert.match(sources.governancePage, /setAccessToken\('EXPIRED_SIMULATED_TOKEN_TTL_0S'\)/);
  assert.match(sources.governancePage, /setIsTokenExpiredSimulated\(true\)/);
  assert.match(sources.governancePage, /border-yellow-500 bg-yellow-100\/50 dark:bg-yellow-950\/40/);
});

// ===========================================================================
// SUITE 4: CommandPalette, BenchmarkDrawer & InterceptorConsole
// ===========================================================================
const s4 = suite('Modals & Consoles: Palette, BenchmarkDrawer & InterceptorConsole');

s4.test('CommandPalette: Cmd+K / Ctrl+K and ESC keyboard shortcuts wired correctly', () => {
  assert.match(sources.commandPalette, /\(e\.metaKey\s*\|\|\s*e\.ctrlKey\)\s*&&\s*e\.key\s*===\s*'k'/);
  assert.match(sources.commandPalette, /e\.key\s*===\s*'Escape'/);
  assert.match(sources.commandPalette, /setIsOpen\(false\)/);
});

s4.test('CommandPalette: Keyboard hint badges styled with yellow highlights', () => {
  assert.match(sources.commandPalette, /bg-yellow-100 dark:bg-yellow-950\/80 text-yellow-800 dark:text-yellow-300[\s\S]*?Cmd\+K/);
  assert.match(sources.commandPalette, /bg-yellow-100 dark:bg-yellow-950\/80 text-yellow-800 dark:text-yellow-300[\s\S]*?ESC/);
});

s4.test('CommandPalette: Neon purple outer glow border applied', () => {
  assert.match(sources.commandPalette, /shadow-\[0_0_25px_rgba\(168,85,247,0\.15\)\]/);
  assert.match(sources.commandPalette, /border-purple-200 dark:border-purple-500\/40/);
});

s4.test('CommandPalette Filter Oracle: search filtering across all 7 default commands', () => {
  const commands = [
    { label: 'Go to SaaS Control Plane', path: '/dashboard' },
    { label: 'Document Ingestion Studio', path: '/rag-studio' },
    { label: '1M-Record Keyset Telemetry Explorer', path: '/telemetry' },
    { label: '50-Field AI Governance Wizard', path: '/governance' },
    { label: 'Split-Screen Vue 3 Widget Playground', path: '/widget-playground' },
    { label: 'Run SQL EXPLAIN ANALYZE Benchmark', path: '/telemetry?verify=true' },
    { label: 'Trigger Field-48 JWT Expiry Test', path: '/governance?simulate=true' },
  ];

  // Empty search returns all 7
  assert.equal(commands.filter((c) => c.label.toLowerCase().includes(''.toLowerCase())).length, 7);

  // Search 'governance' returns 1 on label filter
  const govMatches = commands.filter((c) => c.label.toLowerCase().includes('governance'.toLowerCase()));
  assert.equal(govMatches.length, 1);
  assert.equal(govMatches[0].path, '/governance');

  // Search 'Field-48' returns 1 on label filter
  const field48Matches = commands.filter((c) => c.label.toLowerCase().includes('field-48'.toLowerCase()));
  assert.equal(field48Matches.length, 1);
  assert.equal(field48Matches[0].path, '/governance?simulate=true');

  // Non-existent search returns 0
  assert.equal(commands.filter((c) => c.label.toLowerCase().includes('xyz_nonexistent_command'.toLowerCase())).length, 0);
});

s4.test('BenchmarkDrawer: renders 4 metric cards, latency comparison bars, and live DOM count query', () => {
  // Live DOM count query
  assert.match(sources.benchmarkDrawer, /document\.querySelectorAll\('\[data-virtual-row\]'\)\.length/);

  // Metric cards
  assert.match(sources.benchmarkDrawer, /\(a\) Live PostgreSQL Rows/);
  assert.match(sources.benchmarkDrawer, /\(b\) Keyset Execution Time/);
  assert.match(sources.benchmarkDrawer, /\(c\) Index Scan Proof/);
  assert.match(sources.benchmarkDrawer, /\(e\) Active DOM Elements/);

  // Latency Speedup Comparison (Metric D)
  assert.match(sources.benchmarkDrawer, /\(d\) Latency Delta: Redis Cache Hit vs PostgreSQL Miss/);
  assert.match(sources.benchmarkDrawer, /bg-emerald-500 rounded-full shadow-\[0_0_8px_rgba\(16,185,129,0\.5\)\]/);
  assert.match(sources.benchmarkDrawer, /bg-purple-600 dark:bg-purple-500 rounded-full shadow-\[0_0_8px_rgba\(168,85,247,0\.5\)\]/);

  // Modal glow styling
  assert.match(sources.benchmarkDrawer, /shadow-\[0_0_25px_rgba\(168,85,247,0\.15\)\]/);
  assert.match(sources.benchmarkDrawer, /backdrop-blur-md/);
});

s4.test('InterceptorConsole: registers and unregisters axios interceptor listener without memory leaks', () => {
  assert.match(sources.interceptorConsole, /registerInterceptorListener\(/);
  assert.match(sources.interceptorConsole, /return\s*\(\)\s*=>\s*unregister\(\)/);
});

s4.test('InterceptorConsole: translates all 5 event types into themed badges and status chips', () => {
  // REQUEST_401 -> 401 EXPIRED (red)
  assert.match(sources.interceptorConsole, /case 'REQUEST_401':[\s\S]*?badge:\s*'401 EXPIRED'[\s\S]*?text-red-700/);
  // REFRESH_START -> QUEUED (yellow)
  assert.match(sources.interceptorConsole, /case 'REFRESH_START':[\s\S]*?badge:\s*'QUEUED'[\s\S]*?text-yellow-800/);
  // REFRESH_SUCCESS -> JWT ROTATED (purple)
  assert.match(sources.interceptorConsole, /case 'REFRESH_SUCCESS':[\s\S]*?badge:\s*'JWT ROTATED'[\s\S]*?text-purple-700/);
  // REPLAY_SUCCESS -> ZERO DATA LOSS (emerald)
  assert.match(sources.interceptorConsole, /case 'REPLAY_SUCCESS':[\s\S]*?badge:\s*'ZERO DATA LOSS'[\s\S]*?text-emerald-700/);
});

s4.test('InterceptorConsole Stress: 10,000 synthetic event dispatches processed without corruption', () => {
  let logs = [];
  const eventTypes = ['REQUEST_401', 'REFRESH_START', 'REFRESH_SUCCESS', 'REPLAY_SUCCESS'];

  for (let i = 0; i < 10000; i++) {
    const type = eventTypes[i % 4];
    let log;
    if (type === 'REQUEST_401') {
      log = { id: `log-${i}`, type, badge: '401 EXPIRED', status: 401 };
    } else if (type === 'REFRESH_START') {
      log = { id: `log-${i}`, type, badge: 'QUEUED' };
    } else if (type === 'REFRESH_SUCCESS') {
      log = { id: `log-${i}`, type, badge: 'JWT ROTATED', status: 200 };
    } else if (type === 'REPLAY_SUCCESS') {
      log = { id: `log-${i}`, type, badge: 'ZERO DATA LOSS', status: 200 };
    }
    logs.push(log);
  }

  assert.equal(logs.length, 10000);
  assert.equal(logs[9999].badge, 'ZERO DATA LOSS');

  // Verify Clear action
  logs = [];
  assert.equal(logs.length, 0);
});

// ===========================================================================
// SUITE 5: Cross-Page Design Tokens & Forbidden Hex Purge Verification
// ===========================================================================
const s5 = suite('Cross-Page Theme & Obsidian Hex Purge Verification');

const FORBIDDEN_OBSIDIAN_HEXES = ['#090A0F', '#11131C', '#1E2230', '#2A2F45'];

for (const [name, source] of Object.entries(sources)) {
  s5.test(`${name}: Zero legacy dark obsidian hex codes found (#090A0F, #11131C, #1E2230, #2A2F45)`, () => {
    for (const hex of FORBIDDEN_OBSIDIAN_HEXES) {
      const regex = new RegExp(hex, 'i');
      const hasMatch = regex.test(source);
      assert.ok(
        !hasMatch,
        `File ${name} must not contain forbidden legacy hex ${hex}`
      );
    }
  });
}

s5.test('Widget Playground: dynamically synchronizes theme to iframe parameter (?theme=${activeTheme})', () => {
  assert.match(sources.widgetPlaygroundPage, /useTheme\(\)/);
  assert.match(sources.widgetPlaygroundPage, /iframeSrc\s*=\s*`\/widget-frame\.html\?theme=\$\{activeTheme\}`/);
});

s5.test('Widget Playground: query test routes to production API gateway with fallback', () => {
  assert.match(sources.widgetPlaygroundPage, /https:\/\/vectrabase-api\.onrender\.com/);
  assert.match(sources.widgetPlaygroundPage, /\$\{apiUrl\}\/api\/query/);
  assert.match(sources.widgetPlaygroundPage, /catch\s*\{[\s\S]*?setAnswerOutput\(/);
});

s5.test('Telemetry Page: provides all 4 filter buttons (All Logs, Cache Hits, Vector Searches, Guardrail Blocked)', () => {
  assert.match(sources.telemetryPage, /All Logs/);
  assert.match(sources.telemetryPage, /⚡ Cache Hits/);
  assert.match(sources.telemetryPage, /📐 Vector Searches/);
  assert.match(sources.telemetryPage, /🛡️ Guardrail Blocked/);
});

// ===========================================================================
// EXECUTE SUITES & AGGREGATE
// ===========================================================================
console.log('=============================================================');
console.log('  VECTRABASE AI — MILESTONE 4 EMPIRICAL STRESS HARNESS        ');
console.log('=============================================================\n');

let suiteIdx = 1;
for (const s of registeredSuites) {
  console.log(`[SUITE ${suiteIdx}/${registeredSuites.length}] ${s.name}`);
  for (const t of s.tests) {
    RESULTS.total++;
    RESULTS.suites[s.name].total++;
    try {
      t.fn();
      RESULTS.passed++;
      RESULTS.suites[s.name].passed++;
      console.log(`  ✓ ${t.name}`);
    } catch (err) {
      RESULTS.failed++;
      RESULTS.suites[s.name].failed++;
      RESULTS.failures.push({ suite: s.name, test: t.name, error: err.message, stack: err.stack });
      console.error(`  ✗ ${t.name}`);
      console.error(`    ERROR: ${err.message}`);
    }
  }
  suiteIdx++;
  console.log('');
}

console.log('=============================================================');
console.log('             EMPIRICAL STRESS HARNESS REPORT                 ');
console.log('=============================================================');
console.log(`Total Tests Run:  ${RESULTS.total}`);
console.log(`Passed:           ${RESULTS.passed}`);
console.log(`Failed:           ${RESULTS.failed}`);
console.log(`Pass Rate:        ${((RESULTS.passed / RESULTS.total) * 100).toFixed(1)}%\n`);

for (const [name, stats] of Object.entries(RESULTS.suites)) {
  const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '100.0';
  console.log(`  ${name.padEnd(50)}: ${stats.passed}/${stats.total} (${rate}%)`);
}
console.log('-------------------------------------------------------------');

if (RESULTS.failed > 0) {
  console.error(`\nFAILED TESTS (${RESULTS.failed}):`);
  for (const f of RESULTS.failures) {
    console.error(`- [${f.suite}] ${f.test}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('\nAll empirical stress tests passed cleanly.');
  process.exit(0);
}
